// src/app/api/invitations/[id]/resend/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { EmailService } from '@/lib/email/emailService'
import type { CoachProfile, User } from '@/lib/supabase'

// Define invitation type
interface CoachAthleteInvitation {
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

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: coachProfileData } = await supabase
      .from('coach_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    const coachProfile = coachProfileData as CoachProfile | null

    if (!coachProfile) {
      return NextResponse.json({ error: 'Coach profile not found' }, { status: 403 })
    }

    const { data: coachUserData } = await supabase
      .from('users')
      .select('first_name, last_name, email')
      .eq('id', user.id)
      .single()

    const coachUser = coachUserData as User | null

    if (!coachUser) {
      return NextResponse.json({ error: 'Coach details not found' }, { status: 403 })
    }

    const { data: invitationData, error: inviteError } = await supabase
      .from('coach_athlete_invitations')
      .select('*')
      .eq('id', params.id)
      .eq('coach_id', user.id)
      .single()

    const invitation = invitationData as CoachAthleteInvitation | null

    if (inviteError || !invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
    }

    const allowedStatuses = ['expired', 'email_failed', 'pending']
    if (!allowedStatuses.includes(invitation.status)) {
      return NextResponse.json({ 
        error: `Cannot resend invitation with status: ${invitation.status}` 
      }, { status: 400 })
    }

    const newExpiresAt = new Date()
    newExpiresAt.setDate(newExpiresAt.getDate() + 14)

    // @ts-ignore - Database type issue with coach_athlete_invitations
    const { data: updatedInvitationData, error: updateError } = await supabase
      .from('coach_athlete_invitations')
      // @ts-ignore
      .update({ 
        status: 'pending',
        expires_at: newExpiresAt.toISOString(),
        sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select('*')
      .single()

    const updatedInvitation = updatedInvitationData as CoachAthleteInvitation | null

    if (updateError || !updatedInvitation) {
      console.error('Error updating invitation:', updateError)
      return NextResponse.json({ error: 'Failed to update invitation' }, { status: 500 })
    }

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

    if (!emailResult.success) {
      // @ts-ignore - Database type issue with coach_athlete_invitations
      await supabase
        .from('coach_athlete_invitations')
        //@ts-ignore
        .update({
         status: 'email_failed' } as any) 
        .eq('id', params.id)

      return NextResponse.json({ 
        error: 'Invitation updated but failed to send email' 
      }, { status: 500 })
    }

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