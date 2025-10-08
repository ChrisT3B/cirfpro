// src/app/api/invitations/validate/[token]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  try {
    const params = await context.params
    const token = params.token
    
    console.log('🔍 Validating invitation token:', token)
    
    const supabase = await createClient()

    // Step 1: Get the invitation first
    const { data: invitation, error: invitationError } = await supabase
      .from('coach_athlete_invitations')
      .select('*')
      .eq('invitation_token', token)
      .single()

    console.log('🔍 Invitation data:', {
      found: !!invitation,
      coach_id: invitation?.coach_id,
      email: invitation?.email,
      status: invitation?.status,
      error: invitationError?.message
    })

    if (invitationError || !invitation) {
      return NextResponse.json(
        { error: 'Invitation not found', valid: false },
        { status: 404 }
      )
    }

    // Step 2: Get coach user details - check if coach_id exists first
    if (!invitation.coach_id) {
      console.log('❌ No coach_id in invitation')
      return NextResponse.json(
        { error: 'Invalid invitation: missing coach', valid: false },
        { status: 404 }
      )
    }

    console.log('🔍 Looking for coach user with ID:', invitation.coach_id)

    const { data: coachUsers, error: coachUserError } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role')
      .eq('id', invitation.coach_id)

    console.log('🔍 Coach user query result:', {
      count: coachUsers?.length,
      data: coachUsers,
      error: coachUserError?.message
    })

    if (coachUserError || !coachUsers || coachUsers.length === 0) {
      console.log('❌ Coach user not found')
      return NextResponse.json(
        { error: 'Coach not found', valid: false },
        { status: 404 }
      )
    }

    const coachUser = coachUsers[0]

    // Step 3: Get coach profile details
    const { data: coachProfile, error: coachProfileError } = await supabase
      .from('coach_profiles')
      .select('*')
      .eq('user_id', invitation.coach_id)
      .single()

    console.log('🔍 Coach profile found:', !!coachProfile, coachProfileError?.message)

    if (coachProfileError || !coachProfile) {
      return NextResponse.json(
        { error: 'Coach profile not found', valid: false },
        { status: 404 }
      )
    }

    // Check invitation validity
    const now = new Date()
    const expiresAt = invitation.expires_at ? new Date(invitation.expires_at) : null
    const isExpired = expiresAt ? now > expiresAt : false
    const isAccepted = invitation.status === 'accepted' || invitation.accepted_at !== null
    const isCancelled = invitation.status === 'cancelled'
    const isValid = !isExpired && !isAccepted && !isCancelled && invitation.status === 'pending'

    // Check if athlete email already has an account
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('email', invitation.email)
      .single()

    const hasAccount = !!existingUser
    const existingUserRole = existingUser?.role || null

    console.log('✅ Validation complete:', { isValid, hasAccount })

    return NextResponse.json({
      valid: isValid,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        message: invitation.message,
        status: invitation.status,
        expiresAt: invitation.expires_at,
        sentAt: invitation.sent_at,
        isExpired,
        isAccepted,
        isCancelled,
      },
      coach: {
        name: `${coachUser.first_name} ${coachUser.last_name}`,
        firstName: coachUser.first_name,
        lastName: coachUser.last_name,
        email: coachUser.email,
        photoUrl: coachProfile.profile_photo_url,
        qualifications: coachProfile.qualifications || [],
        specializations: coachProfile.specializations || [],
        philosophy: coachProfile.coaching_philosophy,
        yearsExperience: coachProfile.years_experience,
        workspaceSlug: coachProfile.workspace_slug,
      },
      hasAccount,
      existingUserRole,
    })

  } catch (error) {
    console.error('❌ Error validating invitation:', error)
    return NextResponse.json(
      { error: 'Internal server error', valid: false },
      { status: 500 }
    )
  }
}