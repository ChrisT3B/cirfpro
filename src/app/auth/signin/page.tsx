// src/app/auth/signin/page.tsx - CIRFPRO Branded Version
'use client'

import { useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useSearchParams } from 'next/navigation'

function SignInForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const searchParams = useSearchParams()
  
  const { signIn } = useAuth()
  const router = useRouter()

  // Handle URL parameters for verification messages
  useState(() => {
    const error = searchParams.get('error')
    const verified = searchParams.get('verified')
    const message = searchParams.get('message')
    
    if (error) {
      if (message) {
        setError(decodeURIComponent(message))
      } else {
        switch (error) {
          case 'verification_failed':
            setError('Email verification failed. The link may have expired.')
            break
          case 'unexpected_error':
            setError('An unexpected error occurred. Please try again.')
            break
          default:
            setError('An error occurred during authentication.')
        }
      }
    }
    
    if (verified === 'true') {
      if (message) {
        setMessage(decodeURIComponent(message))
      } else {
        setMessage('Email verified successfully! You can now sign in.')
      }
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await signIn(email, password)
      router.push('/dashboard')
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign in'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cirfpro-gray-100 via-white to-cirfpro-green-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* CIRFPRO Logo/Branding */}
        <div className="text-center mb-8">
          <div className="mx-auto w-24 h-24 bg-cirfpro-green rounded-full flex items-center justify-center mb-4 shadow-lg">
            <div className="text-white text-3xl font-bold font-open-sans">C</div>
          </div>
          <h1 className="text-4xl font-bold text-cirfpro-gray-800 font-open-sans">
            CIRFPRO
          </h1>
          <p className="text-cirfpro-gray-600 mt-2 font-open-sans">
            Professional Running Coaching Platform
          </p>
        </div>

        {/* Sign In Form Card */}
        <div className="bg-white rounded-xl shadow-xl border border-cirfpro-gray-200 p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-cirfpro-gray-800 font-open-sans">
              Welcome Back
            </h2>
            <p className="text-cirfpro-gray-600 mt-1 font-open-sans">
              Sign in to your account
            </p>
          </div>

          {/* Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 font-open-sans">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}
          
          {message && (
            <div className="bg-cirfpro-green-50 border border-cirfpro-green-200 text-cirfpro-green-700 px-4 py-3 rounded-lg mb-4 font-open-sans">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">{message}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-cirfpro-gray-700 mb-2 font-open-sans">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-cirfpro-gray-300 rounded-lg shadow-sm 
                         focus:outline-none focus:ring-2 focus:ring-cirfpro-green focus:border-cirfpro-green
                         transition-colors duration-200 font-open-sans
                         placeholder-cirfpro-gray-400"
                placeholder="coach@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-cirfpro-gray-700 mb-2 font-open-sans">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-cirfpro-gray-300 rounded-lg shadow-sm 
                         focus:outline-none focus:ring-2 focus:ring-cirfpro-green focus:border-cirfpro-green
                         transition-colors duration-200 font-open-sans
                         placeholder-cirfpro-gray-400"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-cirfpro-green hover:bg-cirfpro-green-600 
                       disabled:bg-cirfpro-gray-300 disabled:cursor-not-allowed
                       text-white font-semibold py-3 px-4 rounded-lg
                       transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]
                       focus:outline-none focus:ring-2 focus:ring-cirfpro-green-500 focus:ring-offset-2
                       shadow-lg hover:shadow-xl font-open-sans"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing In...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Additional Links */}
          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-cirfpro-gray-600 font-open-sans">
              Don&apos;t have an account?{' '}
              <Link 
                href="/auth/signup" 
                className="font-semibold text-cirfpro-green hover:text-cirfpro-green-600 
                         transition-colors duration-200 hover:underline"
              >
                Sign up now
              </Link>
            </p>
            <p className="text-xs text-cirfpro-gray-500 font-open-sans">
              Forgot your password?{' '}
              <Link 
                href="#" 
                className="text-cirfpro-green hover:text-cirfpro-green-600 
                         transition-colors duration-200 hover:underline"
              >
                Reset it here
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-cirfpro-gray-500 font-open-sans">
            © 2025 CIRFPRO. Professional running coaching platform.
          </p>
        </div>
      </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cirfpro-gray-100 via-white to-cirfpro-green-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md">
        <div className="text-center">
          <div className="w-12 h-12 bg-cirfpro-green rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          </div>
          <p className="text-cirfpro-gray-600 font-open-sans">Loading...</p>
        </div>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SignInForm />
    </Suspense>
  )
}