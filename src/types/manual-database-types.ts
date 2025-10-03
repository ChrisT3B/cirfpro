// src/types/manual-database-types.ts
/**
 * Manual type definitions for database views that can't be auto-generated
 */

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

export interface CoachProfileWithUser {
  user_id: string
  workspace_slug: string
  users?: {
    email: string
    first_name?: string
    last_name?: string
  }
}
export interface CoachAthleteInvitation {
  id: string
  coach_id: string
  email: string
  message: string | null
  status: string
  invitation_token: string
  expires_at: string
  sent_at: string | null
  created_at: string
  updated_at: string
}