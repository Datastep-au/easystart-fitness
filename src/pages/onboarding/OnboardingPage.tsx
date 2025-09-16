import React from 'react'

const OnboardingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Let's Get You Started! 💪
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Tell us about your fitness goals and preferences
          </p>
        </div>
        
        <div className="card p-8">
          <p className="text-center text-gray-600 dark:text-gray-400">
            Onboarding flow will be implemented here
          </p>
        </div>
      </div>
    </div>
  )
}

export default OnboardingPage