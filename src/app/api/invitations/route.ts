// src/app/api/invitations/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const querySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
  status: z.string().optional(),
  email: z.string().optional(),
  search: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate query parameters
    const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries())
    const { page, limit, status, email, search } = querySchema.parse(searchParams)
    
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

    // Format invitation data with null-safe date handling
    const formattedInvitations = invitations?.map(invitation => {
      // Parse dates safely - use current date as fallback if null
      const expiresAt = invitation.expires_at ? new Date(invitation.expires_at) : new Date()
      const sentAt = invitation.sent_at ? new Date(invitation.sent_at) : new Date()
      const now = new Date()
      
      return {
        id: invitation.id,
        email: invitation.email,
        status: invitation.status,
        message: invitation.message,
        expires_at: invitation.expires_at,
        sent_at: invitation.sent_at,
        accepted_at: invitation.accepted_at,
        created_at: invitation.created_at,
        updated_at: invitation.updated_at,
        // Add computed fields for UI - only calculate if dates exist
        is_expired: invitation.expires_at ? expiresAt < now : false,
        days_until_expiry: invitation.expires_at 
          ? Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          : 0
      }
    }) || []

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