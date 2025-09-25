// src/app/api/invitations/[id]/resend/route.ts
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { EmailService } from '@/lib/email/emailService'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerComponentClient({ 
      cookies: () => cookies() 
    })
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get coach profile
    const { data: coachProfile } = await supabase
      .from('coach_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!coachProfile) {
      return NextResponse.json({ error: 'Coach profile not found' }, { status: 403 })
    }

    // Get coach's user details
    const { data: coachUser } = await supabase
      .from('users')
      .select('first_name, last_name, email')
      .eq('id', user.id)
      .single()

    if (!coachUser) {
      return NextResponse.json({ error: 'Coach details not found' }, { status: 403 })
    }

    // Get the invitation and verify ownership
    const { data: invitation, error: inviteError } = await supabase
      .from('coach_athlete_invitations')
      .select('*')
      .eq('id', params.id)
      .eq('coach_id', user.id)
      .single()

    if (inviteError || !invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
    }

    // Check if invitation can be resent
    const allowedStatuses = ['expired', 'email_failed', 'pending']
    if (!allowedStatuses.includes(invitation.status)) {
      return NextResponse.json({ 
        error: `Cannot resend invitation with status: ${invitation.status}` 
      }, { status: 400 })
    }

    // Update invitation with new expiration date and reset status
    const newExpiresAt = new Date()
    newExpiresAt.setDate(newExpiresAt.getDate() + 14) // 14 days from now

    const { data: updatedInvitation, error: updateError } = await supabase
      .from('coach_athlete_invitations')
      .update({
        status: 'pending',
        expires_at: newExpiresAt.toISOString(),
        sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select('*')
      .single()

    if (updateError || !updatedInvitation) {
      console.error('Error updating invitation:', updateError)
      return NextResponse.json({ error: 'Failed to update invitation' }, { status: 500 })
    }

    // Resend invitation email
    const emailResult = await EmailService.sendCoachInvitation({
      coachName: `${coachUser.first_name} ${coachUser.last_name}`,
      coachEmail: coachUser.email,
      coachCredentials: Array.isArray(coachProfile.qualifications) ? 
        coachProfile.qualifications : [],
      invitationToken: updatedInvitation.invitation_token,
      athleteEmail: updatedInvitation.email,
      message: updatedInvitation.message,
      expiresAt: updatedInvitation.expires_at
    })

    if (!emailResult.success) {
      // Mark invitation as email failed again
      await supabase
        .from('coach_athlete_invitations')
        .update({ status: 'email_failed' })
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