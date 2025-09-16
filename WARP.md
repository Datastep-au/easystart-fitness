# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Core Development
```bash
# Development server with hot reload
npm run dev

# Production build with TypeScript checking
npm run build

# Preview production build
npm run preview

# Linting
npm run lint
```

### Database Setup
```bash
# Copy environment template
cp .env.example .env.local

# Set up Supabase database (run schema in Supabase SQL Editor)
# File: supabase-schema.sql
```

### Build and Deployment
```bash
# Type checking only (used before build)
tsc -b

# Build optimized for GitHub Pages deployment
npm run build

# Preview built files locally
npm run preview
```

## Architecture Overview

### High-Level Architecture
EasyStart Fitness is a **local-first Progressive Web App** built with React, TypeScript, and Supabase. The application generates personalized 10-12 week fitness programs across five core pillars: Strength, Tai Chi, Running, Mobility, and Cardio.

### Key Architectural Patterns

#### 1. State Management - Zustand Store
- **Centralized Store**: Single Zustand store in `src/store/index.ts` with multiple slices
- **Slice Pattern**: AuthSlice, PreferencesSlice, ProgramSlice, WorkoutSlice, LibrarySlice, SettingsSlice, OfflineSlice
- **Offline-First**: Built-in offline queue system with automatic sync when online
- **Local Persistence**: User settings and offline data stored in localStorage

#### 2. Program Generation System
- **Core Algorithm**: `src/utils/planBuilder.ts` - Generates personalized workout programs
- **Time Budget Management**: `src/utils/timeBudget.ts` - Intelligent exercise selection to fit time constraints
- **Duration Estimation**: `src/utils/estimates.ts` - Calculates workout durations for planning
- **Weekly Progression**: 10-12 week themes with deload weeks and progressive overload

#### 3. Database Architecture
- **Supabase Backend**: PostgreSQL with Row Level Security (RLS) enabled
- **Multi-table Structure**: 
  - `exercises` - 50+ exercise library with cues and progressions
  - `workout_templates` - Structured workout templates with items
  - `interval_sets` - Running/cardio interval programs with JSON steps
  - `programs` + `program_days` - Generated user programs
  - `preferences` - User fitness preferences and equipment
  - `activity_logs` - Workout completion tracking

#### 4. Offline-First PWA Design
- **Service Worker**: Vite PWA plugin with Workbox for caching
- **Offline Queue**: Workout logs stored locally and synced when online
- **Local Storage**: Settings and recent data cached for offline use
- **Background Sync**: Automatic data synchronization on connection restore

### Application Flow

#### 1. Authentication & Onboarding
- **AuthGate Component**: Protects routes requiring authentication
- **5-Step Onboarding**: Collects preferences for program generation
- **Profile Management**: Supabase Auth with custom profiles table

#### 2. Program Generation
- **User Preferences → Algorithm**: `buildPersonalizedProgram()` creates structured program
- **Weekly Themes**: Foundation → Building → Deload → Mastery progression
- **Daily Scheduling**: Smart pillar distribution based on user's available days
- **Time Budgeting**: Exercises selected to fit exact time constraints (15-45 min sessions)

#### 3. Daily Workout Execution
- **Today View**: Shows current day's personalized workout
- **Mode Toggle**: Short (20min) vs Full (45min) session variants
- **Guided Sessions**: Step-by-step execution with timers and TTS voice cues
- **Progress Logging**: RPE (Rate of Perceived Exertion), duration, and notes

### Critical Code Patterns

#### Store Usage Pattern
```typescript
// Always use destructured selectors for performance
const { user, loadCurrentProgram, generateProgram } = useAppStore()

// For computed values, use getters
const todaysWorkout = useAppStore(state => state.getTodaysWorkout())
```

#### Offline-First Pattern
```typescript
// All data mutations should handle offline scenarios
try {
  await supabase.from('activity_logs').insert(data)
} catch (error) {
  // Fallback to offline queue
  get().addToOfflineQueue(data)
}
```

#### Program Generation Pattern
```typescript
// Program generation requires full preferences and library data
const program = buildPersonalizedProgram(preferences, {
  exercises: library.exercises,
  templates: library.templates,
  intervals: library.intervals
})
```

### Component Architecture

#### Route Structure
- **Public Routes**: `/auth/*` - Authentication pages
- **Protected Routes**: All others require AuthGate wrapper
- **Onboarding Gate**: Main app requires completed onboarding

#### Key Component Patterns
- **Layout Components**: `src/components/layout/` - Navigation and app shell
- **Feature Components**: `src/components/workout/`, `src/components/timer/` - Feature-specific UI
- **UI Components**: `src/components/ui/` - Reusable design system components
- **Page Components**: `src/pages/` - Route-level components

### Database Relationships

#### Core Entity Relationships
```
users (auth.users)
├── profiles (user metadata)
├── preferences (fitness settings)
└── programs
    ├── program_weeks (themes)
    └── program_days (daily workouts)
        ├── workout_templates → workout_template_items → exercises
        └── interval_sets (JSON steps)
```

#### Exercise Library Structure
- **Exercises**: Individual movements with cues, progressions, regressions
- **Workout Templates**: Pre-built workout sequences for pillars
- **Interval Sets**: Structured cardio/running programs with timed intervals

### Development Guidelines

#### TypeScript Usage
- **Strict Mode**: TypeScript strict mode enabled
- **Database Types**: Generated types in `src/types/database.ts` from Supabase
- **Application Types**: Extended types in `src/types/index.ts` for UI/business logic

#### Styling System
- **TailwindCSS**: Utility-first with custom design system
- **Theme Support**: Dark/light/system themes with CSS variables
- **Responsive Design**: Mobile-first approach with PWA optimization

#### Performance Considerations
- **Bundle Splitting**: Vite handles automatic code splitting
- **Service Worker Caching**: App shell and API responses cached
- **Zustand Subscriptions**: Use subscribeWithSelector for granular updates
- **Database Queries**: RLS policies ensure efficient data access

### Deployment & Environment

#### Environment Variables
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

#### Production Build
- **Base Path**: Configurable base path for GitHub Pages (`/easystart-fitness/`)
- **PWA Manifest**: Complete PWA configuration with app icons
- **Service Worker**: Workbox configuration for offline functionality

### Testing Strategy
- **No Testing Framework**: Currently no automated tests configured
- **Manual Testing**: Focus on offline functionality and PWA features
- **Database Testing**: Use Supabase dashboard for schema validation

### Common Development Tasks

#### Adding New Exercises
1. Insert into `exercises` table via Supabase dashboard
2. Include proper pillar, cues array, and progression/regression text
3. Set `is_public: true` for library inclusion

#### Modifying Program Generation
1. Edit algorithm in `src/utils/planBuilder.ts`
2. Test with different user preferences in development
3. Validate time budget calculations in `src/utils/timeBudget.ts`

#### Adding New Workout Pillars
1. Update `Pillar` type in `src/types/index.ts`
2. Add pillar support in program generation logic
3. Update database enum constraints in schema
4. Add UI components for new pillar type

#### Debugging Offline Issues
1. Check offline queue in browser DevTools → Application → Local Storage
2. Monitor network requests in Service Worker DevTools
3. Test sync behavior by toggling network connectivity