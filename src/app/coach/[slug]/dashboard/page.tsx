// src/app/coach/[slug]/dashboard/page.tsx - OPTIMIZED (NO RE-RENDERS)
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
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
import ProfileCompletionBar from '@/components/ProfileCompletionBar'

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
  // Track render count for debugging
  // NOTE: In development, React Strict Mode causes double-renders
  // This is intentional and will not happen in production builds
  const renderCount = useRef(0)
  renderCount.current++
  
  // Only log every other render (to account for Strict Mode double-render)
  if (renderCount.current % 2 === 1) {
    console.log(`🏗️ Coach Dashboard render #${Math.ceil(renderCount.current / 2)}`)
  }
  
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

  // Component state
  const [loading, setLoading] = useState(false)
  const [unauthorized, setUnauthorized] = useState(false)
  const [stats, setStats] = useState<DashboardStats>({
    total_athletes: 0,
    active_athletes: 0,
    pending_invitations: 0,
    this_week_sessions: 0
  })
  const [athletes, setAthletes] = useState<Athlete[]>([])
  const [recentInvitations, setRecentInvitations] = useState<InvitationWithExpiry[]>([])
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [athletesSectionOpen, setAthletesSectionOpen] = useState(true)
  const [invitationsSectionOpen, setInvitationsSectionOpen] = useState(true)
  
  // Track if data has been fetched to prevent duplicate fetches
  const dataFetched = useRef(false)
  const authCheckComplete = useRef(false)

  // ================================================================
  // MEMOIZED FUNCTION: Fetch Dashboard Data
  // ================================================================
  const fetchDashboardData = useCallback(async () => {
    // Prevent duplicate fetches
    if (dataFetched.current || !user || !isCoach) {
      console.log('⏭️ Skipping data fetch (already fetched or not ready)')
      return
    }

    dataFetched.current = true
    setLoading(true)
    
    try {
      console.log('📊 Fetching dashboard data...')
      const supabase = createClient()

      // Fetch athletes
      const { data: athleteData, error: athleteError } = await supabase
        .from('athlete_profiles')
        .select(`
          id,
          user_id,
          coach_id,
          experience_level,
          goal_race_distance,
          created_at,
          users!athlete_profiles_user_id_fkey (
            first_name,
            last_name,
            email
          )
        `)
        .eq('coach_id', user.id)
        .order('created_at', { ascending: false })

      // Format athletes data
      let formattedAthletes: Athlete[] = []
      if (athleteError) {
        console.error('Error fetching athletes:', athleteError)
      } else {
        formattedAthletes = (athleteData as AthleteWithUser[])?.map((athlete) => ({
          id: athlete.id,
          first_name: athlete.users?.first_name || '',
          last_name: athlete.users?.last_name || '',
          email: athlete.users?.email || '',
          experience_level: athlete.experience_level || 'beginner',
          goal_race_distance: athlete.goal_race_distance,
          created_at: athlete.created_at
        })) || []
        console.log(`✅ Loaded ${formattedAthletes.length} athletes`)
      }

      // Fetch recent invitations
      const { data: invitationData, error: invitationError } = await supabase
        .from('coach_invitations_with_expiry')
        .select('*')
        .eq('coach_id', user.id)
        .order('sent_at', { ascending: false })
        .limit(5)

      // Format invitations data
      let invitations: InvitationWithExpiry[] = []
      if (invitationError) {
        console.error('Error fetching invitations:', invitationError)
      } else {
        invitations = (invitationData as InvitationWithExpiry[]) || []
        console.log(`✅ Loaded ${invitations.length} invitations`)
      }

      // Calculate stats
      const totalAthletes = athleteData?.length || 0
      const activeAthletes = totalAthletes
      const pendingInvitations = invitationData?.filter((inv: InvitationWithExpiry) => inv.status === 'pending').length || 0

      const newStats = {
        total_athletes: totalAthletes,
        active_athletes: activeAthletes,
        pending_invitations: pendingInvitations,
        this_week_sessions: 0
      }

      // ✅ BATCH ALL STATE UPDATES INTO ONE - This causes only 1 re-render instead of 3
      console.log('📦 Batching all state updates...')
      setAthletes(formattedAthletes)
      setRecentInvitations(invitations)
      setStats(newStats)
      
      console.log('✅ Dashboard data loaded successfully')
      
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }, [user, isCoach]) // ONLY depends on stable values

  // ================================================================
  // EFFECT 1: JWT-FIRST AUTHORIZATION CHECK (runs once per auth change)
  // ================================================================
  useEffect(() => {
    // Skip if already completed
    if (authCheckComplete.current) {
      console.log('⏭️ Auth check already complete, skipping')
      return
    }

    console.log('🔒 Running authorization check...', {
      authLoading,
      user: !!user,
      isCoach,
      workspaceSlug,
      urlSlug: slug
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
      authCheckComplete.current = true
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
      authCheckComplete.current = true
      setLoading(false)
    } else if (!workspaceSlug) {
      console.log('⏳ Waiting for workspaceSlug to load...')
      // Will re-run when workspaceSlug is set
      return
    }

    // NOTE: We do NOT include router in dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user, isCoach, workspaceSlug, slug])

  // ================================================================
  // EFFECT 2: Load Dashboard Data (runs once after authorization)
  // ================================================================
  useEffect(() => {
    if (authCheckComplete.current && !dataFetched.current && user && isCoach && workspaceSlug === slug) {
      console.log('🚀 Authorization complete, loading dashboard data')
      fetchDashboardData()
    }
  }, [authCheckComplete.current, user, isCoach, workspaceSlug, slug, fetchDashboardData])

  // ================================================================
  // LOADING & ERROR STATES
  // ================================================================

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

  // ================================================================
  // HELPER FUNCTIONS
  // ================================================================

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    } catch (error) {
      return 'Invalid date'
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

  // ================================================================
  // RENDER
  // ================================================================

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
              renderCount: renderCount.current,
              urlSlug: slug,
              workspaceSlug,
              firstName,
              lastName,
              isCoach,
              role,
              hasUser: !!user,
              hasCoachProfile: !!coachProfile,
              authCheckComplete: authCheckComplete.current,
              dataFetched: dataFetched.current
            }, null, 2)}</pre>
          </div>
        </details>
      </div>

      {/* Quick Stats */}
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

      {/* Action Buttons */}
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

      {/* Athletes Section */}
      <Card>
        <CardHeader>
          <button
            onClick={() => setAthletesSectionOpen(!athletesSectionOpen)}
            className="flex items-center justify-between w-full text-left"
          >
            <CardTitle>Your Athletes ({athletes.length})</CardTitle>
            {athletesSectionOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </CardHeader>
        {athletesSectionOpen && (
          <CardContent>
            {athletes.length === 0 ? (
              <div className="text-center py-8">
                <Text color="muted">No athletes yet. Invite athletes to get started!</Text>
              </div>
            ) : (
              <div className="space-y-3">
                {athletes.map((athlete) => (
                  <div
                    key={athlete.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <Text className="font-medium">
                        {athlete.first_name} {athlete.last_name}
                      </Text>
                      <Caption color="muted">{athlete.email}</Caption>
                    </div>
                    <div className="text-right">
                      <Badge variant="info" className="mb-1">
                        {athlete.experience_level}
                      </Badge>
                      {athlete.goal_race_distance && (
                        <Caption color="muted">Goal: {athlete.goal_race_distance}</Caption>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Recent Invitations */}
      <Card>
        <CardHeader>
          <button
            onClick={() => setInvitationsSectionOpen(!invitationsSectionOpen)}
            className="flex items-center justify-between w-full text-left"
          >
            <CardTitle>Recent Invitations ({recentInvitations.length})</CardTitle>
            {invitationsSectionOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </CardHeader>
        {invitationsSectionOpen && (
          <CardContent>
            {recentInvitations.length === 0 ? (
              <div className="text-center py-8">
                <Text color="muted">No invitations sent yet.</Text>
              </div>
            ) : (
              <div className="space-y-3">
                {recentInvitations.map((invitation) => (
                  <div
                    key={invitation.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex-1">
                      <Text className="font-medium">{invitation.email}</Text>
                      <Caption color="muted">
                        Sent {formatDate(invitation.sent_at || '')}
                      </Caption>
                    </div>
                    <Badge variant={getStatusBadgeVariant(invitation.status || 'default')}>
                      {getStatusBadgeText(invitation.status || 'unknown')}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4">
              <Link
                href={`/coach/${slug}/invitations`}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View all invitations →
              </Link>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Invitation Modal */}
      <InvitationModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSuccess={() => {
          setIsInviteModalOpen(false)
          // Reset data fetched flag to allow refetch
          dataFetched.current = false
          fetchDashboardData()
        }}
      />
    </div>
  )
}