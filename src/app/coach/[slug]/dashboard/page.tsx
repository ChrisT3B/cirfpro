// src/app/coach/[slug]/dashboard/page.tsx - Fixed version
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
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
  const params = useParams()
  const router = useRouter()
  const { user, coachProfile, loading: authLoading } = useAuth()
  const slug = params.slug as string

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

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const supabase = createClientComponentClient()

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
        .eq('coach_id', user?.id)

      if (athleteError) {
        console.error('Error fetching athletes:', athleteError)
      } else {
        const transformedAthletes: Athlete[] = athleteData?.map(athlete => ({
          id: athlete.id,
          first_name: (athlete.users as { first_name?: string }).first_name || '',
          last_name: (athlete.users as { last_name?: string }).last_name || '',
          email: (athlete.users as { email?: string }).email || '',
          experience_level: athlete.experience_level,
          goal_race_distance: athlete.goal_race_distance,
          created_at: athlete.created_at
        })) || []
        
        setAthletes(transformedAthletes)

        // Fetch invitation stats from API
        const invitationResponse = await fetch('/api/invitations?limit=5')
        const invitationData = await invitationResponse.json()
        
        if (invitationData.success) {
          const pendingCount = invitationData.data.stats.pending || 0
          const recentInvites = invitationData.data.invitations.slice(0, 5)
          
          setRecentInvitations(recentInvites)
          
          // Calculate stats with real invitation data
          setStats({
            total_athletes: transformedAthletes.length,
            active_athletes: transformedAthletes.length,
            pending_invitations: pendingCount,
            this_week_sessions: 0
          })
        }
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleInvitationSuccess = () => {
    fetchDashboardData()
  }

  useEffect(() => {
    if (!authLoading && coachProfile && coachProfile.workspace_slug !== slug) {
      setUnauthorized(true)
      setLoading(false)
      return
    }

    if (!authLoading && !unauthorized && coachProfile && user) {
      fetchDashboardData()
    }
  }, [coachProfile, authLoading, unauthorized, slug, user])

  if (authLoading || loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (unauthorized) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-4">
          You don&apos;t have permission to view this coach&apos;s workspace.
        </p>
        <button
          onClick={() => router.push('/dashboard')}
          className="text-blue-600 hover:text-blue-800 underline"
        >
          Go to your dashboard
        </button>
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
          Welcome to your coaching workspace
        </h1>
        <p className="text-gray-600">
          Manage your athletes, training plans, and coaching activities from here.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600">Total Athletes</div>
          <div className="mt-2 text-3xl font-bold text-gray-900">{stats.total_athletes}</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600">Active Athletes</div>
          <div className="mt-2 text-3xl font-bold text-gray-900">{stats.active_athletes}</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600">Pending Invitations</div>
          <div className="mt-2 text-3xl font-bold text-blue-600">{stats.pending_invitations}</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-600">This Week&apos;s Sessions</div>
          <div className="mt-2 text-3xl font-bold text-gray-900">{stats.this_week_sessions}</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4">
        <button 
          onClick={() => setIsInviteModalOpen(true)}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          Invite Athlete
        </button>
        <Link 
          href={`/coach/${slug}/invitations`}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Manage Invitations
        </Link>
      </div>

      {/* Athletes List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors"
             onClick={() => setAthletesSectionOpen(!athletesSectionOpen)}>
          <h2 className="text-lg font-semibold text-gray-900">Your Athletes</h2>
          <button className="text-gray-500 hover:text-gray-700">
            {athletesSectionOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
        
        {athletesSectionOpen && (
          <>
            {athletes.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="text-gray-500 mb-4">
                  You haven&apos;t added any athletes yet. Start by inviting your first athlete!
                </p>
                <button 
                  onClick={() => setIsInviteModalOpen(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  Invite Your First Athlete
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Athlete
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Experience
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Goal Distance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {athletes.map((athlete: Athlete, index: number) => (
                      <tr key={athlete.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                <span className="text-sm font-medium text-green-600">
                                  {athlete.first_name?.[0]}{athlete.last_name?.[0]}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {athlete.first_name} {athlete.last_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {athlete.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                            {athlete.experience_level}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {athlete.goal_race_distance || 'Not specified'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(athlete.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* Recent Invitations Widget */}
      {recentInvitations.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors"
               onClick={() => setInvitationsSectionOpen(!invitationsSectionOpen)}>
            <h2 className="text-lg font-semibold text-gray-900">Recent Invitations</h2>
            <div className="flex items-center gap-3">
              <Link 
                href={`/coach/${slug}/invitations`}
                className="text-sm text-blue-600 hover:text-blue-800"
                onClick={(e) => e.stopPropagation()}
              >
                View all →
              </Link>
              <button className="text-gray-500 hover:text-gray-700">
                {invitationsSectionOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            </div>
          </div>
          {invitationsSectionOpen && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sent</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expires</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentInvitations.map((invitation) => (
                    <tr key={invitation.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {invitation.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invitation.status)}`}>
                          {invitation.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(invitation.sent_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {invitation.days_until_expiry > 0 
                          ? `${invitation.days_until_expiry} days` 
                          : 'Expired'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Invitation Modal */}
      <InvitationModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSuccess={handleInvitationSuccess}
      />
    </div>
  )
}