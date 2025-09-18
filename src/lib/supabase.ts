// src/lib/supabase.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/database.types'

// Client-side Supabase client (for use in components)
export const createClient = () =>
  createClientComponentClient<Database>()

// Common types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type User = Tables<'users'>
export type CoachProfile = Tables<'coach_profiles'>
export type AthleteProfile = Tables<'athlete_profiles'>