// src/app/api/invitations/validate/[token]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const token = params.token
    const supabase = createClient()

    // Fetch invitation with coach details
    const { data: invitation, error: invitationError } = await supabase
      .from('coach_athlete_invitations')
      .select(`
        id,
        coach_id,
        email,
        message,
        status,
        expires_at,
        sent_at,
        accepted_at,
        coach_profiles!inner (
          id,
          workspace_slug,
          qualifications,
          specializations,
          coaching_philosophy,
          years_experience,
          profile_photo_url,
          users!inner (
            first_name,
            last_name,
            email
          )
        )
      `)
      .eq('invitation_token', token)
      .single()

    if (invitationError || !invitation) {
      return NextResponse.json(
        { error: 'Invitation not found', valid: false },
        { status: 404 }
      )
    }

    // Check if invitation is expired
    const now = new Date()
    const expiresAt = invitation.expires_at ? new Date(invitation.expires_at) : null
    const isExpired = expiresAt ? now > expiresAt : false

    // Check if already accepted
    const isAccepted = invitation.status === 'accepted' || invitation.accepted_at !== null

    // Check if cancelled
    const isCancelled = invitation.status === 'cancelled'

    // Determine validity
    const isValid = !isExpired && !isAccepted && !isCancelled && invitation.status === 'pending'

    // Check if athlete email already has an account
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('email', invitation.email)
      .single()

    const hasAccount = !!existingUser

    // Format coach details
    const coachProfile = invitation.coach_profiles as any
    const coachUser = coachProfile.users as any

    const coachDetails = {
      name: `${coachUser.first_name} ${coachUser.last_name}`,
      firstName: coachUser.first_name,
      lastName: coachUser.last_name,
      email: coachUser.email,
      photoUrl: coachProfile.profile_photo_url,
      qualifications: coachProfile.qualifications || [],
      specializations: coachProfile.specializations || [],
      philosophy: coachProfile.coaching_philosophy,
      yearsExperience: coachProfile.years_experience,
      workspaceSlug: coachProfile.workspace_slug
    }

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
        isCancelled
      },
      coach: coachDetails,
      hasAccount,
      existingUserRole: existingUser?.role || null
    })

  } catch (error) {
    console.error('Error validating invitation:', error)
    return NextResponse.json(
      { error: 'Failed to validate invitation', valid: false },
      { status: 500 }
    )
  }
}