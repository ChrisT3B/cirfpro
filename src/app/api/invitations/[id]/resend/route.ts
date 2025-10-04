// src/app/api/invitations/[id]/resend/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { EmailService } from '@/lib/email/emailService'
import type { CoachProfile, User } from '@/lib/supabase'
import type { Database } from '@/types/database.types'

type CoachAthleteInvitation = Database['public']['Tables']['coach_athlete_invitations']['Row']

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const { id } = params
    const supabase = await createClient()
    
    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get coach profile
    const { data: coachProfileData } = await supabase
      .from('coach_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    const coachProfile = coachProfileData as CoachProfile | null

    if (!coachProfile) {
      return NextResponse.json({ error: 'Coach profile not found' }, { status: 403 })
    }

    // Get coach user details
    const { data: coachUserData } = await supabase
      .from('users')
      .select('first_name, last_name, email')
      .eq('id', user.id)
      .single()

    const coachUser = coachUserData as User | null

    if (!coachUser || !coachUser.first_name || !coachUser.last_name) {
      return NextResponse.json({ error: 'Coach details not found' }, { status: 403 })
    }

    // Get existing invitation
    const { data: invitationData, error: inviteError } = await supabase
      .from('coach_athlete_invitations')
      .select('*')
      .eq('id', id)
      .eq('coach_id', user.id) // Ensure coach owns this invitation
      .single()

    const invitation = invitationData as CoachAthleteInvitation | null

    if (inviteError || !invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
    }

    // Validate invitation has required fields
    if (!invitation.invitation_token) {
      return NextResponse.json({ 
        error: 'Invitation token is missing, cannot resend' 
      }, { status: 400 })
    }

    // Check if invitation can be resent
    const allowedStatuses: Array<string> = ['expired', 'email_failed', 'pending']
    const invitationStatus = invitation.status
    
    if (!invitationStatus || !allowedStatuses.includes(invitationStatus)) {
      return NextResponse.json({ 
        error: `Cannot resend invitation with status: ${invitationStatus || 'unknown'}` 
      }, { status: 400 })
    }

    // Generate new token and expiration date
    const newToken = crypto.randomUUID()
    const newExpiresAt = new Date()
    newExpiresAt.setDate(newExpiresAt.getDate() + 14) // 14 days from now
    const newExpiresAtString = newExpiresAt.toISOString()
    const newSentAtString = new Date().toISOString()

    // Update the invitation
    const { data: updatedInvitationData, error: updateError } = await supabase
      .from('coach_athlete_invitations')
      .update({
        invitation_token: newToken,
        status: 'pending' as const,
        expires_at: newExpiresAtString,
        sent_at: newSentAtString,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('*')
      .single()

    const updatedInvitation = updatedInvitationData as CoachAthleteInvitation | null

    if (updateError || !updatedInvitation) {
      console.error('Error updating invitation:', updateError)
      return NextResponse.json({ error: 'Failed to update invitation' }, { status: 500 })
    }

    // Validate required fields for email
    if (!updatedInvitation.invitation_token || !updatedInvitation.expires_at) {
      return NextResponse.json({ 
        error: 'Invitation data incomplete after update' 
      }, { status: 500 })
    }

    // Send invitation email
    const emailResult = await EmailService.sendCoachInvitation({
      coachName: `${coachUser.first_name} ${coachUser.last_name}`,
      coachEmail: coachUser.email,
      coachCredentials: Array.isArray(coachProfile.qualifications) ? 
        coachProfile.qualifications : [],
      invitationToken: updatedInvitation.invitation_token,
      athleteEmail: updatedInvitation.email,
      message: updatedInvitation.message || undefined,
      expiresAt: updatedInvitation.expires_at
    })

    // Handle email failure
    if (!emailResult.success) {
      await supabase
        .from('coach_athlete_invitations')
        .update({ 
          status: 'email_failed' as const,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      return NextResponse.json({ 
        error: 'Invitation updated but failed to send email' 
      }, { status: 500 })
    }

    // Success response
    return NextResponse.json({ 
      success: true,
      message: 'Invitation resent successfully',
      invitation: {
        id: updatedInvitation.id,
        email: updatedInvitation.email,
        status: updatedInvitation.status,
        expires_at: updatedInvitation.expires_at,
        sent_at: updatedInvitation.sent_at
      },
      emailSent: true
    })

  } catch (error) {
    console.error('Error in resend invitation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}