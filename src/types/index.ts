import type { Database } from './database'

// Base types from database
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Exercise = Database['public']['Tables']['exercises']['Row']
export type WorkoutTemplate = Database['public']['Tables']['workout_templates']['Row']
export type WorkoutTemplateItem = Database['public']['Tables']['workout_template_items']['Row']
export type IntervalSet = Database['public']['Tables']['interval_sets']['Row']
export type Preferences = Database['public']['Tables']['preferences']['Row']
export type Program = Database['public']['Tables']['programs']['Row']
export type ProgramWeek = Database['public']['Tables']['program_weeks']['Row']
export type ProgramDay = Database['public']['Tables']['program_days']['Row']
export type ActivityLog = Database['public']['Tables']['activity_logs']['Row']

// Enums
export type Pillar = 'strength' | 'tai_chi' | 'running' | 'mobility' | 'cardio'
export type Difficulty = 'beginner' | 'easy' | 'moderate'
export type Mode = 'short' | 'full'
export type FitnessLevel = 'beginner' | 'easy' | 'moderate'

// Extended types for application use
export interface ExerciseWithDetails extends Exercise {
  template_items?: WorkoutTemplateItem[]
}

export interface WorkoutTemplateWithItems extends WorkoutTemplate {
  items: WorkoutTemplateItem[]
  exercises?: Exercise[]
}

export interface IntervalStep {
  label: string
  work_sec: number
  rest_sec: number
  repeat: number
}

export interface IntervalSetWithSteps extends Omit<IntervalSet, 'steps'> {
  steps: IntervalStep[]
}

// Workout block structure for offline execution
export interface WorkoutBlock {
  type: Pillar
  title: string
  items: WorkoutItem[]
  rest_sec?: number
  estimated_duration_min: number
}

export interface WorkoutItem {
  id?: string
  name: string
  reps?: string
  notes?: string
  rest_sec?: number
  cues?: string[]
  exercise_id?: string
}

// Program generation types
export interface ProgramGenerationOptions {
  preferences: Preferences
  library: {
    exercises: Exercise[]
    templates: WorkoutTemplateWithItems[]
    intervals: IntervalSetWithSteps[]
  }
}

export interface GeneratedProgram {
  program: Omit<Program, 'id' | 'created_at'>
  weeks: Omit<ProgramWeek, 'id' | 'program_id'>[]
  days: Omit<ProgramDay, 'id' | 'program_id'>[]
}

// Timer and workout session types
export interface TimerState {
  isRunning: boolean
  isPaused: boolean
  currentPhase: 'warmup' | 'work' | 'rest' | 'cooldown' | 'complete'
  currentStep: number
  timeRemaining: number
  totalSteps: number
}

export interface WorkoutSession {
  id?: string
  date: string
  program_day: ProgramDay
  blocks: WorkoutBlock[]
  mode: Mode
  estimated_duration_min: number
  actual_duration_min?: number
  completed: boolean
  rpe?: number
  notes?: string
}

// UI and form types
export interface OnboardingData {
  week_length: number
  days_per_week: number
  max_duration_min: number
  default_mode: Mode
  fitness_level: FitnessLevel
  pillars: Pillar[]
  primary_focus?: Pillar
  equipment: Record<string, boolean>
}

export interface UserSettings {
  sound_enabled: boolean
  voice_enabled: boolean
  theme: 'light' | 'dark' | 'system'
  units: 'metric' | 'imperial'
}

// Equipment types
export interface Equipment {
  bands: boolean
  dumbbells: boolean
  kettlebell: boolean
  pullup_bar: boolean
  yoga_mat: boolean
  foam_roller: boolean
}

// Progress tracking
export interface WeeklyProgress {
  week_number: number
  completed_sessions: number
  total_sessions: number
  average_rpe?: number
  total_duration_min: number
  notes?: string
}

// Offline queue types
export interface OfflineActivityLog {
  id: string
  user_id: string
  date: string
  program_id?: string
  week_number?: number
  day_of_week?: number
  completed: boolean
  duration_actual_min?: number
  rpe?: number
  notes?: string
  timestamp: number // for ordering
  synced: boolean
}

// Search and library types
export interface SearchFilters {
  pillar?: Pillar[]
  difficulty?: Difficulty[]
  duration_min?: [number, number]
  equipment?: string[]
}

export interface LibraryItem {
  id: string
  type: 'exercise' | 'template' | 'interval'
  name: string
  pillar: Pillar
  difficulty?: Difficulty
  description?: string
  estimated_duration_min?: number
}

// Auth types
export interface AuthState {
  user: any | null
  profile: Profile | null
  loading: boolean
  initialized: boolean
}

// API response types
export interface ApiResponse<T = any> {
  data?: T
  error?: string
  success: boolean
}

// Voice synthesis types
export interface VoiceSettings {
  enabled: boolean
  rate: number
  pitch: number
  volume: number
  voice?: SpeechSynthesisVoice
}