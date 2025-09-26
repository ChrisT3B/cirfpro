// src/contexts/AuthContext.tsx - JWT-FIRST ARCHITECTURE
'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase'
import type { User, CoachProfile, AthleteProfile } from '@/lib/supabase'

interface AuthContextType {
  // Authentication State
  user: SupabaseUser | null
  loading: boolean
  
  // INSTANT JWT-BASED DATA (no database calls required)
  isCoach: boolean
  isAthlete: boolean
  workspaceSlug: string | null
  firstName: string | null
  lastName: string | null
  role: 'coach' | 'athlete' | null
  
  // DETAILED PROFILE DATA (async loaded in background)
  profile: User | null
  coachProfile: CoachProfile | null
  athleteProfile: AthleteProfile | null
  profilesLoading: boolean
  
  // Auth Functions
  signUp: (email: string, password: string, userData: { role: 'coach' | 'athlete', firstName: string, lastName: string }) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  refreshProfiles: () => Promise<void>
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
  // Authentication State
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  
  // INSTANT JWT-BASED DATA (synchronously available)
  const [isCoach, setIsCoach] = useState(false)
  const [isAthlete, setIsAthlete] = useState(false)
  const [workspaceSlug, setWorkspaceSlug] = useState<string | null>(null)
  const [firstName, setFirstName] = useState<string | null>(null)
  const [lastName, setLastName] = useState<string | null>(null)
  const [role, setRole] = useState<'coach' | 'athlete' | null>(null)
  
  // DETAILED PROFILE DATA (async loaded)
  const [profile, setProfile] = useState<User | null>(null)
  const [coachProfile, setCoachProfile] = useState<CoachProfile | null>(null)
  const [athleteProfile, setAthleteProfile] = useState<AthleteProfile | null>(null)
  const [profilesLoading, setProfilesLoading] = useState(false)

  const supabase = createClient()

  // Generate workspace slug from name (same logic as database function)
  const generateWorkspaceSlug = useCallback((firstName: string, lastName: string) => {
    if (!firstName || !lastName) return null
    
    // Convert to lowercase and replace spaces/special chars with hyphens
    const slug = `${firstName}-${lastName}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')  // Replace non-alphanumeric with hyphens
      .replace(/^-+|-+$/g, '')      // Remove leading/trailing hyphens
      .replace(/-+/g, '-')          // Replace multiple hyphens with single
    
    return slug
  }, [])

  // Extract essential user data from JWT token - INSTANT DATA
  const extractJWTData = useCallback((user: SupabaseUser) => {
    console.log('🚀 Extracting JWT data for instant authorization')
    
    // Extract role from user metadata or app_metadata
    const userRole = user.user_metadata?.role || user.app_metadata?.role || null
    
    // Extract name data from user metadata
    const userFirstName = user.user_metadata?.first_name || user.app_metadata?.first_name || null
    const userLastName = user.user_metadata?.last_name || user.app_metadata?.last_name || null
    
    // Generate workspace slug directly from name (NO DATABASE CALL!)
    const derivedWorkspaceSlug = (userRole === 'coach' && userFirstName && userLastName) 
      ? generateWorkspaceSlug(userFirstName, userLastName)
      : null
    
    // Set instant JWT-based data (synchronous)
    setRole(userRole)
    setIsCoach(userRole === 'coach')
    setIsAthlete(userRole === 'athlete')
    setFirstName(userFirstName)
    setLastName(userLastName)
    setWorkspaceSlug(derivedWorkspaceSlug)
    
    console.log('✅ JWT Data extracted instantly:', {
      role: userRole,
      isCoach: userRole === 'coach',
      isAthlete: userRole === 'athlete',
      firstName: userFirstName,
      lastName: userLastName,
      workspaceSlug: derivedWorkspaceSlug
    })
    
    return {
      role: userRole,
      isCoach: userRole === 'coach',
      isAthlete: userRole === 'athlete',
      firstName: userFirstName,
      lastName: userLastName,
      workspaceSlug: derivedWorkspaceSlug
    }
  }, [generateWorkspaceSlug])

  // Load detailed profiles in background (non-blocking)
  const loadDetailedProfiles = useCallback(async (userId: string, userRole: string) => {
    if (!userRole) return
    
    console.log('🔄 Loading detailed profiles in background...')
    setProfilesLoading(true)
    
    try {
      // Load base user profile
      const { data: userProfile, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (userError) {
        console.error('Error loading user profile:', userError)
      } else {
        setProfile(userProfile as User)
      }

      // Load role-specific profile
      if (userRole === 'coach') {
        const { data: coachData, error: coachError } = await supabase
          .from('coach_profiles')
          .select('*')
          .eq('user_id', userId)
          .single()

        if (coachError) {
          console.error('Error loading coach profile:', coachError)
        } else {
          setCoachProfile(coachData as CoachProfile)
        }
      } else if (userRole === 'athlete') {
        const { data: athleteData, error: athleteError } = await supabase
          .from('athlete_profiles')
          .select('*')
          .eq('user_id', userId)
          .single()

        if (athleteError) {
          console.error('Error loading athlete profile:', athleteError)
        } else {
          setAthleteProfile(athleteData as AthleteProfile)
        }
      }
      
      console.log('✅ Detailed profiles loaded successfully')
    } catch (error) {
      console.error('Error loading detailed profiles:', error)
    } finally {
      setProfilesLoading(false)
    }
  }, [supabase])

  // Clear all auth state
  const clearAuthState = useCallback(() => {
    setUser(null)
    setRole(null)
    setIsCoach(false)
    setIsAthlete(false)
    setWorkspaceSlug(null)
    setFirstName(null)
    setLastName(null)
    setProfile(null)
    setCoachProfile(null)
    setAthleteProfile(null)
    setProfilesLoading(false)
  }, [])

  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        console.log('🔍 Initializing authentication...')
        
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ Error getting session:', error)
          if (mounted) {
            setLoading(false)
          }
          return
        }

        if (mounted && session?.user) {
          console.log('✅ Session found - processing JWT data')
          setUser(session.user)
          
          // Extract JWT data instantly (synchronous) - includes derived workspace_slug
          const jwtData = extractJWTData(session.user)
          
          // Load detailed profiles in background (non-blocking)
          if (jwtData.role) {
            loadDetailedProfiles(session.user.id, jwtData.role)
          }
          
          setLoading(false) // User can navigate immediately with all essential data
        } else {
          console.log('ℹ️ No session found')
          if (mounted) {
            setLoading(false)
          }
        }
      } catch (error) {
        console.error('❌ Error initializing auth:', error)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', event)
      
      if (!mounted) return

      if (event === 'SIGNED_IN' && session?.user) {
        console.log('✅ User signed in - extracting JWT data')
        setUser(session.user)
        
        // Extract JWT data instantly (includes derived workspace_slug)
        const jwtData = extractJWTData(session.user)
        
        // Load detailed profiles in background
        if (jwtData.role) {
          loadDetailedProfiles(session.user.id, jwtData.role)
        }
        
        setLoading(false)
      } else if (event === 'SIGNED_OUT') {
        console.log('🚪 User signed out')
        clearAuthState()
        setLoading(false)
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        console.log('🔄 Token refreshed - updating JWT data')
        setUser(session.user)
        extractJWTData(session.user)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase, extractJWTData, loadDetailedProfiles, clearAuthState])

  const signUp = async (email: string, password: string, userData: { role: 'coach' | 'athlete', firstName: string, lastName: string }) => {
    setLoading(true)
    try {
      console.log('📝 Starting sign up process...')
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: userData.role,
            first_name: userData.firstName,
            last_name: userData.lastName,
          }
        }
      })

      if (error) {
        console.error('❌ Sign up error:', error)
        throw error
      }

      console.log('✅ Sign up successful')
    } catch (error) {
      console.error('❌ Error in sign up:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      console.log('🔑 Starting sign in process...')
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('❌ Sign in error:', error)
        throw error
      }

      console.log('✅ Sign in successful - JWT data will be extracted automatically')
    } catch (error) {
      console.error('❌ Error in sign in:', error)
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
      console.error('❌ Error signing out:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const refreshProfiles = async () => {
    if (!user || !role) return
    await loadDetailedProfiles(user.id, role)
  }

  const value = {
    // Authentication State
    user,
    loading,
    
    // INSTANT JWT-BASED DATA (available immediately)
    isCoach,
    isAthlete,
    workspaceSlug,
    firstName,
    lastName,
    role,
    
    // DETAILED PROFILE DATA (loaded asynchronously)
    profile,
    coachProfile,
    athleteProfile,
    profilesLoading,
    
    // Functions
    signUp,
    signIn,
    signOut,
    refreshProfiles,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}