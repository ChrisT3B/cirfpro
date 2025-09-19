// src/contexts/AuthContext.tsx
'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase'
import type { User, CoachProfile, AthleteProfile } from '@/lib/supabase'
import { AuthService } from '@/lib/authService'

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

  const fetchProfile = async (userId: string) => {
    try {
      // Get user profile
      const { data: userProfile, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (userError) throw userError

      setProfile(userProfile)

      // Get role-specific profile
      if (userProfile.role === 'coach') {
        const { data: coach, error: coachError } = await supabase
          .from('coach_profiles')
          .select('*')
          .eq('user_id', userId)
          .single()

        if (!coachError) setCoachProfile(coach)
        setAthleteProfile(null)
      } else {
        const { data: athlete, error: athleteError } = await supabase
          .from('athlete_profiles')
          .select('*')
          .eq('user_id', userId)
          .single()

        if (!athleteError) setAthleteProfile(athlete)
        setCoachProfile(null)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id)
    }
  }

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      
      if (session?.user) {
        await fetchProfile(session.user.id)
      } else {
        setProfile(null)
        setCoachProfile(null)
        setAthleteProfile(null)
      }
      
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, userData: { role: 'coach' | 'athlete', firstName: string, lastName: string }) => {
    setLoading(true)
    try {
      console.log('Starting signup process using AuthService for:', email)

      // Use the new AuthService with enhanced security
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Check if this is a first-time login (user verified but not in public.users)
      if (data.user) {
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('id', data.user.id)
          .single()

        if (!existingUser) {
          console.log('First login detected, moving pending user data...')
          
          // Get pending user data
          const { data: pendingUser, error: pendingError } = await supabase
            .from('pending_users')
            .select('*')
            .eq('id', data.user.id)
            .single()

          if (pendingUser && !pendingError) {
            // Move to users table
            const { error: usersError } = await supabase.from('users').insert({
              id: data.user.id,
              email: pendingUser.email,
              role: pendingUser.role,
              first_name: pendingUser.first_name,
              last_name: pendingUser.last_name
            })

            if (usersError) {
              console.error('Error creating user profile:', usersError)
              throw new Error('Failed to complete registration')
            }

            // Create profile based on role
            if (pendingUser.role === 'coach') {
              const { error: coachError } = await supabase.from('coach_profiles').insert({ 
                user_id: data.user.id 
              })
              if (coachError) console.error('Error creating coach profile:', coachError)
            } else {
              const { error: athleteError } = await supabase.from('athlete_profiles').insert({ 
                user_id: data.user.id 
              })
              if (athleteError) console.error('Error creating athlete profile:', athleteError)
            }

            // Clean up pending user
            const { error: deleteError } = await supabase
              .from('pending_users')
              .delete()
              .eq('id', data.user.id)
            
            if (deleteError) console.error('Error cleaning up pending user:', deleteError)
            
            console.log('User registration completed successfully')
          }
        }
      }

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