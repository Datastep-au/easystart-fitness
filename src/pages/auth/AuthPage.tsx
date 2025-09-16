import React from 'react'

const AuthPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            EasyStart Fitness
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Your personalized fitness journey starts here
          </p>
        </div>
        
        <div className="card p-8">
          <p className="text-center text-gray-600 dark:text-gray-400">
            Auth functionality will be implemented here
          </p>
        </div>
      </div>
    </div>
  )
}

export default AuthPage