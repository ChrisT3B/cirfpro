// src/app/coach/[slug]/dashboard/page.tsx - JWT-FIRST ARCHITECTURE
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase'
import InvitationModal from '@/components/InvitationModal'
import { ChevronDown, ChevronUp } from 'lucide-react'

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

interface Invitation {
  id: string
  email: string
  status: string
  sent_at: string
  expires_at: string
  days_until_expiry: number
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
  const [recentInvitations, setRecentInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [unauthorized, setUnauthorized] = useState(false)
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [athletesSectionOpen, setAthletesSectionOpen] = useState(true)
  const [invitationsSectionOpen, setInvitationsSectionOpen] = useState(true)

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

  const fetchDashboardData = async () => {
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
        const transformedAthletes: Athlete[] = (athleteData as any)?.map((athlete: any) => ({
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

      // Fetch invitations
      const { data: invitationData, error: invitationError } = await supabase
        .from('invitations')
        .select('*')
        .eq('coach_id', user.id)
        .order('sent_at', { ascending: false })
        .limit(5)

      if (invitationError) {
        console.error('Error fetching invitations:', invitationError)
      } else {
        const invitations = (invitationData as any) || []
        setRecentInvitations(invitations)
        console.log(`✅ Loaded ${invitations.length} invitations`)
      }

      // Calculate stats
      const totalAthletes = athleteData?.length || 0
      const activeAthletes = totalAthletes // Simplified for now
      const pendingInvitations = invitationData?.filter((inv: any) => inv.status === 'pending').length || 0

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
  }

  // Load dashboard data when authorization is complete
  useEffect(() => {
    if (!authLoading && user && isCoach && workspaceSlug === slug) {
      console.log('🚀 Authorization complete, loading dashboard data')
      fetchDashboardData()
    }
  }, [authLoading, user, isCoach, workspaceSlug, slug])

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
          <p className="text-gray-600 mb-4">You don't have permission to access this workspace.</p>
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

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome to your coaching workspace, {firstName}!
        </h1>
        <p className="text-gray-600">
          Manage your athletes, training plans, and coaching activities from here.
        </p>
        
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

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-blue-600 text-xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Athletes</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.total_athletes}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-green-600 text-xl">⚡</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Athletes</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.active_athletes}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-yellow-600 text-xl">📧</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Invites</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.pending_invitations}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-purple-600 text-xl">🏃</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">This Week</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.this_week_sessions}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
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
      </div>

      {/* Athletes Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <button
            onClick={() => setAthletesSectionOpen(!athletesSectionOpen)}
            className="flex items-center justify-between w-full text-left"
          >
            <h2 className="text-lg font-semibold text-gray-900">
              Your Athletes ({athletes.length})
            </h2>
            {athletesSectionOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
        </div>
        
        {athletesSectionOpen && (
          <div className="p-6">
            {athletes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No athletes yet</p>
                <button
                  onClick={() => setIsInviteModalOpen(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Invite Your First Athlete
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {athletes.map((athlete) => (
                  <div key={athlete.id} className="border rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900">
                      {athlete.first_name} {athlete.last_name}
                    </h3>
                    <p className="text-sm text-gray-600">{athlete.email}</p>
                    <p className="text-sm text-gray-500 capitalize">
                      {athlete.experience_level} runner
                    </p>
                    {athlete.goal_race_distance && (
                      <p className="text-sm text-green-600">
                        Goal: {athlete.goal_race_distance}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      Joined: {formatDate(athlete.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recent Invitations Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <button
            onClick={() => setInvitationsSectionOpen(!invitationsSectionOpen)}
            className="flex items-center justify-between w-full text-left"
          >
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Invitations ({recentInvitations.length})
            </h2>
            {invitationsSectionOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
        </div>
        
        {invitationsSectionOpen && (
          <div className="p-6">
            {recentInvitations.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No invitations sent yet</p>
            ) : (
              <div className="space-y-3">
                {recentInvitations.map((invitation) => (
                  <div key={invitation.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{invitation.email}</p>
                      <p className="text-sm text-gray-600">
                        Sent: {formatDate(invitation.sent_at)}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invitation.status)}`}>
                      {invitation.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
            
            {recentInvitations.length > 0 && (
              <div className="mt-4 text-center">
                <Link
                  href={`/coach/${slug}/invitations`}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  View All Invitations →
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

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