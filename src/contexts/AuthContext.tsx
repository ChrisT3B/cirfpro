// src/contexts/AuthContext.tsx - JWT-FIRST ARCHITECTURE
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

  // Extract user profile from JWT token - NO DATABASE CALLS
  const extractProfileFromJWT = useCallback((user: SupabaseUser): User => {
    console.log('Extracting profile from JWT for:', user.email)
    
    return {
      id: user.id,
      email: user.email!,
      role: user.user_metadata.role as 'coach' | 'athlete',
      first_name: user.user_metadata.first_name || '',
      last_name: user.user_metadata.last_name || '',
      created_at: user.created_at,
      updated_at: new Date().toISOString()
    }
  }, [])

  // Fetch detailed profiles ONLY when needed (lazy loading)
  const fetchDetailedProfiles = useCallback(async (userId: string, role: 'coach' | 'athlete') => {
    try {
      console.log('Fetching detailed profile for:', role)
      
      if (role === 'coach') {
        const { data: coach, error } = await supabase
          .from('coach_profiles')
          .select('*')
          .eq('user_id', userId)
          .single()

        if (!error && coach) {
          setCoachProfile(coach)
          console.log('Coach profile loaded')
        }
      } else {
        const { data: athlete, error } = await supabase
          .from('athlete_profiles')
          .select('*')
          .eq('user_id', userId)
          .single()

        if (!error && athlete) {
          setAthleteProfile(athlete)
          console.log('Athlete profile loaded')
        }
      }
    } catch (error) {
      console.error('Error fetching detailed profile:', error)
    }
  }, [supabase])

  const refreshProfile = useCallback(async () => {
    if (user && profile) {
      console.log('Refreshing detailed profiles')
      await fetchDetailedProfiles(user.id, profile.role)
    }
  }, [user, profile, fetchDetailedProfiles])

  useEffect(() => {
    let mounted = true

    // Get initial session - JWT ONLY
    const getInitialSession = async () => {
      try {
        console.log('Getting initial session...')
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          setLoading(false)
          return
        }

        if (mounted && session?.user) {
          console.log('Session found, extracting profile from JWT')
          setUser(session.user)
          
          // Extract profile from JWT - INSTANT
          const profileFromJWT = extractProfileFromJWT(session.user)
          setProfile(profileFromJWT)
          
          console.log('Profile extracted from JWT:', profileFromJWT)
          
          // Fetch detailed profiles in background (non-blocking)
          fetchDetailedProfiles(session.user.id, profileFromJWT.role)
          
          setLoading(false) // User can navigate immediately
        } else {
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

    // Listen for auth changes - JWT ONLY
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event)
      
      if (mounted) {
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('Sign in detected - using JWT data')
          setUser(session.user)
          
          // Extract profile from JWT - INSTANT
          const profileFromJWT = extractProfileFromJWT(session.user)
          setProfile(profileFromJWT)
          
          console.log('Profile set from JWT, user can navigate')
          
          // Fetch detailed profiles in background
          fetchDetailedProfiles(session.user.id, profileFromJWT.role)
          
          setLoading(false) // Navigation enabled immediately
          
        } else if (event === 'SIGNED_OUT') {
          console.log('Sign out detected - clearing all data')
          setUser(null)
          setProfile(null)
          setCoachProfile(null)
          setAthleteProfile(null)
          setLoading(false)
        }
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [extractProfileFromJWT, fetchDetailedProfiles, supabase.auth])

  const signUp = async (email: string, password: string, userData: { role: 'coach' | 'athlete', firstName: string, lastName: string }) => {
    setLoading(true)
    try {
      console.log('Starting signup process using AuthService for:', email)

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
      console.log('Starting sign in for:', email)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('Sign in error:', error)
        throw error
      }

      if (!data.user) {
        throw new Error('No user data returned from sign in')
      }

      console.log('Sign in successful - JWT contains all needed data')
      
      // Auth state listener will handle profile extraction

    } catch (error) {
      console.error('Error signing in:', error)
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