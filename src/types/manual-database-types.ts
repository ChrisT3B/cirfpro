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
// ATHLETE ASSESSMENT SYSTEM TYPES
// Add these to src/types/manual-database-types.ts
// ================================================================

/**
 * Assessment status workflow states
 */
export type AssessmentStatus = 
  | 'draft' 
  | 'pending_athlete_review' 
  | 'athlete_reviewing' 
  | 'disputed' 
  | 'accepted' 
  | 'archived'

export type AssessmentType = 
  | 'initial_onboarding' 
  | 'periodic_review' 
  | 'ad_hoc'

export type AthleteResponse = 'accepted' | 'disputed'

export type TrainingStructure = 'none' | 'casual' | 'club' | 'coached'

export type ExperienceCategorization = 'beginner' | 'intermediate' | 'advanced' | 'elite'

/**
 * Core assessment record
 */
export interface AthleteAssessment {
  id: string
  athlete_id: string
  coach_id: string
  relationship_id: string
  assessment_type: AssessmentType
  status: AssessmentStatus
  is_locked: boolean
  personal_details_completed: boolean
  training_background_completed: boolean
  shared_with_athlete: boolean
  shared_at: string | null
  athlete_last_viewed_at: string | null
  athlete_response: AthleteResponse | null
  athlete_response_at: string | null
  athlete_dispute_notes: string | null
  modified_after_share: boolean
  last_modified_by: string | null
  coach_private_notes: string | null
  created_at: string
  updated_at: string
  completed_at: string | null
}

/**
 * Insert type for creating new assessments
 */
export interface AthleteAssessmentInsert {
  athlete_id: string
  coach_id: string
  relationship_id: string
  assessment_type?: AssessmentType
  status?: AssessmentStatus
  coach_private_notes?: string
}

/**
 * Update type for assessments
 */
export interface AthleteAssessmentUpdate {
  status?: AssessmentStatus
  is_locked?: boolean
  personal_details_completed?: boolean
  training_background_completed?: boolean
  shared_with_athlete?: boolean
  shared_at?: string
  athlete_response?: AthleteResponse
  athlete_response_at?: string
  athlete_dispute_notes?: string
  modified_after_share?: boolean
  last_modified_by?: string
  coach_private_notes?: string
  updated_at?: string
  completed_at?: string
}

/**
 * US048 - Personal Details (Tab 1)
 */
export interface AssessmentPersonalDetails {
  id: string
  assessment_id: string
  athlete_name: string | null
  gender: string | null
  age: number | null
  standing_height_cm: number | null
  current_status: string | null
  hours_per_week_education_employment: number | null
  major_life_events_this_year: string | null
  days_per_week_available: number | null
  preferred_training_days: string[] | null
  preferred_training_times: string | null
  seasonal_availability_notes: string | null
  has_disability: boolean
  disability_type: string[] | null
  classification_details: string | null
  disability_additional_info: string | null
  training_impact_factors: string | null
  created_at: string
  updated_at: string
}

export interface AssessmentPersonalDetailsInsert {
  assessment_id: string
  athlete_name?: string
  gender?: string
  age?: number
  standing_height_cm?: number
  current_status?: string
  hours_per_week_education_employment?: number
  major_life_events_this_year?: string
  days_per_week_available?: number
  preferred_training_days?: string[]
  preferred_training_times?: string
  seasonal_availability_notes?: string
  has_disability?: boolean
  disability_type?: string[]
  classification_details?: string
  disability_additional_info?: string
  training_impact_factors?: string
}

/**
 * Physical activity structure for JSONB field
 */
export interface PhysicalActivity {
  activity: string
  frequency: string
  duration_minutes: number
  level: string
}

/**
 * US049 - Training Background (Tab 2)
 */
export interface AssessmentTrainingBackground {
  id: string
  assessment_id: string
  other_activities: PhysicalActivity[] | null
  years_running_experience: number | null
  previous_training_structure: TrainingStructure | null
  typical_weekly_mileage_km: number | null
  previous_race_experiences: string | null
  previous_running_injuries: string | null
  current_injuries_limitations: string | null
  recovery_status: string | null
  medical_clearances: string | null
  coach_experience_categorization: ExperienceCategorization | null
  created_at: string
  updated_at: string
}

export interface AssessmentTrainingBackgroundInsert {
  assessment_id: string
  other_activities?: PhysicalActivity[]
  years_running_experience?: number
  previous_training_structure?: TrainingStructure
  typical_weekly_mileage_km?: number
  previous_race_experiences?: string
  previous_running_injuries?: string
  current_injuries_limitations?: string
  recovery_status?: string
  medical_clearances?: string
  coach_experience_categorization?: ExperienceCategorization
}

/**
 * Custom question template (reusable up to 10 per coach)
 */
export interface AssessmentQuestionTemplate {
  id: string
  coach_id: string
  question_text: string
  question_order: number | null
  times_used: number
  created_at: string
  updated_at: string
}

export interface AssessmentQuestionTemplateInsert {
  coach_id: string
  question_text: string
  question_order?: number
}

/**
 * Custom question response (snapshot per assessment)
 */
export interface AssessmentCustomResponse {
  id: string
  assessment_id: string
  question_text: string
  question_order: number
  template_id: string | null
  response_text: string | null
  share_with_athlete: boolean
  created_at: string
  updated_at: string
}

export interface AssessmentCustomResponseInsert {
  assessment_id: string
  question_text: string
  question_order: number
  template_id?: string
  response_text?: string
  share_with_athlete?: boolean
}

export interface AssessmentCustomResponseUpdate {
  response_text?: string
  share_with_athlete?: boolean
  updated_at?: string
}

/**
 * Combined assessment data for form display
 */
export interface AssessmentWithDetails extends AthleteAssessment {
  personal_details?: AssessmentPersonalDetails
  training_background?: AssessmentTrainingBackground
  custom_responses?: AssessmentCustomResponse[]
  athlete_profiles?: {
    users: {
      first_name: string | null
      last_name: string | null
      email: string
    }
  }
    coach_profiles?: {
    workspace_slug: string
    users: {
      first_name: string | null
      last_name: string | null
    }
  }
}