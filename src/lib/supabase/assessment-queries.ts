// ================================================================
// FILE: src/lib/supabase/assessment-queries.ts
// Type-safe query helpers for athlete assessment system
// ================================================================

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'
import type {
  AthleteAssessment,
  AthleteAssessmentInsert,
  AthleteAssessmentUpdate,
  AssessmentPersonalDetails,
  AssessmentPersonalDetailsInsert,
  AssessmentTrainingBackground,
  AssessmentTrainingBackgroundInsert,
  AssessmentQuestionTemplate,
  AssessmentQuestionTemplateInsert,
  AssessmentCustomResponse,
  AssessmentCustomResponseInsert,
  AssessmentCustomResponseUpdate,
  AssessmentWithDetails,
    PhysicalActivity,  // ADD THIS
  TrainingStructure, // ADD THIS
} from '@/types/manual-database-types'

type Json = any
type SupabaseClientType = SupabaseClient<Database>

/**
 * Type-safe assessment queries
 */
export class AssessmentQueries {
  constructor(private supabase: SupabaseClientType) {}

  // ================================================================
  // CORE ASSESSMENT OPERATIONS
  // ================================================================

  /**
   * Create a new assessment for an athlete
   */
  async createAssessment(insert: AthleteAssessmentInsert) {
    const { data, error } = await this.supabase
      .from('athlete_assessments')
      .insert(insert)
      .select()
      .single()

    return { data: data as AthleteAssessment | null, error }
  }

  /**
   * Get assessment by ID with all related data
   */
  async getAssessmentWithDetails(assessmentId: string) {
    const { data, error } = await this.supabase
      .from('athlete_assessments')
      .select(`
        *,
        athlete_profiles!inner (
          users!inner (
            first_name,
            last_name,
            email
          )
        )
      `)
      .eq('id', assessmentId)
      .single()

    if (error || !data) {
      return { data: null, error }
    }

    // Fetch personal details
    const { data: personalDetails } = await this.supabase
      .from('assessment_personal_details')
      .select('*')
      .eq('assessment_id', assessmentId)
      .single()

    // Fetch training background
    const { data: trainingBackground } = await this.supabase
      .from('assessment_training_background')
      .select('*')
      .eq('assessment_id', assessmentId)
      .single()

    // Fetch custom responses
    const { data: customResponses } = await this.supabase
      .from('assessment_custom_responses')
      .select('*')
      .eq('assessment_id', assessmentId)
      .order('question_order', { ascending: true })

        const assessment: AssessmentWithDetails = {
  ...(data as AssessmentWithDetails),
  personal_details: personalDetails || undefined,
  training_background: trainingBackground as AssessmentTrainingBackground | undefined,
  custom_responses: customResponses || [],
}

    return { data: assessment, error: null }
  }

  /**
   * Get active assessment for a relationship
   */
  async getActiveAssessmentByRelationship(relationshipId: string) {
    const { data, error } = await this.supabase
      .from('athlete_assessments')
      .select('*')
      .eq('relationship_id', relationshipId)
      .eq('assessment_type', 'initial_onboarding')
      .single()

    return { data: data as AthleteAssessment | null, error }
  }

  /**
   * Get all assessments for a coach's athletes
   */
  async getCoachAssessments(coachId: string) {
    const { data, error } = await this.supabase
      .from('athlete_assessments')
      .select(`
        *,
        athlete_profiles!inner (
          users!inner (
            first_name,
            last_name,
            email
          )
        )
      `)
      .eq('coach_id', coachId)
      .order('updated_at', { ascending: false })

    return { data: data as AssessmentWithDetails[] | null, error }
  }

  /**
   * Get assessments pending athlete review
   */
  async getAssessmentsPendingReview(coachId: string) {
    const { data, error } = await this.supabase
      .from('athlete_assessments')
      .select(`
        *,
        athlete_profiles!inner (
          users!inner (
            first_name,
            last_name,
            email
          )
        )
      `)
      .eq('coach_id', coachId)
      .in('status', ['pending_athlete_review', 'disputed'])
      .order('updated_at', { ascending: false })

    return { data: data as AssessmentWithDetails[] | null, error }
  }

  /**
   * Update assessment status
   */
  async updateAssessment(assessmentId: string, update: AthleteAssessmentUpdate) {
    const { data, error } = await this.supabase
      .from('athlete_assessments')
      .update({
        ...update,
        updated_at: new Date().toISOString(),
      })
      .eq('id', assessmentId)
      .select()
      .single()

    return { data: data as AthleteAssessment | null, error }
  }

  // ================================================================
  // PERSONAL DETAILS (TAB 1)
  // ================================================================

  /**
   * Upsert personal details
   */
  async upsertPersonalDetails(
    assessmentId: string,
    details: Omit<AssessmentPersonalDetailsInsert, 'assessment_id'>
  ) {
    const { data, error } = await this.supabase
      .from('assessment_personal_details')
      .upsert({
        assessment_id: assessmentId,
        ...details,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    return { data: data as AssessmentPersonalDetails | null, error }
  }

  // ================================================================
  // TRAINING BACKGROUND (TAB 2)
  // ================================================================

  /**
   * Upsert training background
   */
  async upsertTrainingBackground(
    assessmentId: string,
    background: Omit<AssessmentTrainingBackgroundInsert, 'assessment_id'>
  ) {
    const { data, error } = await this.supabase
      .from('assessment_training_background')
      .upsert({
        assessment_id: assessmentId,
        ...background,
        other_activities: background.other_activities as Json,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    return { data: data ? {
      ...data,
      other_activities: data.other_activities as PhysicalActivity[] | null
    } as AssessmentTrainingBackground : null, 
    error  
}
  }

  // ================================================================
  // CUSTOM QUESTION TEMPLATES
  // ================================================================

  /**
   * Get all templates for a coach
   */
  async getCoachTemplates(coachId: string) {
    const { data, error } = await this.supabase
      .from('assessment_question_templates')
      .select('*')
      .eq('coach_id', coachId)
      .order('question_order', { ascending: true })

    return { data: data as AssessmentQuestionTemplate[] | null, error }
  }

  /**
   * Create a new question template
   */
  async createTemplate(insert: AssessmentQuestionTemplateInsert) {
    const { data, error } = await this.supabase
      .from('assessment_question_templates')
      .insert(insert)
      .select()
      .single()

    return { data: data as AssessmentQuestionTemplate | null, error }
  }

  /**
   * Update a template
   */
  async updateTemplate(templateId: string, questionText: string) {
    const { data, error } = await this.supabase
      .from('assessment_question_templates')
      .update({
        question_text: questionText,
        updated_at: new Date().toISOString(),
      })
      .eq('id', templateId)
      .select()
      .single()

    return { data: data as AssessmentQuestionTemplate | null, error }
  }

  /**
   * Delete a template
   */
  async deleteTemplate(templateId: string) {
    const { error } = await this.supabase
      .from('assessment_question_templates')
      .delete()
      .eq('id', templateId)

    return { error }
  }

  // ================================================================
  // CUSTOM RESPONSES
  // ================================================================

  /**
   * Add custom response to assessment
   */
  async addCustomResponse(insert: AssessmentCustomResponseInsert) {
    const { data, error } = await this.supabase
      .from('assessment_custom_responses')
      .insert(insert)
      .select()
      .single()

    return { data: data as AssessmentCustomResponse | null, error }
  }

  /**
   * Update custom response
   */
  async updateCustomResponse(
    responseId: string,
    update: AssessmentCustomResponseUpdate
  ) {
    const { data, error } = await this.supabase
      .from('assessment_custom_responses')
      .update({
        ...update,
        updated_at: new Date().toISOString(),
      })
      .eq('id', responseId)
      .select()
      .single()

    return { data: data as AssessmentCustomResponse | null, error }
  }

  /**
   * Delete custom response
   */
  async deleteCustomResponse(responseId: string) {
    const { error } = await this.supabase
      .from('assessment_custom_responses')
      .delete()
      .eq('id', responseId)

    return { error }
  }

  /**
   * Get custom responses for assessment (coach view - all responses)
   */
  async getCustomResponses(assessmentId: string) {
    const { data, error } = await this.supabase
      .from('assessment_custom_responses')
      .select('*')
      .eq('assessment_id', assessmentId)
      .order('question_order', { ascending: true })

    return { data: data as AssessmentCustomResponse[] | null, error }
  }

  /**
   * Get shareable custom responses (athlete view - only shared responses)
   */
  async getShareableCustomResponses(assessmentId: string) {
    const { data, error } = await this.supabase
      .from('assessment_custom_responses')
      .select('*')
      .eq('assessment_id', assessmentId)
      .eq('share_with_athlete', true)
      .order('question_order', { ascending: true })

    return { data: data as AssessmentCustomResponse[] | null, error }
  }

  // ================================================================
  // ATHLETE REVIEW WORKFLOW
  // ================================================================

  /**
   * Share assessment with athlete
   */
  async shareWithAthlete(assessmentId: string, coachId: string) {
    const { data, error } = await this.supabase
      .from('athlete_assessments')
      .update({
        shared_with_athlete: true,
        shared_at: new Date().toISOString(),
        status: 'pending_athlete_review',
        is_locked: true,
        modified_after_share: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', assessmentId)
      .eq('coach_id', coachId)
      .select()
      .single()

    return { data: data as AthleteAssessment | null, error }
  }

  /**
   * Athlete accepts assessment
   */
  async athleteAcceptAssessment(assessmentId: string, athleteId: string) {
    const { data, error } = await this.supabase
      .from('athlete_assessments')
      .update({
        athlete_response: 'accepted',
        athlete_response_at: new Date().toISOString(),
        status: 'accepted',
        updated_at: new Date().toISOString(),
      })
      .eq('id', assessmentId)
      .eq('athlete_id', athleteId)
      .select()
      .single()

    return { data: data as AthleteAssessment | null, error }
  }

  /**
   * Athlete disputes assessment
   */
  async athleteDisputeAssessment(
    assessmentId: string,
    athleteId: string,
    disputeNotes: string
  ) {
    const { data, error } = await this.supabase
      .from('athlete_assessments')
      .update({
        athlete_response: 'disputed',
        athlete_response_at: new Date().toISOString(),
        athlete_dispute_notes: disputeNotes,
        status: 'disputed',
        is_locked: false, // Unlock for coach to edit
        updated_at: new Date().toISOString(),
      })
      .eq('id', assessmentId)
      .eq('athlete_id', athleteId)
      .select()
      .single()

    return { data: data as AthleteAssessment | null, error }
  }

  /**
   * Mark assessment as modified after sharing (triggers re-review)
   */
  async markModifiedAfterShare(assessmentId: string, modifiedBy: string) {
    const { data, error } = await this.supabase
      .from('athlete_assessments')
      .update({
        modified_after_share: true,
        last_modified_by: modifiedBy,
        status: 'draft', // Return to draft when modified
        is_locked: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', assessmentId)
      .select()
      .single()

    return { data: data as AthleteAssessment | null, error }
  }
}
