import type { 
  WorkoutBlock, 
  WorkoutItem, 
  Mode, 
  Pillar,
  Preferences 
} from '../types'
import { estimateBlockDuration, estimateItemDuration } from './estimates'

/**
 * Time budget priorities for different modes and pillars
 */
export const TIME_PRIORITIES = {
  // Core priorities that should never be cut
  core: ['mobility'] as Pillar[],
  
  // Primary focus gets highest priority after core
  primary_focus_multiplier: 1.5,
  
  // Short mode time allocation percentages
  short_mode_allocation: {
    mobility: 0.3,      // 30% - always include
    primary_focus: 0.5, // 50% - main focus
    secondary: 0.2      // 20% - supporting work
  },
  
  // Full mode time allocation percentages
  full_mode_allocation: {
    mobility: 0.2,      // 20% - warm-up/cool-down
    primary_focus: 0.4, // 40% - main work
    secondary: 0.3,     // 30% - supporting work
    optional: 0.1       // 10% - finishers/extras
  }
}

/**
 * Trim workout blocks to fit within time budget
 */
export function trimToTimeBudget(
  blocks: WorkoutBlock[], 
  maxDurationMin: number, 
  mode: Mode,
  preferences: Preferences
): WorkoutBlock[] {
  const totalEstimated = blocks.reduce((sum, block) => sum + estimateBlockDuration(block), 0)
  
  // If already within budget, return as-is
  if (totalEstimated <= maxDurationMin) {
    return blocks
  }
  
  const primaryFocus = preferences.primary_focus
  const trimmedBlocks: WorkoutBlock[] = []
  let remainingBudget = maxDurationMin
  
  // Step 1: Always include core blocks (mobility)
  const coreBlocks = blocks.filter(block => TIME_PRIORITIES.core.includes(block.type))
  for (const block of coreBlocks) {
    const trimmedBlock = trimBlock(block, Math.min(remainingBudget, estimateBlockDuration(block)), mode)
    trimmedBlocks.push(trimmedBlock)
    remainingBudget -= estimateBlockDuration(trimmedBlock)
  }
  
  // Step 2: Add primary focus blocks
  if (primaryFocus && remainingBudget > 0) {
    const primaryBlocks = blocks.filter(block => 
      block.type === primaryFocus && !TIME_PRIORITIES.core.includes(block.type)
    )
    
    for (const block of primaryBlocks) {
      if (remainingBudget <= 0) break
      
      const allocatedTime = mode === 'short' 
        ? remainingBudget * 0.7  // Give most remaining time to primary focus
        : Math.min(remainingBudget * 0.6, estimateBlockDuration(block))
        
      const trimmedBlock = trimBlock(block, allocatedTime, mode)
      trimmedBlocks.push(trimmedBlock)
      remainingBudget -= estimateBlockDuration(trimmedBlock)
    }
  }
  
  // Step 3: Add secondary blocks with remaining time
  const secondaryBlocks = blocks.filter(block => 
    !TIME_PRIORITIES.core.includes(block.type) &&
    block.type !== primaryFocus &&
    !trimmedBlocks.some(tb => tb.type === block.type)
  )
  
  for (const block of secondaryBlocks) {
    if (remainingBudget <= 5) break // Need at least 5 minutes
    
    const allocatedTime = Math.min(remainingBudget / 2, estimateBlockDuration(block))
    const trimmedBlock = trimBlock(block, allocatedTime, mode)
    
    if (estimateBlockDuration(trimmedBlock) >= 5) { // Only add if meaningful duration
      trimmedBlocks.push(trimmedBlock)
      remainingBudget -= estimateBlockDuration(trimmedBlock)
    }
  }
  
  return trimmedBlocks
}

/**
 * Trim an individual block to fit time budget
 */
function trimBlock(block: WorkoutBlock, targetMinutes: number, mode: Mode): WorkoutBlock {
  const currentDuration = estimateBlockDuration(block)
  
  if (currentDuration <= targetMinutes) {
    return block
  }
  
  const trimmedItems: WorkoutItem[] = []
  let usedTime = 0
  const targetSeconds = targetMinutes * 60
  
  // Priority order: compound movements, bilateral, then isolation
  const prioritizedItems = prioritizeItems(block.items, block.type, mode)
  
  for (const item of prioritizedItems) {
    const itemDuration = estimateItemDuration(item)
    
    if (usedTime + itemDuration <= targetSeconds) {
      trimmedItems.push(item)
      usedTime += itemDuration
    } else if (usedTime < targetSeconds * 0.8) { // If we have room, try to modify the item
      const modifiedItem = modifyItemForTime(item, targetSeconds - usedTime, mode)
      if (modifiedItem) {
        trimmedItems.push(modifiedItem)
        usedTime += estimateItemDuration(modifiedItem)
      }
    }
    
    // Stop if we've used most of the time budget
    if (usedTime >= targetSeconds * 0.95) break
  }
  
  return {
    ...block,
    items: trimmedItems,
    estimated_duration_min: Math.ceil(usedTime / 60)
  }
}

/**
 * Prioritize items within a block based on movement patterns and mode
 */
function prioritizeItems(items: WorkoutItem[], pillar: Pillar, mode: Mode): WorkoutItem[] {
  const priorities = getPillarPriorities(pillar, mode)
  
  return items.sort((a, b) => {
    const aScore = calculateItemPriority(a, priorities)
    const bScore = calculateItemPriority(b, priorities)
    return bScore - aScore // Higher score first
  })
}

/**
 * Get priority keywords for each pillar
 */
function getPillarPriorities(pillar: Pillar, mode: Mode): Record<string, number> {
  const basePriorities: Record<Pillar, Record<string, number>> = {
    strength: {
      'squat': 10,
      'deadlift': 10,
      'push': 9,
      'pull': 9,
      'hip': 8,
      'bridge': 7,
      'lunge': 7,
      'split': 7,
      'plank': 6,
      'single': 5, // single-leg/arm variations
      'core': 5,
      'calf': 3
    },
    mobility: {
      'hip': 10,
      'shoulder': 9,
      'spine': 8,
      'car': 8, // controlled articular rotations
      'ankle': 7,
      'neck': 6,
      'hamstring': 6,
      'couch': 5,
      'stretch': 4
    },
    tai_chi: {
      'commencement': 10,
      'stance': 9,
      'wild horse': 8,
      'white crane': 8,
      'brush knee': 7,
      'repulse': 6,
      'wave hands': 6,
      'golden': 5,
      'flow': 4
    },
    running: {
      'interval': 10,
      'tempo': 8,
      'easy': 6,
      'recovery': 4
    },
    cardio: {
      'interval': 10,
      'brisk': 8,
      'walk': 6,
      'low impact': 5
    }
  }
  
  let priorities = basePriorities[pillar] || {}
  
  // Adjust priorities for short mode - favor compound movements
  if (mode === 'short') {
    if (pillar === 'strength') {
      priorities = {
        ...priorities,
        'squat': priorities['squat'] + 2,
        'deadlift': priorities['deadlift'] + 2,
        'push': priorities['push'] + 1,
        'pull': priorities['pull'] + 1
      }
    }
  }
  
  return priorities
}

/**
 * Calculate priority score for an item based on its name and properties
 */
function calculateItemPriority(item: WorkoutItem, priorities: Record<string, number>): number {
  const itemNameLower = item.name.toLowerCase()
  let score = 0
  
  // Check each priority keyword
  for (const [keyword, points] of Object.entries(priorities)) {
    if (itemNameLower.includes(keyword)) {
      score += points
    }
  }
  
  // Boost score for items with cues (indicates they're important/educational)
  if (item.cues && item.cues.length > 0) {
    score += 2
  }
  
  return score
}

/**
 * Modify an item to fit within a specific time constraint
 */
function modifyItemForTime(item: WorkoutItem, availableSeconds: number, _mode: Mode): WorkoutItem | null {
  if (availableSeconds < 15) return null // Need at least 15 seconds
  
  const currentDuration = estimateItemDuration(item)
  if (currentDuration <= availableSeconds) return item
  
  const modifiedItem = { ...item }
  
  // Try to reduce sets or reps
  if (item.reps) {
    const repsLower = item.reps.toLowerCase()
    
    // Handle set×rep format (e.g., "3×8-12" -> "2×8-12")
    const setRepMatch = repsLower.match(/(\d+)[\s]*[×x][\s]*(\d+[-–]?\d*)/)
    if (setRepMatch) {
      const sets = parseInt(setRepMatch[1])
      const reps = setRepMatch[2]
      
      if (sets > 1) {
        const newSets = Math.max(1, sets - 1)
        modifiedItem.reps = `${newSets}×${reps}`
        
        // Check if this fits
        if (estimateItemDuration(modifiedItem) <= availableSeconds) {
          return modifiedItem
        }
      }
    }
    
    // Handle time-based (e.g., "45-60s" -> "30-45s")
    const timeMatch = repsLower.match(/(\d+)[-–](\d+)[s]?/)
    if (timeMatch) {
      const minTime = parseInt(timeMatch[1])
      const maxTime = parseInt(timeMatch[2])
      const targetTime = Math.min(maxTime, Math.floor(availableSeconds * 0.8))
      
      if (targetTime >= minTime) {
        modifiedItem.reps = `${Math.max(minTime, targetTime - 10)}-${targetTime}s`
        return modifiedItem
      }
    }
  }
  
  // If we can't modify reps meaningfully, reduce rest time
  if (item.rest_sec && item.rest_sec > 15) {
    modifiedItem.rest_sec = Math.max(15, Math.floor(item.rest_sec * 0.7))
    
    if (estimateItemDuration(modifiedItem) <= availableSeconds) {
      return modifiedItem
    }
  }
  
  return null // Can't fit this item
}

/**
 * Get recommended time splits for a given mode and duration
 */
export function getRecommendedTimeSplits(
  maxDurationMin: number, 
  mode: Mode, 
  pillars: Pillar[],
  primaryFocus?: Pillar
): Record<Pillar, number> {
  const splits: Record<Pillar, number> = {} as Record<Pillar, number>
  
  // Always allocate mobility time
  const mobilityTime = mode === 'short' 
    ? Math.max(5, maxDurationMin * 0.25)  // 25% in short mode, minimum 5 min
    : Math.max(8, maxDurationMin * 0.2)   // 20% in full mode, minimum 8 min
    
  splits['mobility'] = mobilityTime
  let remainingTime = maxDurationMin - mobilityTime
  
  // Allocate primary focus time
  if (primaryFocus && pillars.includes(primaryFocus) && primaryFocus !== 'mobility') {
    const primaryTime = mode === 'short'
      ? remainingTime * 0.7  // 70% of remaining time
      : remainingTime * 0.5  // 50% of remaining time
      
    splits[primaryFocus] = primaryTime
    remainingTime -= primaryTime
  }
  
  // Distribute remaining time among other pillars
  const otherPillars = pillars.filter(p => p !== 'mobility' && p !== primaryFocus)
  if (otherPillars.length > 0 && remainingTime > 0) {
    const timePerPillar = remainingTime / otherPillars.length
    
    otherPillars.forEach(pillar => {
      splits[pillar] = timePerPillar
    })
  }
  
  return splits
}

/**
 * Validate that a set of blocks fits within the time budget
 */
export function validateTimeBudget(blocks: WorkoutBlock[], maxDurationMin: number): {
  valid: boolean
  totalDuration: number
  overageMin: number
} {
  const totalDuration = blocks.reduce((sum, block) => sum + estimateBlockDuration(block), 0)
  const overage = Math.max(0, totalDuration - maxDurationMin)
  
  return {
    valid: overage === 0,
    totalDuration,
    overageMin: overage
  }
}