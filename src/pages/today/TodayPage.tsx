import React from 'react'
import { Calendar, Clock, Zap } from 'lucide-react'

const TodayPage: React.FC = () => {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Today's Workout
          </h1>
          <p className="text-gray-600 dark:text-gray-400">{today}</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-gray-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">Week 1, Day 1</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-primary-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">Estimated Time</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">45 min</p>
            </div>
          </div>
        </div>
        
        <div className="card p-4">
          <div className="flex items-center">
            <Zap className="h-8 w-8 text-orange-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">Intensity</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">Beginner</p>
            </div>
          </div>
        </div>
        
        <div className="card p-4">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 font-bold">3</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">Blocks</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">Ready</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Workout Mode
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Switch between full and short workouts
            </p>
          </div>
          
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button className="px-4 py-2 text-sm font-medium bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md shadow-sm">
              Full (45min)
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
              Short (20min)
            </button>
          </div>
        </div>
      </div>

      {/* Workout Blocks */}
      <div className="space-y-4">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
          Today's Plan
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Placeholder workout blocks */}
          <div className="card p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Strength A</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Lower Body</p>
                </div>
              </div>
              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 rounded-full">
                20min
              </span>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Squats</span>
                <span className="text-xs text-gray-500">2×8-12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Glute Bridge</span>
                <span className="text-xs text-gray-500">2×8-12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Calf Raises</span>
                <span className="text-xs text-gray-500">2×12-15</span>
              </div>
            </div>
            
            <button className="w-full btn-primary text-sm py-2">
              Start Block
            </button>
          </div>
          
          {/* More placeholder blocks would go here */}
        </div>
      </div>

      {/* Start Workout Button */}
      <div className="flex justify-center pt-8">
        <button className="btn-primary px-8 py-3 text-lg">
          Start Today's Workout 🚀
        </button>
      </div>
    </div>
  )
}

export default TodayPage