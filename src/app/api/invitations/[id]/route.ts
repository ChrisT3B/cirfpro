// src/app/api/invitations/[id]/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify coach profile exists
    const { data: coachProfile } = await supabase
      .from('coach_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!coachProfile) {
      return NextResponse.json({ error: 'Coach profile not found' }, { status: 403 })
    }

    // Get the invitation and verify ownership
    const { data: invitation, error: inviteError } = await supabase
      .from('coach_athlete_invitations')
      .select('id, email, status, coach_id')
      .eq('id', params.id)
      .eq('coach_id', user.id)
      .single()

    if (inviteError || !invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
    }

    // Check if invitation can be canceled
    const allowedStatuses = ['pending', 'email_failed']
    //@ts-ignore
    if (!allowedStatuses.includes(invitation.status)) {
      return NextResponse.json({ 
        //@ts-ignore
        error: `Cannot cancel invitation with status: ${invitation.status}` 
      }, { status: 400 })
    }

    // Update invitation status to cancelled
    const { data: updatedInvitation, error: updateError } = await supabase
      .from('coach_athlete_invitations')
      //@ts-ignore
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select('id, email, status, updated_at')
      .single()

    if (updateError || !updatedInvitation) {
      console.error('Error canceling invitation:', updateError)
      return NextResponse.json({ error: 'Failed to cancel invitation' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: 'Invitation canceled successfully',
      invitation: {
        id: updatedInvitation.id,
        email: updatedInvitation.email,
        status: updatedInvitation.status,
        updated_at: updatedInvitation.updated_at
      }
    })

  } catch (error) {
    console.error('Error in cancel invitation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}