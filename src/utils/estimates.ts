import type { 
  WorkoutBlock, 
  WorkoutItem, 
  IntervalSetWithSteps,
  WorkoutTemplateWithItems 
} from '../types'

/**
 * Parse reps string and estimate duration
 * Examples: "2×8-12", "30-60s", "3-5 circles/side each way", "20-40s"
 */
export function parseRepsAndEstimateDuration(reps: string, restSec: number = 45): number {
  if (!reps) return 0
  
  const repsLower = reps.toLowerCase()
  
  // Time-based exercises (seconds/minutes)
  const timeMatch = repsLower.match(/(\d+)[-–]?(\d+)?[s]?[\s]*(?:sec|seconds?)?/)
  if (timeMatch || repsLower.includes('sec') || repsLower.includes('s')) {
    const minTime = parseInt(timeMatch?.[1] || '30')
    const maxTime = parseInt(timeMatch?.[2] || timeMatch?.[1] || '45')
    return (minTime + maxTime) / 2 // Return average seconds
  }
  
  // Set × Rep format (e.g., "2×8-12", "3×10")
  const setRepMatch = repsLower.match(/(\d+)[\s]*[×x][\s]*(\d+)[-–]?(\d+)?/)
  if (setRepMatch) {
    const sets = parseInt(setRepMatch[1])
    const minReps = parseInt(setRepMatch[2])
    const maxReps = parseInt(setRepMatch[3] || setRepMatch[2])
    const avgReps = (minReps + maxReps) / 2
    
    // Estimate: 2-3 seconds per rep + rest between sets
    const workTime = sets * avgReps * 2.5
    const restTime = (sets - 1) * restSec
    return workTime + restTime
  }
  
  // Just reps (e.g., "8-12", "10")
  const repMatch = repsLower.match(/(\d+)[-–]?(\d+)?/)
  if (repMatch) {
    const minReps = parseInt(repMatch[1])
    const maxReps = parseInt(repMatch[2] || repMatch[1])
    const avgReps = (minReps + maxReps) / 2
    
    // Single set, estimate 2.5 seconds per rep
    return avgReps * 2.5
  }
  
  // Special cases
  if (repsLower.includes('circles') || repsLower.includes('car')) {
    return 45 // CAR movements typically 45 seconds
  }
  
  if (repsLower.includes('flow') || repsLower.includes('sequence')) {
    return 120 // Tai Chi flows typically 2 minutes
  }
  
  // Default fallback
  return 60
}

/**
 * Estimate duration for a workout item
 */
export function estimateItemDuration(item: WorkoutItem): number {
  const workTime = parseRepsAndEstimateDuration(item.reps || '', item.rest_sec || 45)
  const restTime = item.rest_sec || 0
  
  return workTime + restTime
}

/**
 * Estimate duration for a workout block
 */
export function estimateBlockDuration(block: WorkoutBlock): number {
  const itemsTime = block.items.reduce((total, item) => {
    return total + estimateItemDuration(item)
  }, 0)
  
  // Add block-level rest if specified
  const blockRest = block.rest_sec || 0
  
  return Math.ceil((itemsTime + blockRest) / 60) // Convert to minutes
}

/**
 * Estimate duration for interval set
 */
export function estimateIntervalDuration(interval: IntervalSetWithSteps): number {
  const warmupMin = (interval.warmup_sec || 300) / 60
  const cooldownMin = (interval.cooldown_sec || 300) / 60
  
  const workMin = interval.steps.reduce((total, step) => {
    const stepTime = (step.work_sec + step.rest_sec) * step.repeat
    return total + stepTime / 60
  }, 0)
  
  return Math.ceil(warmupMin + workMin + cooldownMin)
}

/**
 * Estimate duration for workout template
 */
export function estimateTemplateDuration(template: WorkoutTemplateWithItems): number {
  const totalSeconds = template.items.reduce((total, item) => {
    const workTime = parseRepsAndEstimateDuration(item.reps || '', item.rest_sec || 45)
    const restTime = item.rest_sec || 45
    return total + workTime + restTime
  }, 0)
  
  return Math.ceil(totalSeconds / 60)
}

/**
 * Calculate RPE (Rate of Perceived Exertion) based on workout characteristics
 */
export function calculateEstimatedRPE(
  pillar: string, 
  difficulty: string, 
  fitnessLevel: string
): number {
  let baseRPE = 5
  
  // Adjust based on pillar intensity
  switch (pillar) {
    case 'strength':
      baseRPE = 6
      break
    case 'running':
      baseRPE = 7
      break
    case 'cardio':
      baseRPE = 6
      break
    case 'tai_chi':
      baseRPE = 4
      break
    case 'mobility':
      baseRPE = 3
      break
  }
  
  // Adjust based on difficulty
  switch (difficulty) {
    case 'beginner':
      baseRPE -= 1
      break
    case 'moderate':
      baseRPE += 1
      break
  }
  
  // Adjust based on fitness level
  switch (fitnessLevel) {
    case 'beginner':
      baseRPE += 1
      break
    case 'moderate':
      baseRPE -= 0.5
      break
  }
  
  // Keep within valid RPE range (1-10)
  return Math.max(1, Math.min(10, Math.round(baseRPE)))
}

/**
 * Convert duration to human-readable string
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${Math.round(minutes)}min`
  }
  
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = Math.round(minutes % 60)
  
  if (remainingMinutes === 0) {
    return `${hours}h`
  }
  
  return `${hours}h ${remainingMinutes}min`
}

/**
 * Calculate calories burned estimate (very rough approximation)
 */
export function estimateCaloriesBurned(
  durationMin: number, 
  pillar: string, 
  bodyWeightKg: number = 70
): number {
  // MET values (very approximate)
  const metValues: Record<string, number> = {
    strength: 6.0,
    running: 8.0,
    cardio: 5.5,
    tai_chi: 4.0,
    mobility: 2.5
  }
  
  const met = metValues[pillar] || 4.0
  
  // Calories = MET × body weight (kg) × time (hours)
  return Math.round(met * bodyWeightKg * (durationMin / 60))
}