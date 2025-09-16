import React, { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAppStore } from '../../store'
import { Loader2 } from 'lucide-react'

interface AuthGateProps {
  children: React.ReactNode
  redirectTo?: string
  requireOnboarding?: boolean
}

const AuthGate: React.FC<AuthGateProps> = ({ 
  children, 
  redirectTo = '/auth', 
  requireOnboarding = false 
}) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, loading, initialized, hasCompletedOnboarding } = useAppStore()

  useEffect(() => {
    if (!initialized || loading) return

    // Not authenticated - redirect to auth
    if (!user) {
      navigate(redirectTo, { 
        state: { from: location.pathname },
        replace: true 
      })
      return
    }

    // Authenticated but need onboarding
    if (requireOnboarding && !hasCompletedOnboarding() && location.pathname !== '/onboarding') {
      navigate('/onboarding', { replace: true })
      return
    }

    // Authenticated and completed onboarding, but on onboarding page - redirect to today
    if (hasCompletedOnboarding() && location.pathname === '/onboarding') {
      navigate('/today', { replace: true })
      return
    }
  }, [user, initialized, loading, hasCompletedOnboarding, navigate, location.pathname, redirectTo, requireOnboarding])

  // Show loading while initializing
  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary-600" />
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render children if redirecting
  if (!user || (requireOnboarding && !hasCompletedOnboarding() && location.pathname !== '/onboarding')) {
    return null
  }

  return <>{children}</>
}

export default AuthGate