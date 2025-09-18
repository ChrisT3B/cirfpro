// src/contexts/AuthContext.tsx
'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
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
    // First, insert into pending_users table
    const { error: pendingError } = await supabase
      .from('pending_users')
      .insert({
        email,
        role: userData.role,
        first_name: userData.firstName,
        last_name: userData.lastName,
      })

    if (pendingError) throw pendingError

    // Then create auth user (this will send verification email)
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) throw authError

    // Update pending record with auth user ID
    if (data.user) {
      const { error: updateError } = await supabase
        .from('pending_users')
        .update({ auth_user_id: data.user.id })
        .eq('email', email)

      if (updateError) throw updateError
    }

    // User needs to verify email before they can sign in
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
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
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