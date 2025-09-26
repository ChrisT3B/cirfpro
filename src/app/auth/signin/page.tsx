'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useSearchParams } from 'next/navigation'
import { Input, PasswordInput } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Heading, Text, Label } from '@/components/ui/Typography'
import { Card, CardContent } from '@/components/ui/Card'
import { AlertCircle, CheckCircle, Mail } from 'lucide-react'

interface FormData {
  email: string
  password: string
  rememberMe: boolean
}

interface FormErrors {
  email?: string
  password?: string
  general?: string
}

function SignInForm() {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    rememberMe: false
  })
  
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  
  const searchParams = useSearchParams()
  const { signIn } = useAuth()
  const router = useRouter()

  // Handle URL parameters for verification messages and errors
  useEffect(() => {
    const error = searchParams.get('error')
    const verified = searchParams.get('verified')
    const message = searchParams.get('message')
    
    if (error) {
      if (message) {
        setErrors({ general: decodeURIComponent(message) })
      } else {
        switch (error) {
          case 'verification_failed':
            setErrors({ general: 'Email verification failed. The link may have expired.' })
            break
          case 'unexpected_error':
            setErrors({ general: 'An unexpected error occurred. Please try again.' })
            break
          default:
            setErrors({ general: 'An error occurred during authentication.' })
        }
      }
    }
    
    if (verified === 'true') {
      if (message) {
        setSuccessMessage(decodeURIComponent(message))
      } else {
        setSuccessMessage('Email verified successfully! You can now sign in.')
      }
    }
  }, [searchParams])

  // Input change handler with real-time validation
  const handleInputChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = field === 'rememberMe' ? e.target.checked : e.target.value
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear field error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }))
    }
  }

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Form submission handler - MAINTAINS ALL EXISTING SECURITY
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccessMessage(null)
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      // ✅ USES EXACT SAME AUTH FLOW - No security changes
      await signIn(formData.email, formData.password)
      
      // ✅ MAINTAINS EXISTING REDIRECT LOGIC
      router.push('/dashboard')
    } catch (err: unknown) {
      console.error('Sign-in error:', err)
      
      // Enhanced error handling while maintaining security
      const errorMessage = err instanceof Error ? err.message : 'Sign-in failed'
      
      // Map common Supabase auth errors to user-friendly messages
      if (errorMessage.includes('Invalid login credentials')) {
        setErrors({ general: 'Invalid email or password. Please check your credentials and try again.' })
      } else if (errorMessage.includes('Email not confirmed')) {
        setErrors({ general: 'Please check your email and click the verification link before signing in.' })
      } else if (errorMessage.includes('Too many requests')) {
        setErrors({ general: 'Too many sign-in attempts. Please wait a few minutes before trying again.' })
      } else {
        setErrors({ general: errorMessage })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cirfpro-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Heading level="h1" className="text-cirfpro-gray-900">
            Welcome back to CIRFPRO
          </Heading>
          <Text size="lg" color="muted" className="mt-2">
            Sign in to your coach account
          </Text>
        </div>

        <Card variant="elevated" className="shadow-lg">
          <CardContent className="p-8">
            {/* Success Message */}
            {successMessage && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  <Text size="sm" className="text-green-800">
                    {successMessage}
                  </Text>
                </div>
              </div>
            )}

            {/* General Error */}
            {errors.general && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
                  <Text size="sm" className="text-red-800">
                    {errors.general}
                  </Text>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <Input
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                error={errors.email}
                required
                placeholder="your@email.com"
                leftIcon={<Mail className="w-4 h-4" />}
                disabled={isLoading}
                autoComplete="email"
              />

              {/* Password Field */}
              <PasswordInput
                label="Password"
                value={formData.password}
                onChange={handleInputChange('password')}
                error={errors.password}
                required
                placeholder="Enter your password"
                disabled={isLoading}
                autoComplete="current-password"
              />

              {/* Remember Me & Forgot Password Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={handleInputChange('rememberMe')}
                    disabled={isLoading}
                    className="h-4 w-4 text-cirfpro-green-600 focus:ring-cirfpro-green-500 border-cirfpro-gray-300 rounded"
                  />
                  <Label 
                    htmlFor="remember-me" 
                    size="sm" 
                    className="ml-2 text-cirfpro-gray-600 cursor-pointer"
                  >
                    Remember me
                  </Label>
                </div>

                <Link 
                  href="/auth/forgot-password" 
                  className="text-sm font-medium text-cirfpro-green-600 hover:text-cirfpro-green-700 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isLoading}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            {/* Sign Up Link */}
            <div className="mt-6 text-center">
              <Text size="sm" color="muted">
                Don't have an account?{' '}
                <Link 
                  href="/auth/signup" 
                  className="font-medium text-cirfpro-green-600 hover:text-cirfpro-green-700 transition-colors"
                >
                  Create one here
                </Link>
              </Text>
            </div>

            {/* Demo Access (Optional - Remove in production) */}
            <div className="mt-4 pt-4 border-t border-cirfpro-gray-200">
              <Text size="xs" color="muted" className="text-center">
                Demo Access:{' '}
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      email: 'demo@cirfpro.com',
                      password: 'demo123'
                    }))
                  }}
                  className="text-cirfpro-green-600 hover:text-cirfpro-green-700 underline"
                >
                  Use demo credentials
                </button>
              </Text>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center">
          <Text size="xs" color="muted">
            Having trouble signing in?{' '}
            <Link 
              href="/support" 
              className="text-cirfpro-green-600 hover:text-cirfpro-green-700"
            >
              Contact support
            </Link>
          </Text>
        </div>
      </div>
    </div>
  )
}

// Wrapper component to handle Suspense for useSearchParams
export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-cirfpro-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-cirfpro-green-500 border-t-transparent"></div>
      </div>
    }>
      <SignInForm />
    </Suspense>
  )
}