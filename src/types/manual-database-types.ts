// ================================================================
// UPDATE FOR: src/types/manual-database-types.ts
// Add these type definitions to your existing file
// ================================================================

import type { Database } from './database.types'

// ================================================================
// NEW: Coach-Athlete Relationship Types with Onboarding
// ================================================================

/**
 * Onboarding status enum
 */
export type OnboardingStatus = 'pending' | 'in_progress' | 'completed'

/**
 * Complete coach-athlete relationship type with onboarding tracking
 * This extends the base relationship with onboarding workflow fields
 */
export interface CoachAthleteRelationship {
  id: string
  coach_id: string
  athlete_id: string
  status: 'active' | 'inactive' | 'suspended'
  terms_accepted_at: string | null
  terms_version: string | null
  created_at: string
  updated_at: string | null
  
  // Onboarding tracking fields (NEW in US037)
  onboarding_status: OnboardingStatus
  onboarding_started_at: string | null
  onboarding_completed_at: string | null
  onboarding_notification_dismissed: boolean
  onboarding_notification_dismissed_at: string | null
}

/**
 * Type for inserting new relationships
 */
export interface CoachAthleteRelationshipInsert {
  coach_id: string
  athlete_id: string
  status?: 'active' | 'inactive' | 'suspended'
  terms_accepted_at?: string
  terms_version?: string
  onboarding_status?: OnboardingStatus
}

/**
 * Type for updating existing relationships
 */
export interface CoachAthleteRelationshipUpdate {
  status?: 'active' | 'inactive' | 'suspended'
  onboarding_status?: OnboardingStatus
  onboarding_started_at?: string
  onboarding_completed_at?: string
  onboarding_notification_dismissed?: boolean
  onboarding_notification_dismissed_at?: string
  updated_at?: string
}

/**
 * Relationship with nested athlete and coach profile data
 * Used for dashboard displays and detailed views
 */
export interface CoachAthleteRelationshipWithProfiles extends CoachAthleteRelationship {
  athlete_profiles: {
    id: string
    user_id: string
    experience_level: string | null
    goal_race_distance: string | null
    goal_race_date: string | null
    users: {
      id: string
      email: string
      first_name: string | null
      last_name: string | null
    } | null
  } | null
  coach_profiles: {
    id: string
    user_id: string
    workspace_slug: string
    users: {
      id: string
      email: string
      first_name: string | null
      last_name: string | null
    } | null
  } | null
}

/**
 * Summary type for dashboard stats
 */
export interface OnboardingStats {
  total_athletes: number
  active_athletes: number
  pending_onboarding: number
  in_progress_onboarding: number
  completed_onboarding: number
}

/**
 * Type for athletes needing onboarding
 * Used in notification banners and onboarding lists
 */
export interface AthleteNeedingOnboarding {
  relationship_id: string
  athlete_id: string
  athlete_name: string
  athlete_email: string
  accepted_at: string
  experience_level: string | null
  goal_race_distance: string | null
}

// ================================================================
// EXISTING TYPES (keep these, shown for reference)
// ================================================================

// Re-export commonly used table types for convenience
export type CoachAthleteInvitation = Database['public']['Tables']['coach_athlete_invitations']['Row']
export type CoachAthleteInvitationInsert = Database['public']['Tables']['coach_athlete_invitations']['Insert']
export type CoachAthleteInvitationUpdate = Database['public']['Tables']['coach_athlete_invitations']['Update']

// View types
export interface PublicCoachDirectory {
  id: string
  workspace_slug: string
  workspace_name: string | null
  coaching_philosophy: string | null
  years_experience: number | null
  coaching_location: string | null
  price_range: string | null
  availability_status: string
  profile_photo_url: string | null
  qualifications: string[] | null
  specializations: string[] | null
  first_name: string
  last_name: string
  email: string
  created_at: string
}

// Complex joined query types
export interface CoachProfileWithUser {
  user_id: string
  workspace_slug: string
  users?: {
    email: string
    first_name?: string | null
    last_name?: string | null
  }
}

export interface InvitationWithExpiry extends CoachAthleteInvitation {
  days_until_expiry?: number
}

// Supabase query result types
export type SupabaseQueryResult<T> = {
  data: T | null
  error: {
    message: string
    details: string
    hint: string
    code: string
  } | null
}

export type SupabaseQueryArrayResult<T> = {
  data: T[] | null
  error: {
    message: string
    details: string
    hint: string
    code: string
  } | null
}
// ================================================================
// EMERGENCY FIX: Just add these types to manual-database-types.ts
// This extends your existing types WITHOUT replacing database.types.ts
// ================================================================

/**
 * ADD THESE TO YOUR EXISTING src/types/manual-database-types.ts
 * Don't replace anything - just ADD these new types at the bottom
 */

// ================================================================
// Onboarding Types (US037) - ADD TO EXISTING FILE
// ================================================================

/**
 * Onboarding status enum
 */


/**
 * Coach-Athlete relationship with onboarding fields
 * Use this type when you need the onboarding columns
 */
export interface CoachAthleteRelationshipWithOnboarding {
  id: string
  coach_id: string
  athlete_id: string
  status: 'active' | 'inactive' | 'suspended'
  terms_accepted_at: string | null
  terms_version: string | null
  created_at: string
  updated_at: string | null
  
  // Onboarding tracking fields
  onboarding_status: OnboardingStatus
  onboarding_started_at: string | null
  onboarding_completed_at: string | null
  onboarding_notification_dismissed: boolean
  onboarding_notification_dismissed_at: string | null
}

/**
 * Athlete needing onboarding
 */
export interface AthleteNeedingOnboarding {
  relationship_id: string
  athlete_id: string
  athlete_name: string
  athlete_email: string
  accepted_at: string
  experience_level: string | null
  goal_race_distance: string | null
}

/**
 * Onboarding statistics
 */
export interface OnboardingStats {
  total_athletes: number
  active_athletes: number
  pending_onboarding: number
  in_progress_onboarding: number
  completed_onboarding: number
}

// ================================================================
// INSTRUCTIONS:
// ================================================================
// 
// 1. Open your EXISTING src/types/manual-database-types.ts
// 2. Scroll to the BOTTOM of the file
// 3. PASTE these new types at the end
// 4. Save the file
// 
// DO NOT touch src/types/database.types.ts - leave it as it was
// 
// This gives you the onboarding types you need for US037 without
// breaking your existing Supabase types
//