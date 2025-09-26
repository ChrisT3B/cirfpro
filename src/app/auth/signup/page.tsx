'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AuthService } from '@/lib/authService'
import { Input, PasswordInput } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Heading, Text } from '@/components/ui/Typography'
import { Card, CardContent } from '@/components/ui/Card'
import { User, Briefcase, AlertCircle, CheckCircle } from 'lucide-react'

type UserRole = 'coach' | 'athlete'

interface FormData {
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  role: UserRole
}

interface FormErrors {
  email?: string
  password?: string
  confirmPassword?: string
  firstName?: string
  lastName?: string
  role?: string
  general?: string
}

export default function SignUpPage() {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'athlete'
  })
  
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // Input change handler with real-time validation
  const handleInputChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }))
    }
    
    // Real-time validation for specific fields
    if (field === 'confirmPassword' && formData.password) {
      if (value && value !== formData.password) {
        setErrors(prev => ({
          ...prev,
          confirmPassword: 'Passwords do not match'
        }))
      } else {
        setErrors(prev => ({
          ...prev,
          confirmPassword: undefined
        }))
      }
    }
  }

  // Role selection handler
  const handleRoleChange = (role: UserRole) => {
    setFormData(prev => ({
      ...prev,
      role
    }))
    
    if (errors.role) {
      setErrors(prev => ({
        ...prev,
        role: undefined
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
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long'
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    // First name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters long'
    }

    // Last name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters long'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccessMessage('')
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      console.log('Attempting user registration...')
      const result = await AuthService.registerUser({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role
      })

      console.log('Registration result:', result)

      if (result.error) {
        setErrors({ general: result.error.message })
      } else {
        setSuccessMessage(
          'Account created successfully! Please check your email for verification instructions.'
        )
        // Reset form on success
        setFormData({
          email: '',
          password: '',
          confirmPassword: '',
          firstName: '',
          lastName: '',
          role: 'athlete'
        })
      }
    } catch (err: unknown) {
      console.error('Registration exception:', err)
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setErrors({ general: errorMessage })
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
            Join CIRFPRO
          </Heading>
          <Text size="lg" color="muted" className="mt-2">
            Create your account to get started
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
              {/* Role Selection */}
              <div>
                <Text className="block mb-3 font-medium text-cirfpro-gray-700">
                  I am a:
                </Text>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleRoleChange('athlete')}
                    className={`flex items-center justify-center px-4 py-3 border rounded-lg font-medium transition-all duration-200 ${
                      formData.role === 'athlete'
                        ? 'border-cirfpro-green-500 bg-cirfpro-green-50 text-cirfpro-green-700'
                        : 'border-cirfpro-gray-300 bg-white text-cirfpro-gray-700 hover:border-cirfpro-gray-400'
                    }`}
                  >
                    <User className="w-5 h-5 mr-2" />
                    Runner/Athlete
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => handleRoleChange('coach')}
                    className={`flex items-center justify-center px-4 py-3 border rounded-lg font-medium transition-all duration-200 ${
                      formData.role === 'coach'
                        ? 'border-cirfpro-green-500 bg-cirfpro-green-50 text-cirfpro-green-700'
                        : 'border-cirfpro-gray-300 bg-white text-cirfpro-gray-700 hover:border-cirfpro-gray-400'
                    }`}
                  >
                    <Briefcase className="w-5 h-5 mr-2" />
                    Coach
                  </button>
                </div>
                {errors.role && (
                  <Text size="xs" className="text-red-600 mt-1">
                    {errors.role}
                  </Text>
                )}
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  value={formData.firstName}
                  onChange={handleInputChange('firstName')}
                  error={errors.firstName}
                  required
                  placeholder="John"
                  disabled={isLoading}
                />
                
                <Input
                  label="Last Name"
                  value={formData.lastName}
                  onChange={handleInputChange('lastName')}
                  error={errors.lastName}
                  required
                  placeholder="Doe"
                  disabled={isLoading}
                />
              </div>

              {/* Email Field */}
              <Input
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                error={errors.email}
                required
                placeholder="john@example.com"
                disabled={isLoading}
              />

              {/* Password Fields */}
              <PasswordInput
                label="Password"
                value={formData.password}
                onChange={handleInputChange('password')}
                error={errors.password}
                required
                placeholder="Create a secure password"
                helperText="Must be at least 6 characters long"
                disabled={isLoading}
              />

              <PasswordInput
                label="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleInputChange('confirmPassword')}
                error={errors.confirmPassword}
                required
                placeholder="Confirm your password"
                disabled={isLoading}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isLoading}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>

            {/* Sign In Link */}
            <div className="mt-6 text-center">
              <Text size="sm" color="muted">
                Already have an account?{' '}
                <Link 
                  href="/auth/signin" 
                  className="font-medium text-cirfpro-green-600 hover:text-cirfpro-green-700 transition-colors"
                >
                  Sign in here
                </Link>
              </Text>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center">
          <Text size="xs" color="muted">
            By creating an account, you agree to our{' '}
            <Link 
              href="/terms" 
              className="text-cirfpro-green-600 hover:text-cirfpro-green-700"
            >
              Terms of Service
            </Link>
            {' '}and{' '}
            <Link 
              href="/privacy" 
              className="text-cirfpro-green-600 hover:text-cirfpro-green-700"
            >
              Privacy Policy
            </Link>
          </Text>
        </div>
      </div>
    </div>
  )
}