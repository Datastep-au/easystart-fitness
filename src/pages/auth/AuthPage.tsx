import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAppStore } from '../../store'
import Button from '../../components/ui/Button'
import { Mail, Lock, User, AlertCircle } from 'lucide-react'

const AuthPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn, signUp, signInWithMagicLink, loading } = useAppStore()
  
  const [mode, setMode] = useState<'signin' | 'signup' | 'magic'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const from = (location.state as any)?.from || '/today'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      if (mode === 'magic') {
        await signInWithMagicLink(email)
        setSuccess('Magic link sent! Check your email to sign in.')
        return
      }

      if (mode === 'signup') {
        await signUp(email, password, displayName)
        setSuccess('Account created! Please check your email to verify your account.')
        return
      }

      if (mode === 'signin') {
        await signIn(email, password)
        navigate(from, { replace: true })
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-primary-600 rounded-lg flex items-center justify-center mb-4">
            <span className="text-white font-bold text-xl">ES</span>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            EasyStart Fitness
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {mode === 'signin' && 'Sign in to your account'}
            {mode === 'signup' && 'Create your fitness account'}
            {mode === 'magic' && 'Sign in with magic link'}
          </p>
        </div>

        {/* Auth Form */}
        <div className="card p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Display Name (Signup only) */}
            {mode === 'signup' && (
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Your Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="displayName"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="input pl-10"
                    placeholder="Enter your name"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-10"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password (not for magic link) */}
            {mode !== 'magic' && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input pl-10"
                    placeholder="Enter your password"
                    minLength={6}
                  />
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="flex items-center space-x-2 text-green-600 dark:text-green-400 text-sm">
                <span>✓ {success}</span>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              loading={loading}
              disabled={!email || (mode !== 'magic' && !password)}
            >
              {mode === 'signin' && 'Sign In'}
              {mode === 'signup' && 'Create Account'}
              {mode === 'magic' && 'Send Magic Link'}
            </Button>
          </form>

          {/* Mode Switching */}
          <div className="mt-6 space-y-3">
            <div className="text-center text-sm">
              {mode === 'signin' && (
                <>
                  <span className="text-gray-600 dark:text-gray-400">Don't have an account? </span>
                  <button
                    onClick={() => setMode('signup')}
                    className="text-primary-600 hover:text-primary-500 font-medium"
                  >
                    Sign up
                  </button>
                </>
              )}
              {mode === 'signup' && (
                <>
                  <span className="text-gray-600 dark:text-gray-400">Already have an account? </span>
                  <button
                    onClick={() => setMode('signin')}
                    className="text-primary-600 hover:text-primary-500 font-medium"
                  >
                    Sign in
                  </button>
                </>
              )}
              {mode === 'magic' && (
                <>
                  <span className="text-gray-600 dark:text-gray-400">Want to use a password? </span>
                  <button
                    onClick={() => setMode('signin')}
                    className="text-primary-600 hover:text-primary-500 font-medium"
                  >
                    Sign in normally
                  </button>
                </>
              )}
            </div>
            
            {mode !== 'magic' && (
              <div className="text-center">
                <button
                  onClick={() => setMode('magic')}
                  className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Or sign in with magic link
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Demo Info */}
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            This is a live demo with full functionality.
            <br />
            Create an account to try the personalized fitness program generator.
          </p>
        </div>
      </div>
    </div>
  )
}

export default AuthPage