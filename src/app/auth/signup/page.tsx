// src/app/auth/signup/page.tsx - TEMPORARY VERSION FOR TESTING
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AuthService } from '@/lib/authService'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [role, setRole] = useState<'coach' | 'athlete'>('athlete')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    
    switch(name) {
      case 'email':
        setEmail(value)
        break
      case 'password':
        setPassword(value)
        break
      case 'firstName':
        setFirstName(value)
        break
      case 'lastName':
        setLastName(value)
        break
      case 'role':
        setRole(value as 'coach' | 'athlete')
        break
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Basic client-side validation
    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      setIsLoading(false)
      return
    }

    if (firstName.trim().length < 2) {
      setError('First name must be at least 2 characters long')
      setIsLoading(false)
      return
    }

    if (lastName.trim().length < 2) {
      setError('Last name must be at least 2 characters long')
      setIsLoading(false)
      return
    }

    try {
      console.log('Testing AuthService.registerUser...')
      const result = await AuthService.registerUser({
        email: email,
        password: password,
        firstName: firstName,
        lastName: lastName,
        role: role
      })

      console.log('AuthService result:', result)

      if (result.error) {
        setError(`AuthService error: ${result.error.message}`)
        // result.data is now a User object, not a simple object with id
        const userId = typeof result.data === 'object' && result.data && 'id' in result.data 
          ? (result.data as { id: string }).id 
          : 'unknown'
        setError(`SUCCESS: User registered with ID ${userId}. Check pending_users table!`)
      } else {
        setError('SUCCESS: User registration initiated. Check your email for verification.')
      }

 } catch (err: unknown) {
      console.error('Exception during AuthService test:', err)
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(`Exception: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            CIRFPRO Auth Test
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Testing AuthService registration
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className={`border px-4 py-3 rounded mb-4 text-sm ${
              error.includes('SUCCESS') 
                ? 'bg-green-50 border-green-200 text-green-600'
                : 'bg-red-50 border-red-200 text-red-600'
            }`}>
              {error}
            </div>
          )}

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700">I am a:</label>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <div>
                <input
                  type="radio"
                  id="athlete"
                  name="role"
                  value="athlete"
                  checked={role === 'athlete'}
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <label
                  htmlFor="athlete"
                  className={`block w-full px-4 py-2 text-center border rounded-md cursor-pointer ${
                    role === 'athlete'
                      ? 'border-blue-500 bg-blue-50 text-blue-600'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  Runner/Athlete
                </label>
              </div>
              <div>
                <input
                  type="radio"
                  id="coach"
                  name="role"
                  value="coach"
                  checked={role === 'coach'}
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <label
                  htmlFor="coach"
                  className={`block w-full px-4 py-2 text-center border rounded-md cursor-pointer ${
                    role === 'coach'
                      ? 'border-blue-500 bg-blue-50 text-blue-600'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  Coach
                </label>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                id="firstName"
                required
                value={firstName}
                onChange={handleInputChange}
                className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                id="lastName"
                required
                value={lastName}
                onChange={handleInputChange}
                className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              type="email"
              name="email"
              id="email"
              required
              value={email}
              onChange={handleInputChange}
              className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              required
              minLength={6}
              value={password}
              onChange={handleInputChange}
              className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Testing Auth...' : 'Test AuthService'}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            This is a temporary test page.{' '}
            <Link href="/auth/signin" className="font-medium text-blue-600 hover:text-blue-500">
              Back to signin
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}