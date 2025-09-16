import React from 'react'
import { Clock } from 'lucide-react'
import { formatDuration } from '../../utils/estimates'

interface DurationBadgeProps {
  minutes: number
  variant?: 'default' | 'success' | 'warning' | 'danger'
  size?: 'sm' | 'md'
  showIcon?: boolean
  className?: string
}

const DurationBadge: React.FC<DurationBadgeProps> = ({ 
  minutes, 
  variant = 'default', 
  size = 'md',
  showIcon = true,
  className = '' 
}) => {
  const baseStyles = 'inline-flex items-center rounded-full font-medium'
  
  const variants = {
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    danger: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  }
  
  const sizes = {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm'
  }
  
  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4'
  }
  
  return (
    <span className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}>
      {showIcon && (
        <Clock className={`${iconSizes[size]} ${size === 'sm' ? 'mr-1' : 'mr-1.5'}`} />
      )}
      {formatDuration(minutes)}
    </span>
  )
}

export default DurationBadge