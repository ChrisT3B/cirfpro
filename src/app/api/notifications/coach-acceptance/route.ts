// src/app/api/notifications/coach-acceptance/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { EmailService } from '@/lib/email/emailService'

// Validation schema
const requestSchema = z.object({
  coachId: z.string().uuid('Invalid coach ID'),
  athleteId: z.string().uuid('Invalid athlete ID'),
  acceptedAt: z.string().datetime('Invalid datetime format'),
})

export async function POST(request: NextRequest) {
  try {
    // Step 1: Authentication check
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Step 2: Parse and validate request body
    const body = await request.json()
    const validatedData = requestSchema.parse(body)

    // Step 3: Verify the athlete making the request is the authenticated user
    const { data: athleteProfile, error: athleteError } = await supabase
      .from('athlete_profiles')
      .select('id, user_id')
      .eq('id', validatedData.athleteId)
      .single()

    if (athleteError || !athleteProfile) {
      return NextResponse.json({ error: 'Athlete profile not found' }, { status: 404 })
    }

    if (athleteProfile.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized to send this notification' }, { status: 403 })
    }

    // Step 4: Get comprehensive relationship data by joining tables
    const { data: relationshipData, error: relationshipError } = await supabase
      .from('coach_athlete_relationships')
      .select(`
        id,
        coach_id,
        athlete_id,
        created_at,
        coach_profiles!inner (
          id,
          user_id,
          workspace_slug,
          users!inner (
            id,
            email,
            first_name,
            last_name
          )
        ),
        athlete_profiles!inner (
          id,
          user_id,
          users!inner (
            id,
            email,
            first_name,
            last_name
          ),
          experience_level,
          goal_race_distance,
          goal_race_date
        )
      `)
      .eq('coach_id', validatedData.coachId)
      .eq('athlete_id', validatedData.athleteId)
      .eq('status', 'active')
      .single()

    if (relationshipError || !relationshipData) {
      console.error('Relationship lookup error:', relationshipError)
      return NextResponse.json({ 
        error: 'Coach-athlete relationship not found' 
      }, { status: 404 })
    }

    // Step 5: Extract data for email
    const coach = relationshipData.coach_profiles
    const athlete = relationshipData.athlete_profiles
    
    // Type assertion for nested data
    const coachUser = coach.users as any
    const athleteUser = athlete.users as any

    if (!coachUser || !athleteUser) {
      return NextResponse.json({ 
        error: 'Missing user data for notification' 
      }, { status: 500 })
    }

    // Step 6: Prepare email data
    const emailData = {
      coachEmail: coachUser.email,
      coachName: `${coachUser.first_name} ${coachUser.last_name}`,
      athleteName: `${athleteUser.first_name} ${athleteUser.last_name}`,
      athleteEmail: athleteUser.email,
      athleteExperience: athlete.experience_level || 'Not specified',
      athleteGoalDistance: athlete.goal_race_distance || 'Not specified',
      athleteGoalDate: athlete.goal_race_date 
        ? new Date(athlete.goal_race_date).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })
        : 'Not specified',
      athleteProfileUrl: `${process.env.NEXT_PUBLIC_APP_URL}/coach/${coach.workspace_slug}/athletes/${athlete.id}`,
      acceptedAt: new Date(validatedData.acceptedAt).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    // Step 7: Send notification email
    const emailResult = await EmailService.sendAthleteAcceptanceNotification(emailData)

    if (!emailResult.success) {
      console.error('Failed to send notification email:', emailResult.error)
      return NextResponse.json({ 
        error: 'Failed to send notification email',
        details: emailResult.error
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: 'Coach notification sent successfully',
      messageId: emailResult.messageId
    })

  } catch (error) {
    console.error('Error in coach acceptance notification:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid request data', 
        details: error.issues 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}