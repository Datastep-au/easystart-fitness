import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../../store'
import Button from '../../components/ui/Button'
import { ChevronLeft, ChevronRight, Check } from 'lucide-react'
import type { OnboardingData, Pillar, FitnessLevel, Mode } from '../../types'

const OnboardingPage: React.FC = () => {
  const navigate = useNavigate()
  const { updatePreferences, generateProgram } = useAppStore()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState<OnboardingData>({
    week_length: 10,
    days_per_week: 4,
    max_duration_min: 30,
    default_mode: 'full',
    fitness_level: 'beginner',
    pillars: ['strength', 'mobility'],
    primary_focus: undefined,
    equipment: {
      bands: false,
      dumbbells: false,
      kettlebell: false,
      pullup_bar: false,
      yoga_mat: true,
      foam_roller: false
    }
  })

  const totalSteps = 5

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = async () => {
    try {
      setLoading(true)
      
      // Save preferences to database
      const preferences = {
        week_length: formData.week_length,
        days_per_week: formData.days_per_week,
        max_duration_min: formData.max_duration_min,
        default_mode: formData.default_mode,
        fitness_level: formData.fitness_level,
        pillars: formData.pillars,
        primary_focus: formData.primary_focus,
        equipment: formData.equipment
      }
      
      await updatePreferences(preferences)
      
      // Generate initial program
      await generateProgram(preferences as any)
      
      // Navigate to main app
      navigate('/today')
    } catch (error) {
      console.error('Onboarding error:', error)
      // Still navigate to avoid blocking user
      navigate('/today')
    } finally {
      setLoading(false)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1: return formData.week_length && formData.days_per_week
      case 2: return formData.max_duration_min && formData.default_mode
      case 3: return formData.fitness_level
      case 4: return formData.pillars.length > 0
      case 5: return true
      default: return false
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Program Length
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                How long do you want your fitness program to be?
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Program Duration
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[10, 11, 12].map(weeks => (
                    <button
                      key={weeks}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, week_length: weeks }))}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                        formData.week_length === weeks
                          ? 'border-blue-500 bg-blue-500 text-white shadow-lg transform scale-105'
                          : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50 dark:border-gray-600'
                      }`}
                    >
                      <div className="font-semibold">{weeks} weeks</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {weeks === 10 ? 'Standard' : weeks === 11 ? 'Extended' : 'Complete'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Days per Week
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[3, 4, 5, 6].map(days => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, days_per_week: days }))}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                        formData.days_per_week === days
                          ? 'border-blue-500 bg-blue-500 text-white shadow-lg transform scale-105'
                          : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50 dark:border-gray-600'
                      }`}
                    >
                      <div className="font-semibold">{days} days</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
        
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Session Duration
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                How much time do you have for each workout?
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Maximum Session Duration
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[15, 30, 45].map(duration => (
                    <button
                      key={duration}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, max_duration_min: duration }))}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                        formData.max_duration_min === duration
                          ? 'border-blue-500 bg-blue-500 text-white shadow-lg transform scale-105'
                          : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50 dark:border-gray-600'
                      }`}
                    >
                      <div className="font-semibold">{duration} min</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {duration === 15 ? 'Quick' : duration === 30 ? 'Standard' : 'Extended'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Default Mode
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { value: 'short' as Mode, label: 'Short Sessions', desc: '20min focused workouts' },
                    { value: 'full' as Mode, label: 'Full Sessions', desc: 'Complete workout experience' }
                  ].map(mode => (
                    <button
                      key={mode.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, default_mode: mode.value }))}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                        formData.default_mode === mode.value
                          ? 'border-blue-500 bg-blue-500 text-white shadow-lg transform scale-105'
                          : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50 dark:border-gray-600'
                      }`}
                    >
                      <div className="font-semibold">{mode.label}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{mode.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
        
      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Fitness Level
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                What's your current fitness experience?
              </p>
            </div>
            
            <div className="space-y-3">
              {[
                { value: 'beginner' as FitnessLevel, label: 'Beginner', desc: 'New to fitness or getting back into it' },
                { value: 'easy' as FitnessLevel, label: 'Easy', desc: 'Some experience, comfortable with basic movements' },
                { value: 'moderate' as FitnessLevel, label: 'Moderate', desc: 'Regular exercise, ready for more challenge' }
              ].map(level => (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, fitness_level: level.value }))}
                  className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                    formData.fitness_level === level.value
                      ? 'border-blue-500 bg-blue-500 text-white shadow-lg transform scale-[1.02]'
                      : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50 dark:border-gray-600'
                  }`}
                >
                  <div className="font-semibold">{level.label}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{level.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )
        
      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Fitness Pillars
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Select multiple areas you'd like to focus on (you can choose more than one)
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                {[
                  { value: 'strength' as Pillar, label: 'Strength Training', desc: 'Build muscle and functional strength' },
                  { value: 'mobility' as Pillar, label: 'Mobility & Flexibility', desc: 'Improve range of motion and movement quality' },
                  { value: 'tai_chi' as Pillar, label: 'Tai Chi', desc: 'Gentle flowing movements for balance and mindfulness' },
                  { value: 'running' as Pillar, label: 'Running', desc: 'Cardiovascular fitness through running intervals' },
                  { value: 'cardio' as Pillar, label: 'Low-Impact Cardio', desc: 'Heart-healthy exercise without running' }
                ].map(pillar => (
                  <button
                    key={pillar.value}
                    type="button"
                    onClick={() => {
                      const isSelected = formData.pillars.includes(pillar.value)
                      if (isSelected) {
                        setFormData(prev => ({
                          ...prev,
                          pillars: prev.pillars.filter(p => p !== pillar.value),
                          primary_focus: prev.primary_focus === pillar.value ? undefined : prev.primary_focus
                        }))
                      } else {
                        setFormData(prev => ({
                          ...prev,
                          pillars: [...prev.pillars, pillar.value]
                        }))
                      }
                    }}
                    className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left cursor-pointer ${
                      formData.pillars.includes(pillar.value)
                        ? 'border-green-500 bg-green-500 text-white shadow-lg'
                        : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50 dark:border-gray-600 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{pillar.label}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{pillar.desc}</div>
                      </div>
                      {formData.pillars.includes(pillar.value) && (
                        <Check className="h-6 w-6 text-white font-bold" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
              
              {formData.pillars.length > 1 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Primary Focus (Optional)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {formData.pillars.map(pillar => (
                      <button
                        key={pillar}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, primary_focus: pillar }))}
                        className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                          formData.primary_focus === pillar
                            ? 'border-blue-500 bg-blue-500 text-white shadow-lg transform scale-105'
                            : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50 dark:border-gray-600'
                        }`}
                      >
                        <div className="font-semibold capitalize">{pillar.replace('_', ' ')}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )
        
      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Equipment Available
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                What equipment do you have access to?
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { key: 'yoga_mat', label: 'Yoga Mat', desc: 'For floor exercises' },
                { key: 'bands', label: 'Resistance Bands', desc: 'Elastic bands for resistance' },
                { key: 'dumbbells', label: 'Dumbbells', desc: 'Free weights' },
                { key: 'kettlebell', label: 'Kettlebell', desc: 'Single weight tool' },
                { key: 'pullup_bar', label: 'Pull-up Bar', desc: 'For upper body exercises' },
                { key: 'foam_roller', label: 'Foam Roller', desc: 'For recovery and mobility' }
              ].map(equipment => (
                <button
                  key={equipment.key}
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      equipment: {
                        ...prev.equipment,
                        [equipment.key]: !prev.equipment[equipment.key as keyof typeof prev.equipment]
                      }
                    }))
                  }}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 text-left cursor-pointer ${
                    formData.equipment[equipment.key as keyof typeof formData.equipment]
                      ? 'border-green-500 bg-green-500 text-white shadow-lg'
                      : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50 dark:border-gray-600 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{equipment.label}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{equipment.desc}</div>
                    </div>
                    {formData.equipment[equipment.key as keyof typeof formData.equipment] && (
                      <Check className="h-6 w-6 text-white font-bold" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )
        
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-2 sm:p-4">
      <div className="max-w-2xl w-full space-y-6 sm:space-y-8">
        {/* Progress Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-0">
            Let's Get You Started! 💪
          </h1>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Step {currentStep} of {totalSteps}
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          ></div>
        </div>
        
        {/* Step Content */}
        <div className="card p-4 sm:p-6 lg:p-8">
          {renderStep()}
        </div>
        
        {/* Navigation */}
        <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="flex items-center justify-center order-2 sm:order-1"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          
          {currentStep < totalSteps ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex items-center justify-center order-1 sm:order-2"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={!canProceed()}
              loading={loading}
              className="flex items-center justify-center order-1 sm:order-2"
            >
              Complete Setup
              <Check className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default OnboardingPage
