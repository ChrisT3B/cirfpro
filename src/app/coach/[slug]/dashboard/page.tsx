// src/app/coach/[slug]/dashboard/page.tsx - JWT-FIRST ARCHITECTURE
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase'
import InvitationModal from '@/components/InvitationModal'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type { Database } from '@/types/database.types'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { StatCard } from '@/components/ui/StatCard'
import { Heading, Text, Caption, Badge } from '@/components/ui/Typography'

// Define specific types for our database operations
type InvitationWithExpiry = Database['public']['Views']['coach_invitations_with_expiry']['Row']

// Define joined athlete type for the query result
interface AthleteWithUser {
  id: string
  user_id: string
  coach_id: string | null
  experience_level: 'beginner' | 'intermediate' | 'advanced'
  goal_race_distance: string | null
  created_at: string
  users: {
    first_name: string | null
    last_name: string | null
    email: string
  } | null
}

interface DashboardStats {
  total_athletes: number
  active_athletes: number
  pending_invitations: number
  this_week_sessions: number
}

interface Athlete {
  id: string
  first_name: string
  last_name: string
  email: string
  experience_level: string
  goal_race_distance: string | null
  created_at: string
}

export default function CoachDashboard() {
  console.log('🏗️ Coach Dashboard component loading/mounting')
  
  const params = useParams()
  const router = useRouter()
  
  // Extract slug safely with TypeScript checking
  const slug = typeof params?.slug === 'string' ? params.slug : null
  
  const { 
    user, 
    loading: authLoading, 
    // INSTANT JWT DATA
    isCoach, 
    workspaceSlug, 
    firstName,
    lastName,
    role,
    // DETAILED PROFILES
    coachProfile 
  } = useAuth()

  console.log('🎯 Coach Dashboard auth state:', {
    user: !!user,
    authLoading,
    isCoach,
    workspaceSlug,
    firstName,
    lastName,
    role,
    urlSlug: slug,
    hasCoachProfile: !!coachProfile
  })

  const [stats, setStats] = useState<DashboardStats>({
    total_athletes: 0,
    active_athletes: 0,
    pending_invitations: 0,
    this_week_sessions: 0
  })

  const [athletes, setAthletes] = useState<Athlete[]>([])
  const [recentInvitations, setRecentInvitations] = useState<InvitationWithExpiry[]>([])
  const [loading, setLoading] = useState(true)
  const [unauthorized, setUnauthorized] = useState(false)
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [athletesSectionOpen, setAthletesSectionOpen] = useState(true)
  const [invitationsSectionOpen, setInvitationsSectionOpen] = useState(true)

  const fetchDashboardData = useCallback(async () => {
    if (!user || !isCoach) return
    
    console.log('📊 Fetching dashboard data...')
    setLoading(true)
    
    try {
      const supabase = createClient()

      // Fetch coach's athletes
      const { data: athleteData, error: athleteError } = await supabase
        .from('athlete_profiles')
        .select(`
          *,
          users (
            first_name,
            last_name,
            email
          )
        `)
        .eq('coach_id', user.id)

      if (athleteError) {
        console.error('Error fetching athletes:', athleteError)
      } else {
        const transformedAthletes: Athlete[] = (athleteData as AthleteWithUser[])?.map((athlete: AthleteWithUser) => ({
          id: athlete.id,
          first_name: athlete.users?.first_name || '',
          last_name: athlete.users?.last_name || '',
          email: athlete.users?.email || '',
          experience_level: athlete.experience_level || 'beginner',
          goal_race_distance: athlete.goal_race_distance,
          created_at: athlete.created_at
        })) || []
        
        setAthletes(transformedAthletes)
        console.log(`✅ Loaded ${transformedAthletes.length} athletes`)
      }

      // Fetch invitations - using database view with calculated expiry
      const { data: invitationData, error: invitationError } = await supabase
        .from('coach_invitations_with_expiry')
        .select('*')
        .eq('coach_id', user.id)
        .order('sent_at', { ascending: false })
        .limit(5)

      if (invitationError) {
        console.error('Error fetching invitations:', invitationError)
      } else {
        // Data already includes days_until_expiry calculated by the database view
        const invitations = (invitationData as InvitationWithExpiry[]) || []
        setRecentInvitations(invitations)
        console.log(`✅ Loaded ${invitations.length} invitations`)
      }

      // Calculate stats
      const totalAthletes = athleteData?.length || 0
      const activeAthletes = totalAthletes // Simplified for now
      const pendingInvitations = invitationData?.filter((inv: InvitationWithExpiry) => inv.status === 'pending').length || 0

      setStats({
        total_athletes: totalAthletes,
        active_athletes: activeAthletes,
        pending_invitations: pendingInvitations,
        this_week_sessions: 0 // Placeholder
      })

      console.log('✅ Dashboard data loaded successfully')
      
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }, [user, isCoach])

  // JWT-FIRST AUTHORIZATION CHECK
  useEffect(() => {
    console.log('🔒 Running coach dashboard authorization check...', {
      authLoading,
      user: !!user,
      isCoach,
      workspaceSlug,
      urlSlug: slug,
      'workspaceSlug === slug': workspaceSlug === slug,
      'workspaceSlug type': typeof workspaceSlug,
      'slug type': typeof slug
    })

    if (authLoading) {
      console.log('⏳ Auth still loading...')
      return
    }

    if (!user) {
      console.log('🚫 No user, redirecting to signin')
      router.push('/auth/signin')
      return
    }

    if (!isCoach) {
      console.log('🚫 Not a coach, redirecting to general dashboard')
      router.push('/dashboard')
      return
    }

    if (!slug) {
      console.log('❌ No slug in URL')
      setUnauthorized(true)
      return
    }

    // Check if coach is accessing their own workspace using JWT data
    if (workspaceSlug && workspaceSlug !== slug) {
      console.log(`🔀 Wrong workspace. Expected: "${workspaceSlug}", Got: "${slug}". Redirecting...`)
      router.push(`/coach/${workspaceSlug}/dashboard`)
      return
    }

    if (workspaceSlug === slug) {
      console.log('✅ Authorization passed - coach accessing their own workspace')
      console.log('🔄 Setting loading to false and proceeding to load dashboard data')
      setLoading(false) // Set loading to false immediately
      // Proceed to load dashboard data
    } else if (!workspaceSlug) {
      console.log('⏳ Waiting for workspaceSlug to be derived from JWT...')
      console.log('Current workspaceSlug value:', workspaceSlug)
      // Will re-run when workspaceSlug is set
      return
    } else {
      console.log('❓ Unexpected state:', { workspaceSlug, slug, 'equal': workspaceSlug === slug })
    }

  }, [authLoading, user, isCoach, workspaceSlug, slug, router])

  // Load dashboard data when authorization is complete
  useEffect(() => {
    if (!authLoading && user && isCoach && workspaceSlug === slug) {
      console.log('🚀 Authorization complete, loading dashboard data')
      fetchDashboardData()
    }
  }, [authLoading, user, isCoach, workspaceSlug, slug, fetchDashboardData])

  // Show loading while auth is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading authentication...</p>
        </div>
      </div>
    )
  }

  // Show loading while checking workspace authorization
  if (!workspaceSlug || (workspaceSlug === slug && loading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your coaching workspace...</p>
          {!workspaceSlug && (
            <p className="mt-2 text-sm text-gray-500">Deriving workspace from your profile...</p>
          )}
        </div>
      </div>
    )
  }

  // Show unauthorized message
  if (unauthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You don&apos;t have permission to access this workspace.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Go to your dashboard
          </button>
        </div>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-blue-100 text-blue-800'
      case 'accepted': return 'bg-green-100 text-green-800'
      case 'expired': return 'bg-red-100 text-red-800'
      case 'declined': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }
const getStatusBadgeVariant = (status: string): 'success' | 'warning' | 'error' | 'info' | 'default' => {
  switch (status) {
    case 'accepted': return 'success'
    case 'pending': return 'info'
    case 'expired': 
    case 'declined': return 'error'
    case 'email_failed': return 'warning'
    default: return 'default'
  }
}

const getStatusBadgeText = (status: string) => {
  switch (status) {
    case 'email_failed': return 'Email Failed'
    default: return status.charAt(0).toUpperCase() + status.slice(1)
  }
}
  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <Heading level="h1" className="mb-2">
          Welcome to your coaching workspace, {firstName}!
        </Heading>
        <Text color="muted">
          Manage your athletes, training plans, and coaching activities from here.
        </Text>
        
        {/* JWT Debug Info */}
        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
            🔧 Debug Information
          </summary>
          <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono">
            <pre>{JSON.stringify({
              urlSlug: slug,
              workspaceSlug,
              firstName,
              lastName,
              isCoach,
              role,
              hasUser: !!user,
              hasCoachProfile: !!coachProfile
            }, null, 2)}</pre>
          </div>
        </details>
      </div>

      {/* Quick Stats - BEFORE: 4 repeated bg-white p-6 rounded-lg shadow divs */}
      {/* Quick Stats - AFTER: Clean StatCard components */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          icon="👥"
          label="Total Athletes"
          value={stats.total_athletes}
          color="blue"
          variant="dashboard"
        />

        <StatCard
          icon="⚡"
          label="Active Athletes"
          value={stats.active_athletes}
          color="cirfpro-green"
          variant="dashboard"
        />

        <StatCard
          icon="📧"
          label="Pending Invites"
          value={stats.pending_invitations}
          color="yellow"
          variant="dashboard"
        />

        <StatCard
          icon="🏃"
          label="This Week"
          value={stats.this_week_sessions}
          color="purple"
          variant="dashboard"
        />
      </div>

      {/* Action Buttons - BEFORE: bg-white rounded-lg shadow p-6 */}
      {/* Action Buttons - AFTER: Clean Card component */}
        <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="bg-cirfpro-green-600 text-white px-4 py-2 rounded-lg hover:bg-cirfpro-green-700 transition-colors font-medium flex items-center gap-2"
            >
              📧 Invite Athlete
            </button>
            <Link
              href={`/coach/${slug}/athletes`}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              👥 Manage Athletes
            </Link>
            <Link
              href={`/coach/${slug}/plans`}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              📋 Training Plans
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Athletes Section - BEFORE: bg-white rounded-lg shadow */}
      {/* Athletes Section - AFTER: Clean Card component */}
      <Card>
        <CardHeader>
          <button
            onClick={() => setAthletesSectionOpen(!athletesSectionOpen)}
            className="flex items-center justify-between w-full text-left"
          >
            <CardTitle>Your Athletes ({athletes.length})</CardTitle>
            {athletesSectionOpen ? (
              <span className="text-cirfpro-gray-500">▲</span>
            ) : (
              <span className="text-cirfpro-gray-500">▼</span>
            )}
          </button>
        </CardHeader>
        
        {athletesSectionOpen && (
          <CardContent>
            {athletes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-cirfpro-gray-500 mb-4">No athletes yet</p>
                <button
                  onClick={() => setIsInviteModalOpen(true)}
                  className="bg-cirfpro-green-600 text-white px-4 py-2 rounded-lg hover:bg-cirfpro-green-700 transition-colors"
                >
                  Send Your First Invitation
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {athletes.map((athlete) => (
                  <div
                    key={athlete.id}
                    className="flex items-center justify-between p-4 bg-cirfpro-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-cirfpro-gray-900">
                        {athlete.first_name} {athlete.last_name}
                      </p>
                      <p className="text-sm text-cirfpro-gray-600">{athlete.email}</p>
                      <p className="text-xs text-cirfpro-gray-500 capitalize">
                        {athlete.experience_level} level
                        {athlete.goal_race_distance && ` • Goal: ${athlete.goal_race_distance}`}
                      </p>
                    </div>
                    <Link
                      href={`/coach/${slug}/athletes/${athlete.id}`}
                      className="text-cirfpro-green-600 hover:text-cirfpro-green-700 font-medium"
                    >
                      View Profile →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Recent Invitations Section - BEFORE: bg-white rounded-lg shadow */}
      {/* Recent Invitations Section - AFTER: Clean Card component */}
      <Card>
        <CardHeader>
          <button
            onClick={() => setInvitationsSectionOpen(!invitationsSectionOpen)}
            className="flex items-center justify-between w-full text-left"
          >
            <CardTitle>Recent Invitations ({recentInvitations.length})</CardTitle>
            {invitationsSectionOpen ? (
              <span className="text-cirfpro-gray-500">▲</span>
            ) : (
              <span className="text-cirfpro-gray-500">▼</span>
            )}
          </button>
        </CardHeader>
        
        {invitationsSectionOpen && (
          <CardContent>
            {recentInvitations.length === 0 ? (
              <p className="text-cirfpro-gray-500 text-center py-4">No invitations sent yet</p>
            ) : (
              <div className="space-y-3">
                {recentInvitations.map((invitation) => (
                  <div key={invitation.id} className="flex items-center justify-between p-3 border border-cirfpro-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-cirfpro-gray-900">{invitation.email}</p>
                      <p className="text-sm text-cirfpro-gray-600">
                        Sent: {formatDate(invitation.sent_at)}
                      </p>
                    </div>
                    <Badge variant={getStatusBadgeVariant(invitation.status)} size="sm">
                    {getStatusBadgeText(invitation.status)}
                  </Badge>
                  </div>
                ))}
              </div>
            )}
            
            {recentInvitations.length > 0 && (
              <div className="mt-4 text-center">
                <Link
                  href={`/coach/${slug}/invitations`}
                  className="text-cirfpro-green-600 hover:text-cirfpro-green-700 text-sm font-medium"
                >
                  View All Invitations →
                </Link>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Invitation Modal */}
      {isInviteModalOpen && (
        <InvitationModal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          onSuccess={() => {
            setIsInviteModalOpen(false)
            fetchDashboardData() // Refresh data
          }}
        />
      )}
    </div>
  )
}