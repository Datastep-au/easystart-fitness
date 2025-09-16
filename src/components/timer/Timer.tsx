import React, { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react'
import Button from '../ui/Button'

interface TimerProps {
  initialSeconds: number
  onComplete?: () => void
  onTick?: (remainingSeconds: number) => void
  autoStart?: boolean
  label?: string
  showControls?: boolean
  allowReset?: boolean
  soundEnabled?: boolean
}

const Timer: React.FC<TimerProps> = ({
  initialSeconds,
  onComplete,
  onTick,
  autoStart = false,
  label,
  showControls = true,
  allowReset = true,
  soundEnabled = true
}) => {
  const [timeRemaining, setTimeRemaining] = useState(initialSeconds)
  const [isRunning, setIsRunning] = useState(autoStart)
  const [isComplete, setIsComplete] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Create audio context for timer sounds
  useEffect(() => {
    if (soundEnabled && !audioRef.current) {
      // Create a simple beep sound using Web Audio API
      audioRef.current = new Audio()
      audioRef.current.volume = 0.3
    }
  }, [soundEnabled])

  // Main timer logic
  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          const newTime = prev - 1
          
          // Call onTick callback
          onTick?.(newTime)
          
          // Play sound at key intervals
          if (soundEnabled && (newTime === 10 || newTime === 5 || newTime === 3 || newTime === 1)) {
            playBeep()
          }
          
          return newTime
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, timeRemaining, soundEnabled, onTick])

  // Handle timer completion
  useEffect(() => {
    if (timeRemaining === 0 && !isComplete) {
      setIsComplete(true)
      setIsRunning(false)
      
      if (soundEnabled) {
        playCompletionSound()
      }
      
      onComplete?.()
    }
  }, [timeRemaining, isComplete, soundEnabled, onComplete])

  const playBeep = () => {
    if (!soundEnabled) return
    
    // Create a simple beep using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.1)
  }

  const playCompletionSound = () => {
    if (!soundEnabled) return
    
    // Play a different sound for completion
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.frequency.setValueAtTime(1000, audioContext.currentTime)
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.3)
  }

  const toggleTimer = () => {
    if (isComplete) return
    setIsRunning(!isRunning)
  }

  const resetTimer = () => {
    setTimeRemaining(initialSeconds)
    setIsRunning(false)
    setIsComplete(false)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getProgressPercentage = () => {
    return ((initialSeconds - timeRemaining) / initialSeconds) * 100
  }

  const getTimerColor = () => {
    if (isComplete) return 'text-green-600'
    if (timeRemaining <= 10) return 'text-red-600 animate-pulse'
    if (timeRemaining <= 30) return 'text-orange-600'
    return 'text-gray-900 dark:text-gray-100'
  }

  return (
    <div className="timer-container">
      {label && (
        <div className="text-center mb-2">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {label}
          </span>
        </div>
      )}
      
      {/* Circular Progress */}
      <div className="relative w-32 h-32 mx-auto mb-4">
        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
          {/* Background circle */}
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-gray-200 dark:text-gray-700"
          />
          {/* Progress circle */}
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="100"
            strokeDashoffset={100 - getProgressPercentage()}
            strokeLinecap="round"
            className={`transition-all duration-1000 ${isComplete ? 'text-green-500' : 'text-primary-600'}`}
          />
        </svg>
        
        {/* Timer Display */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-2xl font-bold ${getTimerColor()}`}>
            {formatTime(timeRemaining)}
          </span>
        </div>
      </div>

      {/* Controls */}
      {showControls && (
        <div className="flex justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleTimer}
            disabled={isComplete}
          >
            {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          
          {allowReset && (
            <Button
              variant="outline"
              size="sm"
              onClick={resetTimer}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {}}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>
        </div>
      )}

      {/* Completion Message */}
      {isComplete && (
        <div className="text-center mt-2">
          <span className="text-sm text-green-600 dark:text-green-400 font-medium">
            Complete! 🎉
          </span>
        </div>
      )}
    </div>
  )
}

export default Timer