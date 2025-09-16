import React from 'react'
import { Dumbbell, Heart, User, Zap, Activity } from 'lucide-react'
import type { WorkoutBlock, Pillar } from '../../types'
import DurationBadge from '../ui/DurationBadge'

interface BlockCardProps {
  block: WorkoutBlock
  onStart?: () => void
  showStartButton?: boolean
  className?: string
}

const BlockCard: React.FC<BlockCardProps> = ({
  block,
  onStart,
  showStartButton = true,
  className = ''
}) => {
  const getPillarIcon = (pillar: Pillar) => {
    const iconProps = { className: 'h-5 w-5' }
    
    switch (pillar) {
      case 'strength':
        return <Dumbbell {...iconProps} />
      case 'cardio':
        return <Heart {...iconProps} />
      case 'running':
        return <Zap {...iconProps} />
      case 'tai_chi':
        return <User {...iconProps} />
      case 'mobility':
        return <Activity {...iconProps} />
      default:
        return <Activity {...iconProps} />
    }
  }

  const getPillarColor = (pillar: Pillar) => {
    const colors = {
      strength: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800',
      cardio: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800',
      running: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800',
      tai_chi: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800',
      mobility: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800'
    }
    return colors[pillar] || colors.strength
  }

  const formatPillarName = (pillar: Pillar) => {
    return pillar.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  return (
    <div className={`card p-6 hover:shadow-lg transition-shadow ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${getPillarColor(block.type)}`}>
            {getPillarIcon(block.type)}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {block.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {formatPillarName(block.type)}
            </p>
          </div>
        </div>
        <DurationBadge minutes={block.estimated_duration_min} size="sm" />
      </div>

      {/* Items List */}
      {block.items.length > 0 && (
        <div className="mb-4">
          <div className="space-y-2">
            {block.items.slice(0, 3).map((item, index) => (
              <div key={index} className="flex items-center justify-between py-1">
                <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                  {item.name}
                </span>
                {item.reps && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
                    {item.reps}
                  </span>
                )}
              </div>
            ))}
            {block.items.length > 3 && (
              <div className="text-xs text-gray-500 dark:text-gray-400 pt-1">
                +{block.items.length - 3} more exercises
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rest Period */}
      {block.rest_sec && block.rest_sec > 0 && (
        <div className="mb-4 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <span className="text-xs text-gray-600 dark:text-gray-400">
            Rest: {Math.floor(block.rest_sec / 60)}:{(block.rest_sec % 60).toString().padStart(2, '0')}
          </span>
        </div>
      )}

      {/* Start Button */}
      {showStartButton && onStart && (
        <button
          onClick={onStart}
          className="w-full btn-primary text-sm py-2"
        >
          Start Block
        </button>
      )}
    </div>
  )
}

export default BlockCard