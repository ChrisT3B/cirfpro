// src/lib/supabase/typed-queries.ts
/**
 * Type-safe query helpers for tables where Supabase returns 'never'
 * This bridges the gap between our manual types and Supabase's generated types
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'
import type {
  CoachAthleteInvitation,
  CoachAthleteInvitationInsert,
  CoachAthleteInvitationUpdate,
} from '@/types/manual-database-types'

type SupabaseClientType = SupabaseClient<Database>

/**
 * Type-safe invitation queries
 */
export class InvitationQueries {
  constructor(private supabase: SupabaseClientType) {}

  async findByCoachAndEmail(coachId: string, email: string) {
    const { data, error } = await this.supabase
      .from('coach_athlete_invitations')
      .select('*')
      .eq('coach_id', coachId)
      .eq('email', email)
      .eq('status', 'pending')
      .single()

    return {
      data: data as CoachAthleteInvitation | null,
      error,
    }
  }

  async create(invitation: CoachAthleteInvitationInsert) {
    const { data, error } = await this.supabase
      .from('coach_athlete_invitations')
      .insert(invitation as any) // Safe cast as we control the type
      .select('*')
      .single()

    return {
      data: data as CoachAthleteInvitation | null,
      error,
    }
  }

  async updateStatus(id: string, status: CoachAthleteInvitation['status']) {
    const { data, error } = await this.supabase
      .from('coach_athlete_invitations')
      .update({ status } as any) // Safe cast
      .eq('id', id)
      .select('*')
      .single()

    return {
      data: data as CoachAthleteInvitation | null,
      error,
    }
  }

  async updateSentAt(id: string, sentAt: string) {
    const { data, error } = await this.supabase
      .from('coach_athlete_invitations')
      .update({ sent_at: sentAt } as any) // Safe cast
      .eq('id', id)
      .select('*')
      .single()

    return {
      data: data as CoachAthleteInvitation | null,
      error,
    }
  }

  async findById(id: string) {
    const { data, error } = await this.supabase
      .from('coach_athlete_invitations')
      .select('*')
      .eq('id', id)
      .single()

    return {
      data: data as CoachAthleteInvitation | null,
      error,
    }
  }

  async findByToken(token: string) {
    const { data, error } = await this.supabase
      .from('coach_athlete_invitations')
      .select('*')
      .eq('invitation_token', token)
      .single()

    return {
      data: data as CoachAthleteInvitation | null,
      error,
    }
  }

  async listByCoach(coachId: string) {
    const { data, error } = await this.supabase
      .from('coach_athlete_invitations')
      .select('*')
      .eq('coach_id', coachId)
      .order('created_at', { ascending: false })

    return {
      data: (data as CoachAthleteInvitation[]) || null,
      error,
    }
  }

  async update(id: string, updates: CoachAthleteInvitationUpdate) {
    const { data, error } = await this.supabase
      .from('coach_athlete_invitations')
      .update(updates as any) // Safe cast
      .eq('id', id)
      .select('*')
      .single()

    return {
      data: data as CoachAthleteInvitation | null,
      error,
    }
  }

  async delete(id: string) {
    const { error } = await this.supabase
      .from('coach_athlete_invitations')
      .delete()
      .eq('id', id)

    return { error }
  }
}