import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { 
  Home, 
  Book, 
  Calendar, 
  Timer, 
  Settings,
  User,
  LogOut,
  Moon,
  Sun,
  Wifi,
  WifiOff
} from 'lucide-react'
import { useAppStore } from '../../store'

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation()
  const { 
    profile, 
    signOut, 
    theme, 
    setTheme, 
    isOnline,
    offlineQueue 
  } = useAppStore()

  const navigation = [
    { name: 'Today', href: '/today', icon: Home },
    { name: 'Library', href: '/library', icon: Book },
    { name: 'Plan', href: '/plan', icon: Calendar },
    { name: 'Timer', href: '/timer', icon: Timer },
    { name: 'Settings', href: '/settings', icon: Settings },
  ]

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'
    setTheme(newTheme)
  }

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-5 w-5" />
      case 'dark':
        return <Moon className="h-5 w-5" />
      default:
        return <div className="h-5 w-5 rounded-full bg-gradient-to-r from-yellow-400 to-blue-600" />
    }
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0">
        <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 px-4">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">ES</span>
              </div>
              <span className="ml-2 text-xl font-semibold text-gray-900 dark:text-white">
                EasyStart
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="mt-8 flex-1 px-2 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-primary-100 text-primary-900 dark:bg-primary-900 dark:text-primary-100'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {item.name}
                </NavLink>
              )
            })}
          </nav>

          {/* User section */}
          <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700">
            {/* Offline indicator */}
            <div className="px-4 py-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {isOnline ? (
                    <Wifi className="h-4 w-4 text-green-500" />
                  ) : (
                    <WifiOff className="h-4 w-4 text-red-500" />
                  )}
                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                    {isOnline ? 'Online' : 'Offline'}
                    {offlineQueue.length > 0 && (
                      <span className="ml-1">({offlineQueue.length})</span>
                    )}
                  </span>
                </div>
                
                {/* Theme toggle */}
                <button
                  onClick={toggleTheme}
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title={`Current theme: ${theme}`}
                >
                  {getThemeIcon()}
                </button>
              </div>
            </div>

            {/* User menu */}
            <div className="p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  </div>
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {profile?.display_name || 'User'}
                  </p>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                  >
                    <LogOut className="h-3 w-3 mr-1" />
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile navigation - Bottom bar */}
      <div className="md:hidden fixed bottom-0 inset-x-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 safe-area-inset">
        <nav className="flex justify-around py-2">
          {navigation.slice(0, 5).map((item) => {
            const isActive = location.pathname === item.href
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={`flex flex-col items-center px-3 py-2 text-xs transition-colors ${
                  isActive
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <item.icon className="h-5 w-5 mb-1" />
                <span>{item.name}</span>
              </NavLink>
            )
          })}
        </nav>
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1 overflow-hidden">
        <main className="flex-1 relative overflow-y-auto focus:outline-none pb-16 md:pb-0">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout