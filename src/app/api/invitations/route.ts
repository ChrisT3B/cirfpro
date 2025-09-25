// src/app/api/invitations/route.ts
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Query parameters schema
const querySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
  status: z.enum(['pending', 'accepted', 'expired', 'declined', 'cancelled', 'email_failed']).optional(),
  email: z.string().optional(),
  search: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerComponentClient({ 
      cookies: () => cookies() 
    })
    
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

    // Parse and validate query parameters
    const url = new URL(request.url)
    const queryParams = Object.fromEntries(url.searchParams)
    const { page, limit, status, email, search } = querySchema.parse(queryParams)

    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const offset = (pageNum - 1) * limitNum

    // Build query with filters
    let query = supabase
      .from('coach_athlete_invitations')
      .select('*', { count: 'exact' })
      .eq('coach_id', user.id)
      .order('created_at', { ascending: false })

    // Apply filters
    if (status) {
      query = query.eq('status', status)
    }

    if (email) {
      query = query.ilike('email', `%${email}%`)
    }

    if (search) {
      query = query.or(`email.ilike.%${search}%,message.ilike.%${search}%`)
    }

    // Apply pagination
    query = query.range(offset, offset + limitNum - 1)

    // Execute both queries in parallel for better performance
    const [invitationsResult, statsResult] = await Promise.all([
      query,
      supabase
        .from('coach_athlete_invitations')
        .select('status')
        .eq('coach_id', user.id)
    ])

    if (invitationsResult.error) {
      console.error('Error fetching invitations:', invitationsResult.error)
      return NextResponse.json({ error: 'Failed to fetch invitations' }, { status: 500 })
    }

    const invitations = invitationsResult.data
    const count = invitationsResult.count
    
    // Calculate pagination info
    const totalPages = Math.ceil((count || 0) / limitNum)
    const hasNext = pageNum < totalPages
    const hasPrev = pageNum > 1
    
    // Calculate stats from parallel query
    const statusCounts = {
      total: statsResult.data?.length || 0,
      pending: statsResult.data?.filter(s => s.status === 'pending').length || 0,
      accepted: statsResult.data?.filter(s => s.status === 'accepted').length || 0,
      expired: statsResult.data?.filter(s => s.status === 'expired').length || 0,
      declined: statsResult.data?.filter(s => s.status === 'declined').length || 0,
      cancelled: statsResult.data?.filter(s => s.status === 'cancelled').length || 0,
      email_failed: statsResult.data?.filter(s => s.status === 'email_failed').length || 0,
    }

    // Format invitation data
    const formattedInvitations = invitations?.map(invitation => ({
      id: invitation.id,
      email: invitation.email,
      status: invitation.status,
      message: invitation.message,
      expires_at: invitation.expires_at,
      sent_at: invitation.sent_at,
      accepted_at: invitation.accepted_at,
      created_at: invitation.created_at,
      updated_at: invitation.updated_at,
      // Add computed fields for UI
      is_expired: new Date(invitation.expires_at) < new Date(),
      days_until_expiry: Math.ceil((new Date(invitation.expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    })) || []

    return NextResponse.json({
      success: true,
      data: {
        invitations: formattedInvitations,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: count || 0,
          totalPages,
          hasNext,
          hasPrev
        },
        stats: statusCounts
      }
    })

  } catch (error) {
    console.error('Error in GET /api/invitations:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid query parameters', 
        details: error.issues 
      }, { status: 400 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}