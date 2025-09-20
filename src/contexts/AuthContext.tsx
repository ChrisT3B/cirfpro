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
  // Add this line with your other useState declarations
  const [profileLoaded, setProfileLoaded] = useState(false)

  const supabase = createClient()

  const fetchProfile = useCallback(async (userId: string, forceRefresh = false) => {
    // Skip if profile already loaded and not forcing refresh
    if (profileLoaded && !forceRefresh) {
      console.log('✅ Profile already loaded, skipping fetch')
      setLoading(false)
      return
    }

    try {
      console.log('=== FETCHING PROFILE FOR:', userId, '===')
      
      // Validate current auth session
      console.log('Validating auth session...')
      const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !currentUser || currentUser.id !== userId) {
        console.error('Auth validation failed:', authError?.message || 'User mismatch')
        setLoading(false)
        return
      }
      
      console.log('✅ Auth session valid, fetching profile...')

      // Now fetch user profile
      const { data: userProfile, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      console.log('User query result:', { 
        found: !!userProfile, 
        error: userError?.message,
        role: userProfile?.role
      })

      if (userError) {
        console.error('User profile fetch failed:', userError)
        setLoading(false)
        return
      }

      if (!userProfile) {
        console.error('No user profile found')
        setLoading(false)
        return
      }

      console.log('✅ User profile found:', userProfile.email, userProfile.role)
      setProfile(userProfile)

      // Get role-specific profile
      if (userProfile.role === 'coach') {
        console.log('Fetching coach profile...')
        const { data: coach, error: coachError } = await supabase
          .from('coach_profiles')
          .select('*')
          .eq('user_id', userId)
          .single()

        if (!coachError && coach) {
          console.log('✅ Coach profile found')
          setCoachProfile(coach)
        } else {
          console.log('Coach profile error:', coachError?.message)
        }
        setAthleteProfile(null)
      } else {
        console.log('Fetching athlete profile...')
        const { data: athlete, error: athleteError } = await supabase
          .from('athlete_profiles')
          .select('*')
          .eq('user_id', userId)
          .single()

        if (!athleteError && athlete) {
          console.log('✅ Athlete profile found')
          setAthleteProfile(athlete)
        } else {
          console.log('Athlete profile error:', athleteError?.message)
        }
        setCoachProfile(null)
      }
      
      // Mark profile as loaded
      setProfileLoaded(true)
      console.log('=== PROFILE FETCH COMPLETED ===')
      setLoading(false)

    } catch (error) {
      console.error('❌ Error in fetchProfile:', error)
      setLoading(false)
    }
  }, [supabase, profileLoaded])

    const refreshProfile = useCallback(async () => {
      if (user) {
     console.log('Manual profile refresh requested')
      setProfileLoaded(false)
      await fetchProfile(user.id, true)
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
        
        // Only fetch profile on significant events, not token refreshes
    if (event === 'SIGNED_IN' && session?.user) {
      console.log('Sign in detected - fetching profile')
      setProfileLoaded(false) // Reset loaded state
      await fetchProfile(session.user.id, true) // Force refresh
    } else if (event === 'SIGNED_OUT') {
      console.log('Sign out detected - clearing profiles')
      setProfile(null)
      setCoachProfile(null)
      setAthleteProfile(null)
      setProfileLoaded(false)
      setLoading(false)
    } else if (event === 'INITIAL_SESSION' && session?.user) {
      console.log('Initial session detected')
      await fetchProfile(session.user.id, false) // Don't force if already loaded
    } else if (event === 'TOKEN_REFRESHED') {
      console.log('Token refreshed - no profile fetch needed')
      // Just update user, don't refetch profile
    }
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