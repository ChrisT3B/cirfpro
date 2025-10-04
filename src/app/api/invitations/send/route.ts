// src/app/api/invitations/send/route.ts
// Updated for @supabase/ssr compatibility with Next.js 15
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { EmailService } from '@/lib/email/emailService'

const invitationSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  message: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    // Create Supabase client using SSR-compatible method
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate request body
    const body = await request.json()
    const { email, message } = invitationSchema.parse(body)

    // Get coach profile
    const { data: coachProfile } = await supabase
      .from('coach_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!coachProfile) {
      return NextResponse.json({ error: 'Coach profile not found' }, { status: 403 })
    }

    // Get coach's full user details
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
      coachCredentials: Array.isArray(coachProfile.qualifications) 
        ? coachProfile.qualifications 
        : [],
      invitationToken: invitation.invitation_token || '',
      athleteEmail: email,
      message: message,
      expiresAt: invitation.expires_at || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() // Handle null with 14-day default
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