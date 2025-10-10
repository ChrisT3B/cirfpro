// ================================================================
// NEW FILE: src/lib/supabase/relationship-queries.ts
// Type-safe query helpers for coach_athlete_relationships
// ================================================================

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'
import type {
  CoachAthleteRelationship,
  CoachAthleteRelationshipInsert,
  CoachAthleteRelationshipUpdate,
  CoachAthleteRelationshipWithProfiles,
  AthleteNeedingOnboarding,
  OnboardingStats,
 } from '@/types/manual-database-types'

type SupabaseClientType = SupabaseClient<Database>

/**
 * Type-safe relationship queries with onboarding support
 */
export class RelationshipQueries {
  constructor(private supabase: SupabaseClientType) {}

  /**
   * Get all relationships for a coach with full athlete details
   */
  async getCoachRelationshipsWithProfiles(coachId: string) {
    const { data, error } = await this.supabase
      .from('coach_athlete_relationships')
      .select(`
        *,
        athlete_profiles!inner (
          id,
          user_id,
          experience_level,
          goal_race_distance,
          goal_race_date,
          users!inner (
            id,
            email,
            first_name,
            last_name
          )
        ),
        coach_profiles!inner (
          id,
          user_id,
          workspace_slug,
          users!inner (
            id,
            email,
            first_name,
            last_name
          )
        )
      `)
      .eq('coach_id', coachId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    return {
      data: data as CoachAthleteRelationshipWithProfiles[] | null,
      error,
    }
  }

  /**
   * Get athletes needing onboarding for a coach
   * Used for notification banners and onboarding lists
   */
  async getAthletesNeedingOnboarding(coachId: string) {
    const { data, error } = await this.supabase
      .from('coach_athlete_relationships')
      .select(`
        id,
        athlete_id,
        created_at,
        athlete_profiles!inner (
          id,
          experience_level,
          goal_race_distance,
          users!inner (
            first_name,
            last_name,
            email
          )
        )
      `)
      .eq('coach_id', coachId)
      .eq('status', 'active')
      .eq('onboarding_status', 'pending')
      .eq('onboarding_notification_dismissed', false)
      .order('created_at', { ascending: true })

    // Transform the data to match AthleteNeedingOnboarding type
    const athletes: AthleteNeedingOnboarding[] | null = data?.map((rel: any) => ({
      relationship_id: rel.id,
      athlete_id: rel.athlete_id,
      athlete_name: `${rel.athlete_profiles.users.first_name} ${rel.athlete_profiles.users.last_name}`,
      athlete_email: rel.athlete_profiles.users.email,
      accepted_at: rel.created_at,
      experience_level: rel.athlete_profiles.experience_level,
      goal_race_distance: rel.athlete_profiles.goal_race_distance,
    })) || null

    return {
      data: athletes,
      error,
    }
  }

  /**
   * Get onboarding statistics for a coach's dashboard
   */
  async getOnboardingStats(coachId: string): Promise<{ data: OnboardingStats | null; error: any }> {
    const { data, error } = await this.supabase
      .from('coach_athlete_relationships')
      .select('onboarding_status, status')
      .eq('coach_id', coachId)
      .eq('status', 'active')

    if (error || !data) {
      return { data: null, error }
    }

    const stats: OnboardingStats = {
      total_athletes: data.length,
      active_athletes: data.length, // All queried relationships are active
      pending_onboarding: data.filter(r => r.onboarding_status === 'pending').length,
      in_progress_onboarding: data.filter(r => r.onboarding_status === 'in_progress').length,
      completed_onboarding: data.filter(r => r.onboarding_status === 'completed').length,
    }

    return { data: stats, error: null }
  }

  /**
   * Update onboarding status for a relationship
   */
  async updateOnboardingStatus(
    relationshipId: string,
    status: 'pending' | 'in_progress' | 'completed'
  ) {
    const updates: CoachAthleteRelationshipUpdate = {
      onboarding_status: status,
      updated_at: new Date().toISOString(),
    }

    // Add timestamps based on status
    if (status === 'in_progress' && !updates.onboarding_started_at) {
      updates.onboarding_started_at = new Date().toISOString()
    }
    if (status === 'completed') {
      updates.onboarding_completed_at = new Date().toISOString()
    }

    const { data, error } = await this.supabase
      .from('coach_athlete_relationships')
      .update(updates as any)
      .eq('id', relationshipId)
      .select('*')
      .single()

    return {
      data: data as CoachAthleteRelationship | null,
      error,
    }
  }

  /**
   * Dismiss onboarding notification for a relationship
   */
  async dismissOnboardingNotification(relationshipId: string) {
    const { data, error } = await this.supabase
      .from('coach_athlete_relationships')
      .update({
        onboarding_notification_dismissed: true,
        onboarding_notification_dismissed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as any)
      .eq('id', relationshipId)
      .select('*')
      .single()

    return {
      data: data as CoachAthleteRelationship | null,
      error,
    }
  }

  /**
   * Get a single relationship by ID
   */
  async getRelationshipById(relationshipId: string) {
    const { data, error } = await this.supabase
      .from('coach_athlete_relationships')
      .select('*')
      .eq('id', relationshipId)
      .single()

    return {
      data: data as CoachAthleteRelationship | null,
      error,
    }
  }

  /**
   * Create a new relationship
   */
  async create(relationship: CoachAthleteRelationshipInsert) {
    const { data, error } = await this.supabase
      .from('coach_athlete_relationships')
      .insert(relationship as any)
      .select('*')
      .single()

    return {
      data: data as CoachAthleteRelationship | null,
      error,
    }
  }
}