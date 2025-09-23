// src/app/coach/[slug]/dashboard/page.tsx - MINIMAL FIX
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
//import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import InvitationModal from '@/components/InvitationModal'

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
  // Back to the old way that was working
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
  const [loading, setLoading] = useState(true)
  const [unauthorized, setUnauthorized] = useState(false)
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)

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
        
        // Simple invitation stats fetch - don't overcomplicate it
        const pendingCount = 0

        
        // Calculate stats
        setStats({
          total_athletes: transformedAthletes.length,
          active_athletes: transformedAthletes.length,
          pending_invitations: pendingCount,
          this_week_sessions: 0
        })
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

  // Keep the useEffect simple - like it was before
  useEffect(() => {
    // Check if coach owns this workspace
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
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.196-2.121M9 6a3 3 0 106 0 3 3 0 00-6 0zM17 10a3 3 0 100-6 3 3 0 000 6z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Athletes</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.total_athletes}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Athletes</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.active_athletes}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Invitations</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pending_invitations}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">This Week&apos;s Sessions</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.this_week_sessions}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Athletes List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Your Athletes</h2>
            <button 
              onClick={() => setIsInviteModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Invite Athlete
            </button>
          </div>
        </div>
        
        {athletes.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No athletes yet</h3>
            <p className="mt-1 text-sm text-gray-500 mb-4">
              Get started by inviting your first athlete to join your coaching program.
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
      </div>

      {/* Invitation Modal */}
      <InvitationModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSuccess={handleInvitationSuccess}
      />
    </div>
  )
}