// src/contexts/AuthContext.tsx - ENHANCED DEBUG VERSION
'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase'
import type { User, CoachProfile, AthleteProfile } from '@/lib/supabase'

interface AuthContextType {
  user: SupabaseUser | null
  profile: User | null
  coachProfile: CoachProfile | null
  athleteProfile: AthleteProfile | null
  loading: boolean
  signUp: (email: string, password: string, userData: { role: 'coach' | 'athlete', firstName: string, lastName: string }) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<User | null>(null)
  const [coachProfile, setCoachProfile] = useState<CoachProfile | null>(null)
  const [athleteProfile, setAthleteProfile] = useState<AthleteProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

const fetchProfile = useCallback(async (userId: string) => {
    try {
      console.log('=== STARTING PROFILE FETCH ===')
      console.log('Fetching profile for user ID:', userId)
      
      // Add timeout to prevent hanging
      const createTimeoutPromise = () => new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Database query timeout')), 10000)
      );

      // Test basic connectivity first
      console.log('Testing auth.getUser()...')
      const authUserPromise = supabase.auth.getUser()
      
      try {
        const { data: authData, error: authError } = await Promise.race([
          authUserPromise, 
          createTimeoutPromise()
        ])
        
        console.log('Auth user result:', { user: authData?.user?.id, error: authError })

        if (authError) {
          console.error('Auth error:', authError)
          throw authError
        }
      } catch (error) {
        if (error instanceof Error && error.message === 'Database query timeout') {
          console.error('❌ Auth query timed out')
          throw new Error('Authentication check timed out')
        }
        throw error
      }

      // Now try the users table query with timeout
      console.log('Querying users table...')
      const userQueryPromise = supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      try {
        const { data: userProfile, error: userError } = await Promise.race([
          userQueryPromise, 
          createTimeoutPromise()
        ])

        console.log('User query result:', { 
          data: userProfile, 
          error: userError,
          errorCode: userError?.code,
          errorMessage: userError?.message
        })

        if (userError) {
          console.error('User profile fetch failed:', userError)
          throw userError
        }

        if (!userProfile) {
          console.error('No user profile found for ID:', userId)
          throw new Error('User profile not found')
        }

        console.log('✅ User profile found:', userProfile)
        setProfile(userProfile)

        // Get role-specific profile with timeout
        if (userProfile.role === 'coach') {
          console.log('Fetching coach profile...')
          const coachQueryPromise = supabase
            .from('coach_profiles')
            .select('*')
            .eq('user_id', userId)
            .single()

          try {
            const { data: coach, error: coachError } = await Promise.race([
              coachQueryPromise, 
              createTimeoutPromise()
            ])

            console.log('Coach profile result:', { coach, coachError })

            if (coachError) {
              console.error('Error fetching coach profile:', coachError)
            } else {
              console.log('✅ Coach profile found:', coach)
              setCoachProfile(coach)
            }
          } catch (error) {
            console.error('Coach profile query failed:', error)
          }
          setAthleteProfile(null)
        } else {
          console.log('Fetching athlete profile...')
          const athleteQueryPromise = supabase
            .from('athlete_profiles')
            .select('*')
            .eq('user_id', userId)
            .single()

          try {
            const { data: athlete, error: athleteError } = await Promise.race([
              athleteQueryPromise, 
              createTimeoutPromise()
            ])

            console.log('Athlete profile result:', { athlete, athleteError })

            if (athleteError) {
              console.error('Error fetching athlete profile:', athleteError)
            } else {
              console.log('✅ Athlete profile found:', athlete)
              setAthleteProfile(athlete)
            }
          } catch (error) {
            console.error('Athlete profile query failed:', error)
          }
          setCoachProfile(null)
        }
        
        console.log('=== PROFILE FETCH COMPLETED ===')
        
      } catch (error) {
        if (error instanceof Error && error.message === 'Database query timeout') {
          console.error('❌ User query timed out')
          throw new Error('User profile query timed out')
        }
        throw error
      }

    } catch (error) {
      console.error('❌ CRITICAL ERROR in fetchProfile:', error)
      console.error('Error type:', typeof error)
      console.error('Error message:', error instanceof Error ? error.message : String(error))
      
      // Make sure loading stops even on error
      setLoading(false)
    }
  }, [supabase])

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.id)
    }
  }, [user, fetchProfile])

  useEffect(() => {
    let mounted = true

    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('Getting initial session...')
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          setLoading(false)
          return
        }

        console.log('Initial session:', session?.user?.id)

        if (mounted) {
          setUser(session?.user ?? null)
          if (session?.user) {
            await fetchProfile(session.user.id)
          }
          setLoading(false)
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', event, session?.user?.id)
      
      if (mounted) {
        setUser(session?.user ?? null)
        
        if (session?.user) {
          console.log('Auth state change - fetching profile for:', session.user.id)
          await fetchProfile(session.user.id)
        } else {
          console.log('Auth state change - clearing profiles')
          setProfile(null)
          setCoachProfile(null)
          setAthleteProfile(null)
        }
        
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [fetchProfile, supabase.auth])

  const signUp = async (email: string, password: string, userData: { role: 'coach' | 'athlete', firstName: string, lastName: string }) => {
    setLoading(true)
    try {
      console.log('Starting signup process using AuthService for:', email)

      // Import AuthService dynamically to avoid import issues
      const { AuthService } = await import('@/lib/authService')

      const result = await AuthService.registerUser({
        email,
        password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role
      })

      if (result.error) {
        console.error('Registration failed:', result.error.message)
        throw new Error(result.error.message)
      }

      console.log('Registration successful, verification email sent')
      alert('Please check your email and click the verification link to complete registration.')

    } catch (error) {
      console.error('Error signing up:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      console.log('🔑 Starting sign in for:', email)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('❌ Sign in error:', error)
        throw error
      }

      if (!data.user) {
        throw new Error('No user data returned from sign in')
      }

      console.log('✅ Sign in successful for user:', data.user.id)
      console.log('User email confirmed:', data.user.email_confirmed_at)
      console.log('User metadata:', data.user.user_metadata)
      
      // The auth state change listener will handle fetching the profile
      // No need to do anything else here

    } catch (error) {
      console.error('❌ Error signing in:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    profile,
    coachProfile,
    athleteProfile,
    loading,
    signUp,
    signIn,
    signOut,
    refreshProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}