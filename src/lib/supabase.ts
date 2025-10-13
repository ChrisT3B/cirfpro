// src/lib/supabase.ts
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database.types'

// Client-side Supabase client (for use in components)
export const createClient = () =>
  createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

// Common types - use auto-generated types from database.types.ts
export type Tables<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Row']

export type User = Tables<'users'>
export type CoachProfile = Tables<'coach_profiles'>
export type AthleteProfile = Tables<'athlete_profiles'>

// Only manually define types for views (not auto-generated)

export type { 
  PublicCoachDirectory, 
  CoachProfileWithUser, 
  CoachAthleteInvitation,
  // Add these new exports:
  CoachAthleteRelationship,
  CoachAthleteRelationshipWithProfiles,
  AthleteNeedingOnboarding,
  OnboardingStats,
  OnboardingStatus
} from '@/types/manual-database-types'





export { RelationshipQueries } from './supabase/relationship-queries'
export { AssessmentQueries } from './supabase/assessment-queries'