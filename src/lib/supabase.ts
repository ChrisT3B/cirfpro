// src/lib/supabase.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/database.types'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// Client-side Supabase client (for use in components)
export const createClient = () =>
  createClientComponentClient<Database>()

// Common types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type User = Tables<'users'>
//
export type AthleteProfile = Tables<'athlete_profiles'>

// Add this to your existing src/lib/supabase.ts or src/types/database.types.ts

// Updated CoachProfile interface to include workspace fields
export interface CoachProfile {
  id: string
  user_id: string
  qualifications: string[]
  specializations: string[]
  subscription_tier: 'starter' | 'professional' | 'elite' | 'enterprise'
  athlete_limit: number
  bio: string | null
  location: string | null
  website: string | null
  phone: string | null
  is_verified: boolean
  
  // New workspace fields
  workspace_slug: string
  workspace_name: string | null
  workspace_description: string | null
  public_profile_visible: boolean
  profile_photo_url: string | null
  coaching_philosophy: string | null
  years_experience: number | null
  coaching_location: string | null
  price_range: string | null
  availability_status: string
  
  created_at: string
  updated_at: string
}

// Type for the public coach directory view
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
