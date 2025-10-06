// src/app/api/invitations/pending/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'  // ← Changed this line

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API Route: Starting pending invitations fetch')
    
    const supabase = await createClient()
    console.log('🔍 API Route: Supabase client created')

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    console.log('🔍 API Route: Auth check result:', {
      hasUser: !!user,
      userId: user?.id,
      errorCode: authError?.code,
      errorMessage: authError?.message
    })

    if (authError || !user) {
      console.error('❌ Authentication error:', authError)
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('✅ API Route: User authenticated, fetching data...')

    // Get user's email
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('email')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Fetch pending invitations with coach details
        const { data: invitations, error: invitationsError } = await supabase
        .from('coach_athlete_invitations')
        .select(`
            id,
            coach_id,
            email,
            message,
            status,
            expires_at,
            sent_at,
            invitation_token,
            coach:users!coach_id (
            id,
            first_name,
            last_name,
            email,
            coach_profiles (
                id,
                qualifications,
                specializations,
                coaching_philosophy,
                years_experience,
                profile_photo_url
            )
            )
        `)
        .eq('email', userData.email)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())

    if (invitationsError) {
      console.error('Error fetching pending invitations:', invitationsError)
      return NextResponse.json(
        { error: 'Failed to fetch invitations' },
        { status: 500 }
      )
    }
console.log('📊 Raw invitations data:', JSON.stringify(invitations, null, 2))
    // Format the response
const formattedInvitations = (invitations || []).map((inv: any) => {
  const coachUser = inv.coach
  const coachProfile = coachUser?.coach_profiles

  if (!coachUser) {
    console.error('Missing coach user data for invitation:', inv.id)
    return null
  }

  return {
    id: inv.id,
    coachId: inv.coach_id,
    email: inv.email,
    message: inv.message,
    status: inv.status,
    expiresAt: inv.expires_at,
    sentAt: inv.sent_at,
    invitationToken: inv.invitation_token,
    coach: {
      name: `${coachUser.first_name} ${coachUser.last_name}`,
      email: coachUser.email,
      qualifications: coachProfile?.qualifications || [],
      photoUrl: coachProfile?.profile_photo_url,
      philosophy: coachProfile?.coaching_philosophy,
      yearsExperience: coachProfile?.years_experience
    }
  }
}).filter(Boolean)

console.log('✅ API Route: Returning invitations:', formattedInvitations.length)

    return NextResponse.json({
      success: true,
      invitations: formattedInvitations,
      count: formattedInvitations.length
    })

  } catch (error) {
    console.error('Error in pending invitations route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}