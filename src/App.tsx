import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAppStore } from './store'
import AuthGate from './components/auth/AuthGate'

// Layout components
import Layout from './components/layout/Layout'

// Page components
import AuthPage from './pages/auth/AuthPage'
import OnboardingPage from './pages/onboarding/OnboardingPage'
import TodayPage from './pages/today/TodayPage'
import LibraryPage from './pages/library/LibraryPage'
import PlanPage from './pages/plan/PlanPage'
import SettingsPage from './pages/settings/SettingsPage'
import TimerPage from './pages/timer/TimerPage'

function App() {
  const { initialize, loadSettings, loadLibrary } = useAppStore()

  // Initialize app on mount
  useEffect(() => {
    initialize()
    loadSettings()
    loadLibrary()
  }, [initialize, loadSettings, loadLibrary])

  return (
    <Router>
      <div className="App min-h-screen bg-gray-50 dark:bg-gray-900">
        <Routes>
          {/* Public routes */}
          <Route path="/auth/*" element={<AuthPage />} />
          
          {/* Protected routes */}
          <Route 
            path="/onboarding" 
            element={
              <AuthGate>
                <OnboardingPage />
              </AuthGate>
            } 
          />
          
          {/* Main app routes - require auth and onboarding */}
          <Route 
            path="/*" 
            element={
              <AuthGate requireOnboarding>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Navigate to="/today" replace />} />
                    <Route path="/today" element={<TodayPage />} />
                    <Route path="/library" element={<LibraryPage />} />
                    <Route path="/plan" element={<PlanPage />} />
                    <Route path="/timer" element={<TimerPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    
                    {/* Catch all - redirect to today */}
                    <Route path="*" element={<Navigate to="/today" replace />} />
                  </Routes>
                </Layout>
              </AuthGate>
            } 
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App
