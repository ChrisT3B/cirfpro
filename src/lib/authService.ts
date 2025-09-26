// src/lib/authService.ts - Fixed version
import { createClient } from '@/lib/supabase'
import { InputSanitizer } from '@/utils/InputSanitizer'
import { SQLSecurityValidator } from '@/utils/sqlSecurityValidator'
import { AuthError } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

// Define proper types
type PendingUser = Database['public']['Tables']['pending_users']['Insert']

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

      console.log('Validation passed, creating Supabase auth user...')

      // Step 4: Create auth user first
      const { data: authData, error: authError } = await this.supabase.auth.signUp({
        email: emailValidation.clean!,
        password: registerData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (authError) {
        console.error('Auth user creation failed:', authError)
        return {
          data: null,
          error: authError
        }
      }

      if (!authData.user) {
        console.error('No user returned from auth signup')
        return {
          data: null,
          error: { 
            message: 'Failed to create auth user',
            name: 'AuthError',
            status: 500
          } as AuthError
        }
      }

      console.log('Auth user created successfully, creating pending user profile...')

      // Step 5: Create pending user profile
      const insertData: PendingUser = {
        id: authData.user.id,
        email: emailValidation.clean!,
        role: roleValidation.clean! as 'coach' | 'athlete',
        first_name: sanitizedData.firstName as string,
        last_name: sanitizedData.lastName as string,
        qualifications: sanitizedData.qualifications as string[] || null,
        specializations: sanitizedData.specializations as string[] || null,
        date_of_birth: sanitizedData.dateOfBirth as string || null,
        experience_level: sanitizedData.experienceLevel as 'beginner' | 'intermediate' | 'advanced' || null
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
        .insert(insertData)

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
      console.log('Starting email verification with token:', token.substring(0, 10) + '...')

      const { data, error } = await this.supabase.auth.verifyOtp({
        token_hash: token,
        type: 'email'
      })

      if (error) {
        console.error('Email verification failed:', error)
        return {
          success: false,
          message: error.message || 'Email verification failed'
        }
      }

      console.log('Email verification successful:', data)

      return {
        success: true,
        message: 'Email verified successfully. You can now sign in.',
        user: data.user
      }

    } catch (error) {
      console.error('Exception during email verification:', error)
      return {
        success: false,
        message: 'An unexpected error occurred during email verification'
      }
    }
  }

  /**
   * Test basic Supabase connectivity
   */
  static async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('count')
        .limit(1)

      if (error) {
        console.error('Connection test failed:', error)
        return {
          success: false,
          message: `Connection failed: ${error.message}`
        }
      }

      console.log('Connection test successful:', data)
      return {
        success: true,
        message: 'Successfully connected to Supabase'
      }

    } catch (error) {
      console.error('Exception during connection test:', error)
      return {
        success: false,
        message: 'Connection test failed with exception'
      }
    }
  }
}