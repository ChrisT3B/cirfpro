// src/app/auth/signin/page.tsx - CIRFPRO Branded Version with Real Logo
'use client'

import { useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useSearchParams } from 'next/navigation'
import { CirfproLogo } from '@/components/ui/CirfproLogo'

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
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" 
         style={{ background: 'linear-gradient(135deg, #5a5e64 0%, #404449 100%)' }}>
      <div className="max-w-md w-full">
        {/* CIRFPRO Logo/Branding */}
        <div className="text-center mb-8">
          <div className="flex justify-center -mb-1">
            <CirfproLogo size="xxxxlarge" variant="icon" />
          </div>
          <h1 className="text-4xl font-bold font-open-sans text-white">
            Cirfpro
          </h1>
          <p className="mt-2 font-open-sans text-white opacity-80">
            Professional Running Coaching Platform
          </p>
        </div>

        {/* Sign In Form Card */}
        <div className="bg-white rounded-xl shadow-xl border-2 p-8" style={{ borderColor: '#e5e7eb' }}>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold font-open-sans" style={{ color: '#5a5e64' }}>
              Welcome Back
            </h2>
            <p className="mt-1 font-open-sans" style={{ color: '#6b7280' }}>
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
            <div className="px-4 py-3 rounded-lg mb-4 font-open-sans" 
                 style={{ backgroundColor: '#f0fdf4', borderColor: '#bbf7d0', color: '#15803d', border: '1px solid' }}>
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
              <label htmlFor="email" className="block text-sm font-medium mb-2 font-open-sans" style={{ color: '#5a5e64' }}>
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border rounded-lg shadow-sm transition-all duration-200 font-open-sans
                         focus:outline-none focus:ring-2 focus:border-transparent"
                style={{ 
                  borderColor: '#d1d5db'
                }}
                onFocus={(e) => {
                  const target = e.target as HTMLInputElement
                  target.style.borderColor = '#29b643'
                  target.style.boxShadow = '0 0 0 2px rgba(41, 182, 67, 0.2)'
                }}
                onBlur={(e) => {
                  const target = e.target as HTMLInputElement
                  target.style.borderColor = '#d1d5db'
                  target.style.boxShadow = 'none'
                }}
                placeholder="coach@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2 font-open-sans" style={{ color: '#5a5e64' }}>
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border rounded-lg shadow-sm transition-all duration-200 font-open-sans
                         focus:outline-none focus:ring-2 focus:border-transparent"
                style={{ 
                  borderColor: '#d1d5db'
                }}
                onFocus={(e) => {
                  const target = e.target as HTMLInputElement
                  target.style.borderColor = '#29b643'
                  target.style.boxShadow = '0 0 0 2px rgba(41, 182, 67, 0.2)'
                }}
                onBlur={(e) => {
                  const target = e.target as HTMLInputElement
                  target.style.borderColor = '#d1d5db'
                  target.style.boxShadow = 'none'
                }}
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full font-semibold py-3 px-4 rounded-lg transition-all duration-200 
                       transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none 
                       shadow-lg hover:shadow-xl font-open-sans disabled:cursor-not-allowed"
              style={{ 
                background: isLoading ? '#9ca3af' : 'linear-gradient(135deg, #29b643 0%, #1f8c33 100%)',
                color: 'white'
              }}
              onMouseEnter={(e) => {
                const target = e.target as HTMLButtonElement
                if (!isLoading) {
                  target.style.background = 'linear-gradient(135deg, #1f8c33 0%, #166425 100%)'
                }
              }}
              onMouseLeave={(e) => {
                const target = e.target as HTMLButtonElement
                if (!isLoading) {
                  target.style.background = 'linear-gradient(135deg, #29b643 0%, #1f8c33 100%)'
                }
              }}
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
            <p className="text-sm font-open-sans" style={{ color: '#6b7280' }}>
              Don&apos;t have an account?{' '}
              <Link 
                href="/auth/signup" 
                className="font-semibold transition-colors duration-200 hover:underline"
                style={{ color: '#29b643' }}
                onMouseEnter={(e) => {
                  const target = e.target as HTMLAnchorElement
                  target.style.color = '#1f8c33'
                }}
                onMouseLeave={(e) => {
                  const target = e.target as HTMLAnchorElement
                  target.style.color = '#29b643'
                }}
              >
                Sign up now
              </Link>
            </p>
            <p className="text-xs font-open-sans" style={{ color: '#9ca3af' }}>
              Forgot your password?{' '}
              <Link 
                href="#" 
                className="transition-colors duration-200 hover:underline"
                style={{ color: '#29b643' }}
                onMouseEnter={(e) => {
                  const target = e.target as HTMLAnchorElement
                  target.style.color = '#1f8c33'
                }}
                onMouseLeave={(e) => {
                  const target = e.target as HTMLAnchorElement
                  target.style.color = '#29b643'
                }}
              >
                Reset it here
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm font-open-sans" style={{ color: '#9ca3af' }}>
            © 2025 CIRFPRO. Professional running coaching platform.
          </p>
        </div>
      </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center"
         style={{ background: 'linear-gradient(135deg, #5a5e64 0%, #404449 100%)' }}>
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
               style={{ background: 'linear-gradient(135deg, #29b643 0%, #1f8c33 100%)' }}>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          </div>
          <p className="font-open-sans" style={{ color: '#6b7280' }}>Loading...</p>
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