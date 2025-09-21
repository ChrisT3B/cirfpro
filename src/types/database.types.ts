// src/types/database.types.ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          role: 'coach' | 'athlete'
          first_name: string | null
          last_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          role: 'coach' | 'athlete'
          first_name?: string | null
          last_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'coach' | 'athlete'
          first_name?: string | null
          last_name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
// Update your existing coach_profiles section in src/types/database.types.ts
// Replace the existing coach_profiles section with this:

coach_profiles: {
  Row: {
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
    
    // Add these workspace fields:
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
  Insert: {
    id?: string
    user_id: string
    qualifications?: string[]
    specializations?: string[]
    subscription_tier?: 'starter' | 'professional' | 'elite' | 'enterprise'
    athlete_limit?: number
    bio?: string | null
    location?: string | null
    website?: string | null
    phone?: string | null
    is_verified?: boolean
    
    // Add these workspace fields:
    workspace_slug?: string
    workspace_name?: string | null
    workspace_description?: string | null
    public_profile_visible?: boolean
    profile_photo_url?: string | null
    coaching_philosophy?: string | null
    years_experience?: number | null
    coaching_location?: string | null
    price_range?: string | null
    availability_status?: string
    
    created_at?: string
    updated_at?: string
  }
  Update: {
    id?: string
    user_id?: string
    qualifications?: string[]
    specializations?: string[]
    subscription_tier?: 'starter' | 'professional' | 'elite' | 'enterprise'
    athlete_limit?: number
    bio?: string | null
    location?: string | null
    website?: string | null
    phone?: string | null
    is_verified?: boolean
    
    // Add these workspace fields:
    workspace_slug?: string
    workspace_name?: string | null
    workspace_description?: string | null
    public_profile_visible?: boolean
    profile_photo_url?: string | null
    coaching_philosophy?: string | null
    years_experience?: number | null
    coaching_location?: string | null
    price_range?: string | null
    availability_status?: string
    
    created_at?: string
    updated_at?: string
  }
}
      athlete_profiles: {
        Row: {
          id: string
          user_id: string
          coach_id: string | null
          date_of_birth: string | null
          gender: string | null
          experience_level: 'beginner' | 'intermediate' | 'advanced'
          goal_race_date: string | null
          goal_race_distance: string | null
          goal_time_minutes: number | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          medical_conditions: string | null
          injury_history: string | null
          preferred_units: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          coach_id?: string | null
          date_of_birth?: string | null
          gender?: string | null
          experience_level?: 'beginner' | 'intermediate' | 'advanced'
          goal_race_date?: string | null
          goal_race_distance?: string | null
          goal_time_minutes?: number | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          medical_conditions?: string | null
          injury_history?: string | null
          preferred_units?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          coach_id?: string | null
          date_of_birth?: string | null
          gender?: string | null
          experience_level?: 'beginner' | 'intermediate' | 'advanced'
          goal_race_date?: string | null
          goal_race_distance?: string | null
          goal_time_minutes?: number | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          medical_conditions?: string | null
          injury_history?: string | null
          preferred_units?: string
          created_at?: string
          updated_at?: string
        }
      }
      pending_users: {
        Row: {
          id: string
          email: string
          role: 'coach' | 'athlete'
          first_name: string
          last_name: string
          auth_user_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          role: 'coach' | 'athlete'
          first_name: string
          last_name: string
          auth_user_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'coach' | 'athlete'
          first_name?: string
          last_name?: string
          auth_user_id?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}