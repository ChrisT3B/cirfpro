// src/lib/authService.ts - Fixed version
import { createClient } from '@/lib/supabase'
import { InputSanitizer } from '@/utils/InputSanitizer'
import { SQLSecurityValidator } from '@/utils/sqlSecurityValidator'
import { AuthError } from '@supabase/supabase-js'

interface SignUpData {
  email: string
  password: string
  firstName: string
  lastName: string
  role: 'coach' | 'athlete'
  qualifications?: string[]
  specializations?: string[]
  dateOfBirth?: string
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced'
}

interface AuthResponse<T = unknown> {
  data: T | null
  error: AuthError | null
}

export class AuthService {
  private static supabase = createClient()

  /**
   * Enhanced user registration with security validation
   */
  static async registerUser(registerData: SignUpData): Promise<AuthResponse> {
    try {
      console.log('Starting secure registration for:', registerData.email)

      // Step 1: Input sanitization
      const sanitizedData = InputSanitizer.sanitizeFormData({
        email: registerData.email,
        firstName: registerData.firstName,
        lastName: registerData.lastName,
        role: registerData.role,
        qualifications: registerData.qualifications || [],
        specializations: registerData.specializations || [],
        dateOfBirth: registerData.dateOfBirth,
        experienceLevel: registerData.experienceLevel || 'beginner'
      })

      console.log('Input sanitization completed')

      // Step 2: Email validation
      const emailValidation = SQLSecurityValidator.validateEmailForDB(sanitizedData.email as string)
      if (!emailValidation.isValid) {
        return {
          data: null,
          error: { 
            message: emailValidation.error || 'Invalid email format',
            name: 'ValidationError',
            status: 400
          } as AuthError
        }
      }

      // Step 3: Role validation
      const roleValidation = SQLSecurityValidator.validateRole(sanitizedData.role as string)
      if (!roleValidation.isValid) {
        return {
          data: null,
          error: { 
            message: roleValidation.error || 'Invalid role',
            name: 'ValidationError',
            status: 400
          } as AuthError
        }
      }

      // Step 4: Experience level validation (for athletes)
      if (registerData.role === 'athlete' && registerData.experienceLevel) {
        const experienceValidation = SQLSecurityValidator.validateExperienceLevel(sanitizedData.experienceLevel as string)
        if (!experienceValidation.isValid) {
          return {
            data: null,
            error: { 
              message: experienceValidation.error || 'Invalid experience level',
              name: 'ValidationError',
              status: 400
            } as AuthError
          }
        }
      }

      console.log('Validation completed successfully')

      // Step 5: Create Supabase auth user FIRST
      console.log('Creating Supabase auth user first...')
      const { data: authData, error: authError } = await this.supabase.auth.signUp({
        email: emailValidation.clean!,
        password: registerData.password,
        options: {
          data: {
            role: roleValidation.clean!,
            first_name: sanitizedData.firstName,
            last_name: sanitizedData.lastName,
          },
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/auth/callback`,
        },
      })

      if (authError) {
        console.error('Auth signup failed:', {
          message: authError.message,
          status: authError.status,
          name: authError.name
        })
        return { data: null, error: authError }
      }

      if (!authData.user) {
        return {
          data: null,
          error: { 
            message: 'Failed to create user account',
            name: 'AuthError',
            status: 500
          } as AuthError
        }
      }

      console.log('Auth user created, now creating pending user record with correct ID...')

      // Step 6: Create pending user record with the auth user ID
      console.log('About to insert pending user with data:', {
  id: authData.user.id,
  email: emailValidation.clean!,
  role: roleValidation.clean!,
  first_name: sanitizedData.firstName,
  last_name: sanitizedData.lastName
})
// Right before the .from('pending_users').insert() call, add:
const insertData = {
  id: authData.user.id,
  email: emailValidation.clean!,
  role: roleValidation.clean! as 'coach' | 'athlete',
  first_name: sanitizedData.firstName,
  last_name: sanitizedData.lastName,
  qualifications: sanitizedData.qualifications,
  specializations: sanitizedData.specializations,
  date_of_birth: sanitizedData.dateOfBirth,
  experience_level: sanitizedData.experienceLevel as 'beginner' | 'intermediate' | 'advanced'
}

console.log('=== PENDING USER INSERT DATA ===', insertData)
console.log('Data types:', {
  id: typeof insertData.id,
  email: typeof insertData.email,
  role: typeof insertData.role,
  first_name: typeof insertData.first_name,
  last_name: typeof insertData.last_name
})
      const { error: pendingError } = await this.supabase
        .from('pending_users')
        .insert(insertData as any) // Add type assertion here


      if (pendingError) {
        console.error('Error creating pending user:', {
          message: pendingError.message,
          code: pendingError.code,
          details: pendingError.details,
          hint: pendingError.hint
        })
        
        // Clean up auth user if pending user creation fails
        await this.supabase.auth.signOut()
        
        return {
          data: null,
          error: { 
            message: pendingError.message || 'Failed to create user profile',
            name: 'DatabaseError',
            status: 500
          } as AuthError
        }
      }

      console.log('Registration completed successfully, verification email sent')

      return {
        data: authData.user,
        error: null
      }

    } catch (error) {
      console.error('Unexpected registration error:', error)
      
      return {
        data: null,
        error: { 
          message: 'An unexpected error occurred during registration',
          name: 'UnexpectedError',
          status: 500
        } as AuthError
      }
    }
  }

  /**
   * Verify email and complete user registration
   */
  static async verifyEmail(token: string): Promise<{ success: boolean; message: string; user?: unknown }> {
    try {
      console.log('Starting email verification')

      // Step 1: Verify with Supabase
      const { data, error } = await this.supabase.auth.verifyOtp({
        token_hash: token,
        type: 'email',
      })

      if (error) {
        console.error('Email verification failed:', error)
        return {
          success: false,
          message: 'Email verification failed - the link may have expired'
        }
      }

      if (!data.user) {
        return {
          success: false,
          message: 'Verification successful but user data not found'
        }
      }

      console.log('Email verified, completing user registration')

      // Step 2: Complete user registration
      const { error: completionError } = await this.supabase.rpc('complete_user_registration', {
      user_id: data.user.id
      } as any) // Add type assertion here

      if (completionError) {
        console.error('Error completing user registration:', completionError)
        return {
          success: false,
          message: 'Email verified but failed to complete registration. Please contact support.'
        }
      }

      console.log('User registration completed successfully')

      // Step 3: Sign out the user so they must log in manually
      await this.supabase.auth.signOut()

      return {
        success: true,
        message: 'Email verified successfully! You can now sign in with your credentials.',
        user: data.user
      }

    } catch (error) {
      console.error('Unexpected verification error:', error)
      return {
        success: false,
        message: 'An unexpected error occurred during verification'
      }
    }
  }
}