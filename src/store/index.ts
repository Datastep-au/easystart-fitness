import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { 
  AuthState, 
  Profile, 
  Preferences, 
  Program,
  ProgramDay,
  WorkoutSession,
  UserSettings,
  OfflineActivityLog,
  Exercise,
  WorkoutTemplateWithItems,
  IntervalSetWithSteps
} from '../types'
import { supabase } from '../lib/supabaseClient'

// Auth slice
interface AuthSlice extends AuthState {
  signIn: (email: string, password: string) => Promise<void>
  signInWithMagicLink: (email: string) => Promise<void>
  signUp: (email: string, password: string, displayName?: string) => Promise<void>
  signOut: () => Promise<void>
  initialize: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<void>
}

// Preferences slice
interface PreferencesSlice {
  preferences: Preferences | null
  loadPreferences: () => Promise<void>
  updatePreferences: (updates: Partial<Preferences>) => Promise<void>
  hasCompletedOnboarding: () => boolean
}

// Program slice
interface ProgramSlice {
  currentProgram: Program | null
  currentWeek: number
  programDays: ProgramDay[]
  todaysWorkout: ProgramDay | null
  loadCurrentProgram: () => Promise<void>
  generateProgram: (preferences: Preferences) => Promise<void>
  advanceWeek: () => Promise<void>
  repeatWeek: () => Promise<void>
  getTodaysWorkout: () => ProgramDay | null
}

// Workout session slice
interface WorkoutSlice {
  currentSession: WorkoutSession | null
  sessionHistory: WorkoutSession[]
  startSession: (programDay: ProgramDay, mode: 'short' | 'full') => void
  completeSession: (duration: number, rpe?: number, notes?: string) => Promise<void>
  pauseSession: () => void
  resumeSession: () => void
  cancelSession: () => void
  loadSessionHistory: (days?: number) => Promise<void>
}

// Library slice
interface LibrarySlice {
  exercises: Exercise[]
  templates: WorkoutTemplateWithItems[]
  intervals: IntervalSetWithSteps[]
  loadLibrary: () => Promise<void>
  searchLibrary: (query: string, pillar?: string) => {
    exercises: Exercise[]
    templates: WorkoutTemplateWithItems[]
    intervals: IntervalSetWithSteps[]
  }
}

// Settings slice
interface SettingsSlice {
  settings: UserSettings
  updateSettings: (updates: Partial<UserSettings>) => void
  loadSettings: () => void
  theme: 'light' | 'dark' | 'system'
  setTheme: (theme: 'light' | 'dark' | 'system') => void
}

// Offline slice
interface OfflineSlice {
  isOnline: boolean
  offlineQueue: OfflineActivityLog[]
  addToOfflineQueue: (log: Omit<OfflineActivityLog, 'id' | 'timestamp' | 'synced'>) => void
  syncOfflineData: () => Promise<void>
  setOnlineStatus: (isOnline: boolean) => void
}

// Combined store type
type AppStore = AuthSlice & PreferencesSlice & ProgramSlice & WorkoutSlice & LibrarySlice & SettingsSlice & OfflineSlice

export const useAppStore = create<AppStore>()(
  subscribeWithSelector((set, get) => ({
    // Auth state
    user: null,
    profile: null,
    loading: false,
    initialized: false,

    // Auth actions
    signIn: async (email: string, password: string) => {
      set({ loading: true })
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        if (error) throw error
        
        // Profile will be loaded by auth state change listener
      } catch (error: any) {
        console.error('Sign in error:', error)
        throw new Error(error.message || 'Failed to sign in')
      } finally {
        set({ loading: false })
      }
    },

    signInWithMagicLink: async (email: string) => {
      set({ loading: true })
      try {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        })
        if (error) throw error
      } catch (error: any) {
        console.error('Magic link error:', error)
        throw new Error(error.message || 'Failed to send magic link')
      } finally {
        set({ loading: false })
      }
    },

    signUp: async (email: string, password: string, displayName?: string) => {
      set({ loading: true })
      try {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: displayName || ''
            }
          }
        })
        if (error) throw error
      } catch (error: any) {
        console.error('Sign up error:', error)
        throw new Error(error.message || 'Failed to sign up')
      } finally {
        set({ loading: false })
      }
    },

    signOut: async () => {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Sign out error:', error)
        throw new Error(error.message || 'Failed to sign out')
      }
      
      // Clear all state
      set({
        user: null,
        profile: null,
        preferences: null,
        currentProgram: null,
        programDays: [],
        todaysWorkout: null,
        currentSession: null,
        sessionHistory: []
      })
    },

    initialize: async () => {
      set({ loading: true })
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          set({ user: session.user })
          
          // Load profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single()
          
          if (profile) {
            set({ profile })
          }
        }
      } catch (error) {
        console.error('Initialize error:', error)
      } finally {
        set({ loading: false, initialized: true })
      }
    },

    updateProfile: async (updates: Partial<Profile>) => {
      const { user } = get()
      if (!user) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id)

      if (error) {
        console.error('Update profile error:', error)
        throw new Error(error.message || 'Failed to update profile')
      }

      set({ profile: { ...get().profile!, ...updates } })
    },

    // Preferences state and actions
    preferences: null,
    
    loadPreferences: async () => {
      const { user } = get()
      if (!user) return

      const { data } = await supabase
        .from('preferences')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (data) {
        set({ preferences: data })
      }
    },

    updatePreferences: async (updates: Partial<Preferences>) => {
      const { user, preferences } = get()
      if (!user) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('preferences')
        .upsert({
          user_id: user.id,
          ...preferences,
          ...updates
        })

      if (error) {
        console.error('Update preferences error:', error)
        throw new Error(error.message || 'Failed to update preferences')
      }

      set({ preferences: { ...preferences!, ...updates } })
    },

    hasCompletedOnboarding: () => {
      const { preferences } = get()
      return !!(preferences?.pillars?.length && preferences.max_duration_min)
    },

    // Program state and actions
    currentProgram: null,
    currentWeek: 1,
    programDays: [],
    todaysWorkout: null,

    loadCurrentProgram: async () => {
      const { user } = get()
      if (!user) return

      // Get the most recent program
      const { data: program } = await supabase
        .from('programs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (program) {
        set({ currentProgram: program })

        // Load program days
        const { data: days } = await supabase
          .from('program_days')
          .select('*')
          .eq('program_id', program.id)
          .order('week_number', { ascending: true })
          .order('day_of_week', { ascending: true })

        if (days) {
          set({ programDays: days })
          
          // Set today's workout
          const todaysWorkout = get().getTodaysWorkout()
          set({ todaysWorkout })
        }
      }
    },

    generateProgram: async (preferences: Preferences) => {
      const { user } = get()
      if (!user) throw new Error('User not authenticated')

      // This would typically call the plan builder and save to database
      // For now, we'll create a placeholder
      const { data: program, error } = await supabase
        .from('programs')
        .insert({
          user_id: user.id,
          length_weeks: preferences.week_length || 10,
          start_date: new Date().toISOString().split('T')[0]
        })
        .select()
        .single()

      if (error) {
        console.error('Generate program error:', error)
        throw new Error(error.message || 'Failed to generate program')
      }

      set({ currentProgram: program, currentWeek: 1 })
    },

    advanceWeek: async () => {
      const { currentWeek, currentProgram } = get()
      if (!currentProgram) return

      const newWeek = Math.min(currentWeek + 1, currentProgram.length_weeks)
      set({ currentWeek: newWeek })

      // Update today's workout
      const todaysWorkout = get().getTodaysWorkout()
      set({ todaysWorkout })
    },

    repeatWeek: async () => {
      // Week stays the same, just update today's workout
      const todaysWorkout = get().getTodaysWorkout()
      set({ todaysWorkout })
    },

    getTodaysWorkout: () => {
      const { programDays, currentWeek } = get()
      const today = new Date().getDay() // 0 = Sunday, 1 = Monday, etc.
      const dayOfWeek = today === 0 ? 7 : today // Convert to 1-7 where 1 = Monday

      return programDays.find(day => 
        day.week_number === currentWeek && 
        day.day_of_week === dayOfWeek
      ) || null
    },

    // Workout session state and actions
    currentSession: null,
    sessionHistory: [],

    startSession: (programDay: ProgramDay, mode: 'short' | 'full') => {
      const session: WorkoutSession = {
        date: new Date().toISOString().split('T')[0],
        program_day: programDay,
        blocks: programDay.blocks as any[] || [],
        mode,
        estimated_duration_min: programDay.est_total_min || 0,
        completed: false
      }
      
      set({ currentSession: session })
    },

    completeSession: async (duration: number, rpe?: number, notes?: string) => {
      const { currentSession, user } = get()
      if (!currentSession || !user) return

      const completedSession = {
        ...currentSession,
        actual_duration_min: duration,
        rpe,
        notes,
        completed: true
      }

      // Save to database (or offline queue if offline)
      try {
        await supabase.from('activity_logs').insert({
          user_id: user.id,
          date: completedSession.date,
          program_id: currentSession.program_day.program_id,
          week_number: currentSession.program_day.week_number,
          day_of_week: currentSession.program_day.day_of_week,
          completed: true,
          duration_actual_min: duration,
          rpe,
          notes
        })
      } catch (error) {
        // Add to offline queue
        get().addToOfflineQueue({
          user_id: user.id,
          date: completedSession.date,
          program_id: currentSession.program_day.program_id,
          week_number: currentSession.program_day.week_number,
          day_of_week: currentSession.program_day.day_of_week,
          completed: true,
          duration_actual_min: duration,
          rpe,
          notes
        })
      }

      set({ 
        currentSession: null,
        sessionHistory: [completedSession, ...get().sessionHistory]
      })
    },

    pauseSession: () => {
      // Implementation depends on timer state
    },

    resumeSession: () => {
      // Implementation depends on timer state  
    },

    cancelSession: () => {
      set({ currentSession: null })
    },

    loadSessionHistory: async (days = 30) => {
      const { user } = get()
      if (!user) return

      const { data } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('date', { ascending: false })

      if (data) {
        // Convert to WorkoutSession format
        const sessions: WorkoutSession[] = data.map(log => ({
          id: log.id,
          date: log.date,
          program_day: {} as ProgramDay, // Would need to fetch program day details
          blocks: [],
          mode: 'full' as const,
          estimated_duration_min: 0,
          actual_duration_min: log.duration_actual_min || undefined,
          completed: log.completed || false,
          rpe: log.rpe || undefined,
          notes: log.notes || undefined
        }))
        
        set({ sessionHistory: sessions })
      }
    },

    // Library state and actions
    exercises: [],
    templates: [],
    intervals: [],

    loadLibrary: async () => {
      // Load public exercises, templates, and intervals
      const [exercisesRes, templatesRes, intervalsRes] = await Promise.all([
        supabase.from('exercises').select('*').eq('is_public', true),
        supabase.from('workout_templates').select(`
          *,
          items:workout_template_items(*)
        `).eq('is_public', true),
        supabase.from('interval_sets').select('*').eq('is_public', true)
      ])

      set({
        exercises: exercisesRes.data || [],
        templates: templatesRes.data || [],
        intervals: (intervalsRes.data || []).map(interval => ({
          ...interval,
          steps: Array.isArray(interval.steps) ? interval.steps as any[] : []
        })) as IntervalSetWithSteps[]
      })
    },

    searchLibrary: (query: string, pillar?: string) => {
      const { exercises, templates, intervals } = get()
      const queryLower = query.toLowerCase()

      const filterByQuery = (item: any) => 
        item.name.toLowerCase().includes(queryLower) ||
        (item.description && item.description.toLowerCase().includes(queryLower))

      const filterByPillar = (item: any) => !pillar || item.pillar === pillar

      return {
        exercises: exercises.filter(e => filterByQuery(e) && filterByPillar(e)),
        templates: templates.filter(t => filterByQuery(t) && filterByPillar(t)),
        intervals: intervals.filter(i => filterByQuery(i) && filterByPillar(i))
      }
    },

    // Settings state and actions
    settings: {
      sound_enabled: true,
      voice_enabled: true,
      theme: 'system' as const,
      units: 'metric' as const
    },

    theme: 'system' as const,

    updateSettings: (updates: Partial<UserSettings>) => {
      const settings = { ...get().settings, ...updates }
      set({ settings })
      localStorage.setItem('user-settings', JSON.stringify(settings))
    },

    loadSettings: () => {
      const stored = localStorage.getItem('user-settings')
      if (stored) {
        try {
          const settings = JSON.parse(stored)
          set({ settings, theme: settings.theme })
        } catch (error) {
          console.error('Failed to load settings:', error)
        }
      }
    },

    setTheme: (theme: 'light' | 'dark' | 'system') => {
      set({ theme })
      get().updateSettings({ theme })
    },

    // Offline state and actions
    isOnline: navigator.onLine,
    offlineQueue: [],

    addToOfflineQueue: (log: Omit<OfflineActivityLog, 'id' | 'timestamp' | 'synced'>) => {
      const queueItem: OfflineActivityLog = {
        ...log,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        synced: false
      }
      
      set({ 
        offlineQueue: [...get().offlineQueue, queueItem]
      })
      
      // Save to localStorage
      localStorage.setItem('offline-queue', JSON.stringify(get().offlineQueue))
    },

    syncOfflineData: async () => {
      const { offlineQueue } = get()
      const unsynced = offlineQueue.filter(item => !item.synced)
      
      for (const item of unsynced) {
        try {
          await supabase.from('activity_logs').insert({
            user_id: item.user_id,
            date: item.date,
            program_id: item.program_id,
            week_number: item.week_number,
            day_of_week: item.day_of_week,
            completed: item.completed,
            duration_actual_min: item.duration_actual_min,
            rpe: item.rpe,
            notes: item.notes
          })

          // Mark as synced
          const updatedQueue = get().offlineQueue.map(queueItem =>
            queueItem.id === item.id ? { ...queueItem, synced: true } : queueItem
          )
          set({ offlineQueue: updatedQueue })
          
        } catch (error) {
          console.error('Failed to sync offline data:', error)
        }
      }
      
      // Update localStorage
      localStorage.setItem('offline-queue', JSON.stringify(get().offlineQueue))
    },

    setOnlineStatus: (isOnline: boolean) => {
      set({ isOnline })
      
      // Try to sync when coming online
      if (isOnline) {
        get().syncOfflineData()
      }
    }
  }))
)

// Set up auth state listener
supabase.auth.onAuthStateChange(async (event, session) => {
  if (event === 'SIGNED_IN' && session) {
    useAppStore.getState().initialize()
  } else if (event === 'SIGNED_OUT') {
    useAppStore.setState({
      user: null,
      profile: null,
      preferences: null,
      currentProgram: null,
      programDays: [],
      todaysWorkout: null,
      currentSession: null
    })
  }
})

// Set up online/offline listeners
window.addEventListener('online', () => useAppStore.getState().setOnlineStatus(true))
window.addEventListener('offline', () => useAppStore.getState().setOnlineStatus(false))

export default useAppStore