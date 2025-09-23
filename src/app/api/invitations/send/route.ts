// src/app/api/invitations/send/route.ts
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { EmailService } from '@/lib/email/emailService'

const invitationSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  message: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerComponentClient({ 
      cookies: () => cookies() 
    })
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { email, message } = invitationSchema.parse(body)

    // Get coach profile (with proper typing)
    const { data: coachProfile } = await supabase
      .from('coach_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!coachProfile) {
      return NextResponse.json({ error: 'Coach profile not found' }, { status: 403 })
    }

    // Get coach's full user details (with proper typing)
    const { data: coachUser } = await supabase
      .from('users')
      .select('first_name, last_name, email')
      .eq('id', user.id)
      .single()

    if (!coachUser) {
      return NextResponse.json({ error: 'Coach details not found' }, { status: 403 })
    }

    // Check for existing pending invitation
    const { data: existingInvitation } = await supabase
      .from('coach_athlete_invitations')
      .select('*')
      .eq('coach_id', user.id)
      .eq('email', email.toLowerCase())
      .eq('status', 'pending')
      .single()

    if (existingInvitation) {
      return NextResponse.json({ 
        error: 'An invitation to this email is already pending' 
      }, { status: 409 })
    }

    // Create new invitation
    const { data: invitation, error: inviteError } = await supabase
      .from('coach_athlete_invitations')
      .insert({
        coach_id: user.id,
        email: email.toLowerCase(),
        message: message || null,
      })
      .select('*')
      .single()

    if (inviteError || !invitation) {
      console.error('Error creating invitation:', inviteError)
      return NextResponse.json({ error: 'Failed to create invitation' }, { status: 500 })
    }

    // Send invitation email
    const emailResult = await EmailService.sendCoachInvitation({
      coachName: `${coachUser.first_name} ${coachUser.last_name}`,
      coachEmail: coachUser.email,
      coachCredentials: Array.isArray(coachProfile.qualifications) ? coachProfile.qualifications : [],
      invitationToken: invitation.invitation_token,
      athleteEmail: email,
      message: message,
      expiresAt: invitation.expires_at
    })

    if (!emailResult.success) {
      // Mark invitation as email failed
      await supabase
        .from('coach_athlete_invitations')
        .update({ status: 'email_failed' })
        .eq('id', invitation.id)

      return NextResponse.json({ 
        error: 'Failed to send invitation email' 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        status: invitation.status,
        expires_at: invitation.expires_at,
        sent_at: invitation.sent_at
      },
      emailSent: true
    })

  } catch (error) {
    console.error('Error in send invitation:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid input', 
        details: error.issues 
      }, { status: 400 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}