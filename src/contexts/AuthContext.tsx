// src/contexts/AuthContext.tsx - CORRECTED with all expected properties + LOADING STATE FIX
'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

// Type definitions
type User = Database['public']['Tables']['users']['Row']
type CoachProfile = Database['public']['Tables']['coach_profiles']['Row']
type AthleteProfile = Database['public']['Tables']['athlete_profiles']['Row']

interface AuthContextType {
  user: SupabaseUser | null
  profile: User | null
  coachProfile: CoachProfile | null
  athleteProfile: AthleteProfile | null
  
  // Computed properties for easy access
  isCoach: boolean
  isAthlete: boolean
  role: 'coach' | 'athlete' | null
  
  // JWT-extracted properties for instant access
  firstName: string | null
  lastName: string | null
  workspaceSlug: string | null
  
  loading: boolean
  roleProfileLoading: boolean  // ← NEW: Track when coach/athlete profile is loading
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<User | null>(null)
  const [coachProfile, setCoachProfile] = useState<CoachProfile | null>(null)
  const [athleteProfile, setAthleteProfile] = useState<AthleteProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileLoaded, setProfileLoaded] = useState(false)
  const [roleProfileLoading, setRoleProfileLoading] = useState(false)  // ← NEW
  
  const supabase = createClient()
  const router = useRouter()

  // Initialize auth state
  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          setUser(session.user)
        }
      } catch (error) {
        console.error('Error getting initial session:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth state change:', event)
        
        if (session?.user) {
          setUser(session.user)
          // Reset profile loaded flag when user changes
          setProfileLoaded(false)
        } else {
          // User signed out - clear everything
          setUser(null)
          setProfile(null)
          setCoachProfile(null)
          setAthleteProfile(null)
          setProfileLoaded(false)
          setRoleProfileLoading(false)  // ← NEW
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase])

  // Load profile: JWT-FIRST STRATEGY with database fallback
  useEffect(() => {
    const loadProfile = async () => {
      if (!user || profileLoaded) return

      console.log('🔍 Loading user profile for:', user.email)

      try {
        // ================================================================
        // STRATEGY 1: Try JWT first (FAST - 0ms)
        // ================================================================
        const jwtMetadata = user.user_metadata
        
        if (jwtMetadata?.role && jwtMetadata?.first_name && jwtMetadata?.last_name) {
          console.log('✅ Using JWT metadata (fast path - 0ms)')
          
          const profileFromJWT: User = {
            id: user.id,
            email: user.email!,
            role: jwtMetadata.role as 'coach' | 'athlete',
            first_name: jwtMetadata.first_name,
            last_name: jwtMetadata.last_name,
            created_at: user.created_at,
            updated_at: new Date().toISOString()
          }

          setProfile(profileFromJWT)
          setProfileLoaded(true)
          
          // Load role-specific profile in background (non-blocking)
          loadRoleSpecificProfile(profileFromJWT.role, user.id)
          
          return // ← EARLY EXIT - No database call needed!
        }

        // ================================================================
        // STRATEGY 2: Fallback to database (SLOW - ~50ms one-time)
        // ================================================================
        console.log('⚠️  JWT metadata missing, fetching from database (fallback)')
        
        const { data: userProfile, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error) {
          console.error('❌ Failed to fetch user profile:', error)
          
          // Check if user is in pending_users (email not verified yet)
          const { data: pendingUser } = await supabase
            .from('pending_users')
            .select('*')
            .eq('id', user.id)
            .single()
          
          if (pendingUser) {
            console.log('⏳ User in pending_users - email verification required')
          }
          
          return
        }

        if (userProfile) {
          console.log('✅ Loaded profile from database')
          setProfile(userProfile)
          setProfileLoaded(true)

          // ================================================================
          // REPAIR: Update JWT metadata for future fast loading
          // ================================================================
          console.log('🔧 Updating JWT metadata for future sessions...')
          try {
            await supabase.auth.updateUser({
              data: {
                role: userProfile.role,
                first_name: userProfile.first_name,
                last_name: userProfile.last_name
              }
            })
            console.log('✅ JWT metadata repaired - future logins will be instant')
          } catch (updateError) {
            console.warn('⚠️  Could not update JWT metadata:', updateError)
            // Non-fatal - user can still use the app
          }

          // Load role-specific profile
          loadRoleSpecificProfile(userProfile.role, user.id)
        }
      } catch (err) {
        console.error('❌ Error loading profile:', err)
      }
    }

    loadProfile()
  }, [user, profileLoaded, supabase])

  // Helper: Load coach/athlete specific data
  const loadRoleSpecificProfile = useCallback(async (
    role: 'coach' | 'athlete',
    userId: string
  ) => {
    setRoleProfileLoading(true)  // ← NEW: Set loading state
    
    try {
      console.log(`🔄 Loading ${role} profile for user ${userId}...`)
      
      if (role === 'coach') {
        // Only load if not already loaded
        if (coachProfile?.user_id === userId) {
          console.log('✅ Coach profile already loaded')
          return
        }
        
        const { data, error } = await supabase
          .from('coach_profiles')
          .select('*')
          .eq('user_id', userId)
          .single()
        
        if (data && !error) {
          setCoachProfile(data)
          console.log('✅ Coach profile loaded, workspace_slug:', data.workspace_slug)
        } else if (error?.code !== 'PGRST116') {
          // PGRST116 = not found, which is expected for new users
          console.error('Error loading coach profile:', error)
        } else {
          console.log('⚠️  Coach profile not found (may be new user)')
        }
      } else if (role === 'athlete') {
        // Only load if not already loaded
        if (athleteProfile?.user_id === userId) {
          console.log('✅ Athlete profile already loaded')
          return
        }
        
        const { data, error } = await supabase
          .from('athlete_profiles')
          .select('*')
          .eq('user_id', userId)
          .single()
        
        if (data && !error) {
          setAthleteProfile(data)
          console.log('✅ Athlete profile loaded')
        } else if (error?.code !== 'PGRST116') {
          console.error('Error loading athlete profile:', error)
        } else {
          console.log('⚠️  Athlete profile not found (may be new user)')
        }
      }
    } catch (error) {
      console.error(`❌ Error loading ${role} profile:`, error)
    } finally {
      setRoleProfileLoading(false)  // ← NEW: Clear loading state
    }
  }, [supabase, coachProfile, athleteProfile])

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  // Sign out function
  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setProfile(null)
      setCoachProfile(null)
      setAthleteProfile(null)
      setProfileLoaded(false)
      setRoleProfileLoading(false)  // ← NEW
      router.push('/auth/signin')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  // Computed properties extracted from JWT or profile
  const role = profile?.role || (user?.user_metadata?.role as 'coach' | 'athlete' | null) || null
  const isCoach = role === 'coach'
  const isAthlete = role === 'athlete'
  const firstName = profile?.first_name || user?.user_metadata?.first_name || null
  const lastName = profile?.last_name || user?.user_metadata?.last_name || null
  const workspaceSlug = coachProfile?.workspace_slug || null

  const value: AuthContextType = {
    user,
    profile,
    coachProfile,
    athleteProfile,
    isCoach,
    isAthlete,
    role,
    firstName,
    lastName,
    workspaceSlug,
    loading,
    roleProfileLoading,  // ← NEW: Expose loading state
    signIn,
    signOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}