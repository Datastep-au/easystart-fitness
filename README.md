# EasyStart Fitness

A local-first Progressive Web App (PWA) built with React, TypeScript, Vite, and TailwindCSS, integrated with Supabase for backend services. EasyStart Fitness generates personalized 10–12 week fitness programs for complete beginners, featuring five core pillars: Strength, Tai Chi, Running, Mobility, and Cardio.

## ✨ Features

### 🎯 Personalized Programs
- **Smart Generation**: Creates custom 10-12 week programs based on your fitness level, available time, equipment, and preferences
- **Five Pillars**: Strength, Tai Chi, Running, Mobility & Cardio with intelligent weekly distribution
- **Time Budget Respect**: Never exceeds your chosen session limit (15-45 minutes) with Short/Full mode support
- **Progressive Overload**: Built-in progression with deload weeks and themed focuses

### 📱 PWA Features
- **Offline First**: Works completely offline with local caching and sync when online
- **Installable**: Full PWA installation on mobile and desktop
- **Responsive**: Optimized for all screen sizes with mobile-first design
- **Fast Loading**: Vite-powered build with service worker caching

### 🏋️ Workout Experience
- **Guided Sessions**: Step-by-step workout execution with timers
- **Voice Cues**: Text-to-speech guidance with exercise cues and form reminders
- **Run Timer**: Dedicated interval timer for running/cardio with TTS announcements
- **Progress Tracking**: RPE logging, duration tracking, and session history

### 🎨 Modern UI/UX
- **Dark/Light Themes**: System-aware theme with manual override
- **Accessible**: WCAG compliant with keyboard navigation and screen reader support
- **Reduced Motion**: Respects user's motion preferences
- **Tailored Components**: Custom fitness-focused UI components

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account (free tier works)

### 1. Clone and Install
```bash
git clone <your-repo-url>
cd easystart-fitness
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor in your Supabase dashboard
3. Copy and paste the entire contents of `supabase-schema.sql` and run it
4. Go to Settings → API to get your project URL and anon key

### 3. Environment Configuration
```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Development
```bash
npm run dev
```

Visit `http://localhost:5173` to see your app!

### 5. Production Build
```bash
npm run build
npm run preview
```

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: TailwindCSS with custom design system
- **State**: Zustand for global state management
- **Routing**: React Router v6
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **PWA**: Vite PWA plugin with Workbox
- **Icons**: Lucide React

### Project Structure
```
src/
├── components/
│   ├── auth/          # Authentication components
│   ├── layout/        # Layout and navigation
│   ├── ui/           # Reusable UI components
│   ├── workout/      # Workout-specific components
│   └── timer/        # Timer components
├── pages/            # Route pages
├── store/            # Zustand store slices
├── types/            # TypeScript type definitions
├── utils/            # Utility functions
│   ├── estimates.ts  # Duration estimation
│   ├── timeBudget.ts # Time budget management
│   └── planBuilder.ts # Program generation
└── lib/              # External service configurations
```

### Database Schema
The complete schema includes:
- **profiles**: User profile data
- **exercises**: Exercise library with cues, progressions, regressions
- **workout_templates**: Structured workout templates
- **interval_sets**: Running/cardio interval programs
- **preferences**: User fitness preferences and equipment
- **programs**: Generated workout programs
- **program_days**: Individual workout days
- **activity_logs**: Workout completion and progress data

Row Level Security (RLS) is enabled on all tables to ensure data privacy.

## 📖 Key Concepts

### Program Generation
The `planBuilder.ts` utility creates personalized programs using:
- **Weekly Themes**: Foundation → Building → Deload → Mastery progression
- **Time Budgeting**: Intelligent exercise selection to fit time constraints
- **Pillar Distribution**: Balanced scheduling across chosen fitness pillars
- **Progressive Overload**: Automatic progression with strategic deload weeks

### Exercise Library
- **50+ Exercises**: Comprehensive library covering all five pillars
- **Detailed Cues**: Step-by-step form instructions for beginners
- **Progressions**: Clear paths to advance exercises
- **Regressions**: Easier variations for accessibility

### Offline Support
- **Service Worker**: Caches app shell and essential data
- **Queue System**: Stores workout logs offline and syncs when online
- **Local Storage**: Preserves user settings and recent program data

## 🔧 Configuration

### Optional: Google OAuth Setup
1. In Supabase dashboard, go to Authentication → Settings
2. Add Google as an OAuth provider
3. Configure OAuth redirect URLs

### Optional: Custom Domain
For PWA installation, configure your custom domain in:
- Supabase dashboard (Authentication → URL Configuration)
- Vite config (`base` option)

## 📱 Usage Guide

### First-Time Setup
1. **Sign Up**: Create account with email/password or magic link
2. **Onboarding**: Complete 5-step preference setup:
   - Program length (10-12 weeks)
   - Days per week (3-6)
   - Session duration (15-45 minutes)
   - Fitness level (Beginner/Easy/Moderate)
   - Selected pillars and primary focus
   - Available equipment

### Daily Workflow
1. **Today View**: See your personalized daily workout
2. **Mode Toggle**: Switch between Short (20min) and Full (45min) modes
3. **Start Workout**: Follow guided session with timers
4. **Complete & Log**: Rate effort (RPE) and add notes

### Features Overview
- **Library**: Browse exercises with detailed instructions
- **Plan**: View weekly program and progress
- **Timer**: Use interval timer for running/cardio sessions
- **Settings**: Customize app preferences and export data

## 🧪 Development

### Available Scripts
- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run preview` - Preview production build
- `npm run lint` - ESLint checking
- `npm run type-check` - TypeScript checking

### Database Seed Data
The schema includes comprehensive seed data:
- **30+ Strength exercises** with beginner-friendly progressions
- **12+ Tai Chi movements** with traditional form names
- **8+ Mobility exercises** including CARs and stretches
- **Progressive interval sets** for 10-week running/cardio programs

### Customization
- **Themes**: Extend `tailwind.config.js` for custom colors
- **Exercises**: Add to database via Supabase dashboard
- **Program Logic**: Modify `planBuilder.ts` for custom progressions
- **UI Components**: All components use consistent design tokens

## 🔒 Security & Privacy

### Data Protection
- **Row Level Security**: All user data is isolated
- **Local-First**: Core functionality works offline
- **No Tracking**: No analytics or third-party tracking
- **Secure Auth**: Supabase handles authentication securely

### Health Disclaimer
The app includes appropriate health disclaimers and encourages users to:
- Consult healthcare providers for medical concerns
- Stop exercises that cause pain
- Start slowly and progress gradually

## 🤝 Contributing

### Development Setup
1. Follow the Quick Start guide above
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test thoroughly
4. Submit a pull request with clear description

### Guidelines
- Follow TypeScript strict mode
- Use existing UI components where possible
- Maintain accessibility standards
- Add comprehensive comments for complex logic
- Test offline functionality

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Supabase** for the excellent backend-as-a-service platform
- **Vite** for the lightning-fast development experience  
- **TailwindCSS** for the utility-first CSS framework
- **Lucide** for the beautiful icon library
- **The Fitness Community** for inspiration and exercise guidance

---

**Ready to start your fitness journey?** 💪

Set up your database, configure your environment, and let EasyStart Fitness create your personalized program today!