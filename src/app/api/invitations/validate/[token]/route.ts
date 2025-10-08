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

    // Step 1: Get the invitation
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
    })

    if (invitationError || !invitation) {
      return NextResponse.json(
        { error: 'Invitation not found', valid: false },
        { status: 404 }
      )
    }

    // Step 2: Validate invitation status
    if (invitation.status !== 'pending') {
      return NextResponse.json(
        { 
          error: 'Invitation is no longer valid', 
          valid: false,
          status: invitation.status
        },
        { status: 400 }
      )
    }

    // Step 3: Check expiry
    const now = new Date()
    const expiresAt = invitation.expires_at ? new Date(invitation.expires_at) : null
    const isExpired = expiresAt ? now > expiresAt : false

    if (isExpired) {
      return NextResponse.json(
        { error: 'Invitation has expired', valid: false, expired: true },
        { status: 400 }
      )
    }

    // Step 4: Get coach data using user_id (which is invitation.coach_id)
    console.log('🔍 Fetching coach from public_invitation_coach_details with user_id:', invitation.coach_id)
    const { data: coachData, error: coachError } = await supabase
      .from('public_invitation_coach_details')
      .select('*')
      .eq('user_id', invitation.coach_id)  // ✅ Match on user_id
      .single()

    console.log('🔍 Coach query result:', {
      found: !!coachData,
      error: coachError?.message,
      user_id: coachData?.user_id,
      name: coachData ? `${coachData.first_name} ${coachData.last_name}` : null
    })

    if (coachError || !coachData) {
      console.log('❌ Coach not found:', coachError)
      return NextResponse.json(
        { error: 'Coach not found', valid: false },
        { status: 404 }
      )
    }
  
   // Step 5: Check if invited user already exists
    console.log('🔍 Checking if user exists with email:', invitation.email)
    const { data: existingUser, error: userCheckError } = await supabase
    .from('users')
    .select('id, email, role')
    .eq('email', invitation.email)
    .maybeSingle() // Use maybeSingle instead of single - doesn't error if not found

    console.log('🔍 User check result:', { 
    exists: !!existingUser, 
    error: userCheckError?.message 
  })

  // Step 6: Return complete validation response with user existence flag
  console.log('✅ Invitation validated successfully')
  return NextResponse.json({
  valid: true,
  userExists: !!existingUser, // ✅ Add this flag
  existingUserId: existingUser?.id || null,
  invitation: {
    email: invitation.email,
    message: invitation.message,
    expiresAt: invitation.expires_at,
    sentAt: invitation.sent_at,
  },
  coach: {
    // @ts-ignore
    userId: coachData.user_id,
    // @ts-ignore
    name: `${coachData.first_name} ${coachData.last_name}`,
    // @ts-ignore
    workspaceName: coachData.workspace_name,
    // @ts-ignore
    workspaceSlug: coachData.workspace_slug,
    // @ts-ignore
    email: coachData.email,
    // @ts-ignore
    photoUrl: coachData.profile_photo_url,
    // @ts-ignore
    bio: coachData.bio,
    // @ts-ignore
    philosophy: coachData.coaching_philosophy,
    // @ts-ignore
    yearsExperience: coachData.years_experience,
    // @ts-ignore
    location: coachData.coaching_location,
    // @ts-ignore
    priceRange: coachData.price_range,
    // @ts-ignore
    availabilityStatus: coachData.availability_status,
    // @ts-ignore
    qualifications: coachData.qualifications || [],
    // @ts-ignore
    specializations: coachData.specializations || [],
  },
})
  } catch (error) {
    console.error('❌ Validation route error:', error)
    return NextResponse.json(
      { error: 'Internal server error', valid: false },
      { status: 500 }
    )
  }
}