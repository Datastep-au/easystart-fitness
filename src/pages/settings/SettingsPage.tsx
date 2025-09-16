import React from 'react'

const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your preferences and account
        </p>
      </div>
      
      <div className="card p-8">
        <p className="text-center text-gray-600 dark:text-gray-400">
          Settings panel will be implemented here
        </p>
      </div>
    </div>
  )
}

export default SettingsPage