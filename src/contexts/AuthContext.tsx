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
      console.log('Supabase client configured:', !!supabase)
      
      // First, let's check if we can access the auth user
      const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser()
      console.log('Current auth user:', currentUser?.id)
      console.log('Auth error:', authError)
      
      // Test basic database connectivity
      console.log('Testing basic database connectivity...')
      const { data: testData, error: testError } = await supabase
        .from('users')
        .select('count')
        .limit(1)
      
      console.log('Database connectivity test:', { testData, testError })
      
      // Now try to fetch the specific user
      console.log('Fetching user profile from database...')
      const { data: userProfile, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      console.log('User profile query result:')
      console.log('- Data:', userProfile)
      console.log('- Error:', userError)
      console.log('- Error details:', userError ? {
        message: userError.message,
        code: userError.code,
        details: userError.details,
        hint: userError.hint
      } : 'None')

      if (userError) {
        console.error('❌ User profile fetch failed:', userError)
        
        // Let's try to check if the user exists at all
        console.log('Checking if user exists in database...')
        const { data: allUsers, error: allUsersError } = await supabase
          .from('users')
          .select('id, email, role')
        
        console.log('All users in database:', allUsers)
        console.log('All users error:', allUsersError)
        
        throw userError
      }

      if (!userProfile) {
        console.error('❌ No user profile found for ID:', userId)
        throw new Error('User profile not found')
      }

      console.log('✅ User profile found:', userProfile)
      setProfile(userProfile)

      // Get role-specific profile
      if (userProfile.role === 'coach') {
        console.log('Fetching coach profile...')
        const { data: coach, error: coachError } = await supabase
          .from('coach_profiles')
          .select('*')
          .eq('user_id', userId)
          .single()

        console.log('Coach profile result:', { coach, coachError })

        if (coachError) {
          console.error('Coach profile error:', coachError)
          // For coaches, this might be OK if profile hasn't been created yet
          console.log('Creating missing coach profile...')
          const { data: newCoach, error: createError } = await supabase
            .from('coach_profiles')
            .insert({ user_id: userId })
            .select()
            .single()
          
          console.log('Coach profile creation result:', { newCoach, createError })
          if (!createError && newCoach) {
            setCoachProfile(newCoach)
          }
        } else {
          console.log('✅ Coach profile found:', coach)
          setCoachProfile(coach)
        }
        setAthleteProfile(null)
      } else {
        console.log('Fetching athlete profile...')
        const { data: athlete, error: athleteError } = await supabase
          .from('athlete_profiles')
          .select('*')
          .eq('user_id', userId)
          .single()

        console.log('Athlete profile result:', { athlete, athleteError })

        if (athleteError) {
          console.error('Athlete profile error:', athleteError)
          // For athletes, this might be OK if profile hasn't been created yet
          console.log('Creating missing athlete profile...')
          const { data: newAthlete, error: createError } = await supabase
            .from('athlete_profiles')
            .insert({ user_id: userId })
            .select()
            .single()
          
          console.log('Athlete profile creation result:', { newAthlete, createError })
          if (!createError && newAthlete) {
            setAthleteProfile(newAthlete)
          }
        } else {
          console.log('✅ Athlete profile found:', athlete)
          setAthleteProfile(athlete)
        }
        setCoachProfile(null)
      }
      
      console.log('=== PROFILE FETCH COMPLETED ===')
      console.log('Final state:', {
        profile: !!profile,
        coachProfile: !!coachProfile,
        athleteProfile: !!athleteProfile
      })

    } catch (error) {
      console.error('❌ CRITICAL ERROR in fetchProfile:', error)
      console.error('Error type:', typeof error)
      console.error('Error message:', error instanceof Error ? error.message : String(error))
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack')
      
      // Set loading to false even on error so UI doesn't hang
      setLoading(false)
    }
  }, [supabase, profile, coachProfile, athleteProfile])

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