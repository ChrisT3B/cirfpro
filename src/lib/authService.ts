// src/lib/authService.ts - UPDATED FOR PHASE 1
import { createClient } from '@/lib/supabase/client'

interface RegisterUserData {
  email: string
  password: string
  firstName: string
  lastName: string
  role: 'coach' | 'athlete'
  invitationToken?: string
  // Coach-specific fields
  qualifications?: string[]
  specializations?: string[]
  // Athlete-specific fields
  dateOfBirth?: string
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced'
}

interface AuthResult {
  success: boolean
  error?: {
    message: string
    code?: string
  }
  user?: any
}

export class AuthService {
  
  /**
   * Register a new user
   * PHASE 1: Sets JWT metadata immediately, stores in pending_users
   * Trigger handles migration on email verification
   */
  static async registerUser(data: RegisterUserData): Promise<AuthResult> {
    const supabase = createClient()
    
    try {
      console.log('🔐 Starting user registration for:', data.email)
      
      // Step 1: Create auth user with JWT metadata
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            // CRITICAL: Set JWT metadata immediately for instant navigation
            role: data.role,
            first_name: data.firstName,
            last_name: data.lastName,
          },
          emailRedirectTo: `${window.location.origin}/auth/signin`,
        }
      })

      if (signUpError) {
        console.error('❌ Signup error:', signUpError)
        return {
          success: false,
          error: {
            message: signUpError.message,
            code: signUpError.code
          }
        }
      }

      if (!authData.user) {
        return {
          success: false,
          error: {
            message: 'User creation failed - no user returned'
          }
        }
      }

      console.log('✅ Auth user created:', authData.user.id)

      // Step 2: Store in pending_users (backup for trigger)
      const { error: pendingError } = await supabase
        .from('pending_users')
        .insert({
          id: authData.user.id,
          email: data.email,
          role: data.role,
          first_name: data.firstName,
          last_name: data.lastName,
          qualifications: data.qualifications || null,
          specializations: data.specializations || null,
          date_of_birth: data.dateOfBirth || null,
          experience_level: data.experienceLevel || null,
          invitation_token: data.invitationToken || null,
          created_at: new Date().toISOString()
        })

      if (pendingError) {
        console.error('❌ Error creating pending_users record:', pendingError)
        // Non-fatal - user can still verify email, but trigger won't work
        // In production, you might want to handle this more gracefully
      } else {
        console.log('✅ pending_users record created')
      }

      console.log('✅ Registration complete - verification email sent')
      
      return {
        success: true,
        user: authData.user
      }

    } catch (error) {
      console.error('❌ Registration exception:', error)
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'An unexpected error occurred'
        }
      }
    }
  }

  /**
   * Sign in user
   * No changes needed - Supabase handles this
   */
  static async signIn(email: string, password: string): Promise<AuthResult> {
    const supabase = createClient()
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        return {
          success: false,
          error: {
            message: error.message,
            code: error.code
          }
        }
      }

      return {
        success: true,
        user: data.user
      }

    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'An unexpected error occurred'
        }
      }
    }
  }

  /**
   * Sign out user
   */
  static async signOut(): Promise<AuthResult> {
    const supabase = createClient()
    
    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        return {
          success: false,
          error: {
            message: error.message
          }
        }
      }

      return { success: true }

    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'An unexpected error occurred'
        }
      }
    }
  }

  /**
   * NOTE: verifyEmail() function REMOVED
   * Email verification is now handled automatically by the database trigger
   * No application code needed for this process
   */
}