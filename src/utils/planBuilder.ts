import type { 
  GeneratedProgram,
  ProgramGenerationOptions,
  WorkoutBlock,
  WorkoutItem,
  Pillar,
  Mode,
  Preferences,
  WorkoutTemplateWithItems,
  IntervalSetWithSteps,
  Exercise
} from '../types'
import { trimToTimeBudget, getRecommendedTimeSplits } from './timeBudget'
import { estimateBlockDuration, estimateTemplateDuration, estimateIntervalDuration } from './estimates'

/**
 * Main function to build a personalized program
 */
export function buildPersonalizedProgram(
  preferences: Preferences, 
  library: ProgramGenerationOptions['library']
): GeneratedProgram {
  const { 
    week_length = 10,
    days_per_week = 5, 
    max_duration_min = 45,
    default_mode = 'full',
    fitness_level = 'beginner',
    pillars = ['strength', 'tai_chi', 'running', 'mobility'],
    primary_focus,
    equipment = {}
  } = preferences

  // Ensure non-null values
  const actualWeekLength = week_length || 10
  const actualDaysPerWeek = days_per_week || 5
  const actualMaxDuration = max_duration_min || 45
  const actualMode = default_mode || 'full'
  const actualFitnessLevel = fitness_level || 'beginner'

  // Generate program structure
  const program = {
    user_id: '', // Will be set when saving
    start_date: new Date().toISOString().split('T')[0],
    length_weeks: actualWeekLength
  }

  // Generate week themes
  const weeks = generateWeekThemes(actualWeekLength)
  
  // Generate daily schedules
  const days = generateDailySchedules({
    weeks: weeks.length,
    daysPerWeek: actualDaysPerWeek,
    maxDuration: actualMaxDuration,
    mode: actualMode as Mode,
    fitnessLevel: actualFitnessLevel,
    pillars: pillars as Pillar[],
    primaryFocus: primary_focus as Pillar,
    equipment: equipment as Record<string, boolean>,
    library
  })

  return {
    program,
    weeks,
    days
  }
}

/**
 * Generate week themes for program progression
 */
function generateWeekThemes(weekLength: number): Array<{ week_number: number; theme: string }> {
  const themes: Record<number, string> = {
    1: 'Foundation & Form',
    2: 'Building Consistency', 
    3: 'Movement Quality',
    4: 'Strength & Stability',
    5: 'Deload & Recovery', // Strategic deload
    6: 'Tempo & Control',
    7: 'Unilateral Focus',
    8: 'Power & Flow',
    9: 'Integration',
    10: 'Mastery & Progress',
    11: 'Advanced Patterns',  // If 11-12 weeks
    12: 'Peak Performance'
  }

  return Array.from({ length: weekLength }, (_, i) => ({
    week_number: i + 1,
    theme: themes[i + 1] || `Week ${i + 1}`
  }))
}

/**
 * Generate daily workout schedules
 */
function generateDailySchedules(options: {
  weeks: number
  daysPerWeek: number
  maxDuration: number
  mode: Mode
  fitnessLevel: string
  pillars: Pillar[]
  primaryFocus?: Pillar
  equipment: Record<string, boolean>
  library: ProgramGenerationOptions['library']
}) {
  const days = []
  const { weeks, daysPerWeek, maxDuration, mode, fitnessLevel, pillars, primaryFocus, library } = options

  // Define weekly schedule template based on days per week
  const scheduleTemplates = getScheduleTemplate(daysPerWeek, pillars, primaryFocus)

  for (let week = 1; week <= weeks; week++) {
    const weekTheme = getWeekTheme(week)
    const isDeloadWeek = week === 5 // Strategic deload at week 5

    for (let day = 1; day <= daysPerWeek; day++) {
      const dayTemplate = scheduleTemplates[day - 1]
      
      // Generate blocks for this day
      const blocks = generateDayBlocks({
        week,
        dayOfWeek: day,
        template: dayTemplate,
        theme: weekTheme,
        isDeload: isDeloadWeek,
        maxDuration,
        mode,
        fitnessLevel,
        primaryFocus,
        library
      })

      // Trim blocks to fit time budget
      const trimmedBlocks = trimToTimeBudget(blocks, maxDuration, mode, {
        primary_focus: primaryFocus,
        max_duration_min: maxDuration
      } as Preferences)

      const totalDuration = trimmedBlocks.reduce((sum, block) => sum + estimateBlockDuration(block), 0)

      days.push({
        week_number: week,
        day_of_week: day,
        mode: mode as string,
        workout_template_id: null,
        interval_set_id: null,
        blocks: trimmedBlocks as any,
        est_total_min: totalDuration
      })
    }
  }

  return days
}

/**
 * Get schedule template based on days per week
 */
function getScheduleTemplate(daysPerWeek: number, pillars: Pillar[], primaryFocus?: Pillar): Pillar[][] {
  const templates: Record<number, Pillar[][]> = {
    3: [
      ['strength', 'mobility'],
      ['running', 'tai_chi'],
      ['strength', 'mobility']
    ],
    4: [
      ['strength', 'mobility'],
      ['running', 'tai_chi'], 
      ['mobility', 'tai_chi'],
      ['strength', 'cardio']
    ],
    5: [
      ['strength', 'mobility'],
      ['running', 'tai_chi'],
      ['mobility', 'tai_chi'],
      ['cardio', 'strength'],
      ['strength', 'mobility']
    ],
    6: [
      ['strength', 'mobility'],
      ['running', 'tai_chi'],
      ['mobility', 'tai_chi'],
      ['cardio', 'strength'],
      ['strength', 'mobility'],
      ['running', 'tai_chi']
    ]
  }

  let template = templates[daysPerWeek] || templates[5]
  
  // Filter template to only include selected pillars
  template = template.map(day => day.filter(pillar => pillars.includes(pillar)))
  
  // Ensure primary focus appears more frequently if specified
  if (primaryFocus && pillars.includes(primaryFocus)) {
    template = enhancePrimaryFocus(template, primaryFocus)
  }

  return template
}

/**
 * Enhance template to prioritize primary focus
 */
function enhancePrimaryFocus(template: Pillar[][], primaryFocus: Pillar): Pillar[][] {
  return template.map((day, index) => {
    // Add primary focus to alternating days if not already present
    if (index % 2 === 0 && !day.includes(primaryFocus)) {
      return [primaryFocus, ...day.slice(0, -1)] // Replace last pillar with primary focus
    }
    return day
  })
}

/**
 * Get theme characteristics for a week
 */
function getWeekTheme(weekNumber: number): {
  name: string
  intensity: number
  focus: string[]
  restMultiplier: number
} {
  const themes: Record<number, any> = {
    1: { name: 'Foundation', intensity: 0.6, focus: ['form', 'basics'], restMultiplier: 1.3 },
    2: { name: 'Consistency', intensity: 0.7, focus: ['habits', 'routine'], restMultiplier: 1.2 },
    3: { name: 'Quality', intensity: 0.7, focus: ['technique', 'control'], restMultiplier: 1.1 },
    4: { name: 'Strength', intensity: 0.8, focus: ['strength', 'stability'], restMultiplier: 1.0 },
    5: { name: 'Deload', intensity: 0.5, focus: ['recovery', 'mobility'], restMultiplier: 1.5 },
    6: { name: 'Tempo', intensity: 0.8, focus: ['tempo', 'control'], restMultiplier: 1.0 },
    7: { name: 'Unilateral', intensity: 0.8, focus: ['single-leg', 'balance'], restMultiplier: 1.0 },
    8: { name: 'Flow', intensity: 0.9, focus: ['power', 'flow'], restMultiplier: 0.9 },
    9: { name: 'Integration', intensity: 0.9, focus: ['complex', 'chains'], restMultiplier: 0.9 },
    10: { name: 'Mastery', intensity: 0.95, focus: ['mastery', 'progress'], restMultiplier: 0.8 }
  }
  
  return themes[weekNumber] || themes[10]
}

/**
 * Generate workout blocks for a specific day
 */
function generateDayBlocks(options: {
  week: number
  dayOfWeek: number
  template: Pillar[]
  theme: any
  isDeload: boolean
  maxDuration: number
  mode: Mode
  fitnessLevel: string
  primaryFocus?: Pillar
  library: ProgramGenerationOptions['library']
}): WorkoutBlock[] {
  const { template, theme, isDeload, maxDuration, mode, fitnessLevel, library } = options
  const blocks: WorkoutBlock[] = []

  // Get time allocations for each pillar
  const timeSplits = getRecommendedTimeSplits(maxDuration, mode, template, options.primaryFocus)

  for (const pillar of template) {
    const allocatedTime = timeSplits[pillar] || Math.floor(maxDuration / template.length)
    
    if (pillar === 'running' || pillar === 'cardio') {
      // Use interval sets for running/cardio
      const intervalBlock = generateIntervalBlock(pillar, allocatedTime, options.week, isDeload, library.intervals)
      if (intervalBlock) blocks.push(intervalBlock)
    } else {
      // Use templates and exercises for other pillars
      const exerciseBlock = generateExerciseBlock({
        pillar,
        allocatedTime,
        week: options.week,
        theme,
        isDeload,
        mode,
        fitnessLevel,
        library: {
          exercises: library.exercises,
          templates: library.templates
        }
      })
      if (exerciseBlock) blocks.push(exerciseBlock)
    }
  }

  return blocks
}

/**
 * Generate interval-based block (for running/cardio)
 */
function generateIntervalBlock(
  pillar: Pillar,
  allocatedTime: number,
  week: number,
  isDeload: boolean,
  intervals: IntervalSetWithSteps[]
): WorkoutBlock | null {
  // Filter intervals by pillar and find appropriate difficulty
  const pillarIntervals = intervals.filter(interval => interval.pillar === pillar)
  
  if (pillarIntervals.length === 0) return null

  // Progressive selection based on week (Week 1 = easiest, Week 10 = hardest)
  const progressionIndex = Math.min(week - 1, pillarIntervals.length - 1)
  let selectedInterval = pillarIntervals[progressionIndex]

  // Use easier interval for deload week
  if (isDeload && progressionIndex > 0) {
    selectedInterval = pillarIntervals[Math.max(0, progressionIndex - 2)]
  }

  if (!selectedInterval) return null

  const estimatedDuration = estimateIntervalDuration(selectedInterval)
  
  return {
    type: pillar,
    title: selectedInterval.name,
    items: [], // Interval sets don't use items structure
    estimated_duration_min: Math.min(estimatedDuration, allocatedTime)
  }
}

/**
 * Generate exercise-based block (for strength, mobility, tai_chi)
 */
function generateExerciseBlock(options: {
  pillar: Pillar
  allocatedTime: number
  week: number
  theme: any
  isDeload: boolean
  mode: Mode
  fitnessLevel: string
  library: {
    exercises: Exercise[]
    templates: WorkoutTemplateWithItems[]
  }
}): WorkoutBlock | null {
  const { pillar, allocatedTime, week, theme, isDeload, mode, fitnessLevel, library } = options

  // Try to find a suitable template first
  const templates = library.templates.filter(t => 
    t.pillar === pillar && 
    t.difficulty === fitnessLevel &&
    estimateTemplateDuration(t) <= allocatedTime * 1.2 // Allow some flexibility
  )

  if (templates.length > 0) {
    // Use template-based approach
    const selectedTemplate = templates[0] // Could add more sophisticated selection
    return generateBlockFromTemplate(selectedTemplate, allocatedTime, theme, isDeload)
  }

  // Fall back to exercise-based approach
  const exercises = library.exercises.filter(e => e.pillar === pillar)
  if (exercises.length === 0) return null

  return generateBlockFromExercises({
    pillar,
    exercises,
    allocatedTime,
    week,
    theme,
    isDeload,
    mode
  })
}

/**
 * Generate block from a workout template
 */
function generateBlockFromTemplate(
  template: WorkoutTemplateWithItems,
  allocatedTime: number,
  theme: any,
  isDeload: boolean
): WorkoutBlock {
  const items: WorkoutItem[] = template.items.map(item => ({
    id: item.exercise_id || undefined,
    name: item.name || 'Exercise',
    reps: adjustRepsForTheme(item.reps || '2×8-12', theme, isDeload),
    notes: item.notes || undefined,
    rest_sec: Math.floor((item.rest_sec || 45) * theme.restMultiplier),
    exercise_id: item.exercise_id || undefined
  }))

  return {
    type: template.pillar as Pillar,
    title: template.name,
    items,
    estimated_duration_min: Math.ceil(allocatedTime)
  }
}

/**
 * Generate block from individual exercises
 */
function generateBlockFromExercises(options: {
  pillar: Pillar
  exercises: Exercise[]
  allocatedTime: number
  week: number
  theme: any
  isDeload: boolean
  mode: Mode
}): WorkoutBlock {
  const { pillar, exercises, allocatedTime, week, theme, isDeload, mode } = options

  // Select appropriate exercises based on pillar and progression
  const selectedExercises = selectExercisesForProgression(exercises, week, mode, pillar)
  
  const items: WorkoutItem[] = selectedExercises.map(exercise => ({
    id: exercise.id,
    name: exercise.name,
    reps: adjustRepsForTheme(exercise.default_reps || getDefaultReps(pillar), theme, isDeload),
    rest_sec: Math.floor((exercise.default_rest_sec || getDefaultRest(pillar)) * theme.restMultiplier),
    cues: exercise.cues || undefined,
    exercise_id: exercise.id
  }))

  return {
    type: pillar,
    title: `${capitalizeFirst(pillar)} Block`,
    items,
    estimated_duration_min: Math.ceil(allocatedTime)
  }
}

/**
 * Select exercises based on progression and pillar
 */
function selectExercisesForProgression(
  exercises: Exercise[],
  week: number,
  mode: Mode,
  pillar: Pillar
): Exercise[] {
  // Limit number of exercises based on mode and pillar
  const maxExercises = getMaxExercises(pillar, mode)
  
  // For early weeks, prefer basic exercises
  if (week <= 3) {
    return exercises
      .filter(e => e.name.toLowerCase().includes('basic') || 
                   e.name.toLowerCase().includes('assist') ||
                   !e.name.toLowerCase().includes('advanced'))
      .slice(0, maxExercises)
  }
  
  // For later weeks, include more advanced variations
  return exercises.slice(0, maxExercises)
}

/**
 * Get maximum exercises per block based on pillar and mode
 */
function getMaxExercises(pillar: Pillar, mode: Mode): number {
  const limits: Record<Pillar, { short: number; full: number }> = {
    strength: { short: 3, full: 5 },
    mobility: { short: 4, full: 6 },
    tai_chi: { short: 3, full: 5 },
    running: { short: 1, full: 1 }, // Intervals
    cardio: { short: 1, full: 1 }   // Intervals
  }
  
  return limits[pillar]?.[mode] || 4
}

/**
 * Adjust reps based on week theme and deload status
 */
function adjustRepsForTheme(baseReps: string, theme: any, isDeload: boolean): string {
  if (isDeload) {
    return reduceRepsForDeload(baseReps)
  }

  // Theme-specific adjustments
  if (theme.focus.includes('tempo')) {
    return addTempoToReps(baseReps)
  }
  
  if (theme.focus.includes('power')) {
    return adjustForPower(baseReps)
  }

  return baseReps
}

/**
 * Helper functions for reps adjustment
 */
function reduceRepsForDeload(reps: string): string {
  // Reduce sets by 1 or reduce reps by 2-3
  const setMatch = reps.match(/(\d+)×(.+)/)
  if (setMatch) {
    const sets = Math.max(1, parseInt(setMatch[1]) - 1)
    return `${sets}×${setMatch[2]}`
  }
  return reps
}

function addTempoToReps(reps: string): string {
  return `${reps} (3-1-1 tempo)`
}

function adjustForPower(reps: string): string {
  // Lower reps for power focus
  return reps.replace(/8-12/g, '5-8').replace(/10-15/g, '6-10')
}

/**
 * Get default reps for a pillar
 */
function getDefaultReps(pillar: Pillar): string {
  const defaults: Record<Pillar, string> = {
    strength: '2×8-12',
    mobility: '30-45s',
    tai_chi: '3-5 repetitions',
    running: 'See intervals',
    cardio: 'See intervals'
  }
  return defaults[pillar] || '2×8-12'
}

/**
 * Get default rest for a pillar
 */
function getDefaultRest(pillar: Pillar): number {
  const defaults: Record<Pillar, number> = {
    strength: 60,
    mobility: 0,
    tai_chi: 30,
    running: 0,
    cardio: 0
  }
  return defaults[pillar] || 45
}

/**
 * Utility function to capitalize first letter
 */
function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).replace('_', ' ')
}