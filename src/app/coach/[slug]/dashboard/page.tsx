// src/app/coach/[slug]/dashboard/page.tsx
'use client'

import { createClient } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface AthleteData {
  id: string
  first_name: string
  last_name: string
  email: string
  experience_level: string | null
  goal_race_distance: string | null
  created_at: string
}

interface DashboardStats {
  total_athletes: number
  active_athletes: number
  pending_invitations: number
  this_week_sessions: number
}

export default function CoachDashboardPage() {
  const params = useParams()
  const router = useRouter()
  const { user, profile, coachProfile, loading: authLoading } = useAuth()
  const slug = params.slug as string
  
  const [athletes, setAthletes] = useState<AthleteData[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    total_athletes: 0,
    active_athletes: 0,
    pending_invitations: 0,
    this_week_sessions: 0
  })
  const [loading, setLoading] = useState(true)
  const [unauthorized, setUnauthorized] = useState(false)

  // Check authorization
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/auth/signin')
        return
      }
      
      if (profile?.role !== 'coach') {
        setUnauthorized(true)
        return
      }

      // Check workspace ownership via database query instead
      if (profile?.role !== 'coach') {
        setUnauthorized(true)
        return
      }

      // We'll verify ownership when fetching coach data from public_coach_directory
    }
  }, [user, profile, authLoading, slug, router])

  useEffect(() => {
    async function fetchDashboardData() {
      if (!coachProfile?.id) return

      try {
        const supabase = createClient()
        
        // First verify this coach owns the workspace slug
        const { data: workspaceCheck } = await supabase
          .from('public_coach_directory')
          .select('id')
          .eq('workspace_slug', slug)
          .eq('id', coachProfile.id)
          .single()

        if (!workspaceCheck) {
          setUnauthorized(true)
          return
        }
        
        // Fetch coach's athletes
        const { data: athletesData, error: athletesError } = await supabase
          .from('athlete_profiles')
          .select(`
            id,
            experience_level,
            goal_race_distance,
            created_at,
            users!inner(
              first_name,
              last_name,
              email
            )
          `)
          .eq('coach_id', coachProfile.id)

        if (athletesError) {
          console.error('Error fetching athletes:', athletesError)
        } else {
          // Transform the data to flatten the user info
          const transformedAthletes = athletesData?.map(athlete => ({
            id: athlete.id,
            first_name: (athlete.users as { first_name?: string }).first_name || '',
            last_name: (athlete.users as { last_name?: string }).last_name || '',
            email: (athlete.users as { email?: string }).email || '',
            experience_level: athlete.experience_level,
            goal_race_distance: athlete.goal_race_distance,
            created_at: athlete.created_at
          })) || []
          
          setAthletes(transformedAthletes)
          
          // Calculate stats
          setStats({
            total_athletes: transformedAthletes.length,
            active_athletes: transformedAthletes.length, // For now, assume all are active
            pending_invitations: 0, // TODO: Implement invitations system
            this_week_sessions: 0 // TODO: Implement sessions tracking
          })
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading && !unauthorized && coachProfile) {
      fetchDashboardData()
    }
  }, [coachProfile, authLoading, unauthorized, slug])

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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Invites</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.pending_invitations}</p>
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
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
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
            <p className="mt-1 text-sm text-gray-500">
              Get started by inviting your first athlete to join your coaching program.
            </p>
            <div className="mt-6">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Invite Your First Athlete
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden">
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
                    Goal Race
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {athletes.map((athlete) => (
                  <tr key={athlete.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {athlete.first_name[0]}{athlete.last_name[0]}
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {athlete.experience_level || 'Not specified'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {athlete.goal_race_distance || 'Not specified'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(athlete.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Create Training Plan</h3>
          <p className="text-sm text-gray-600 mb-4">
            Design a new periodized training plan for your athletes.
          </p>
          <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Create Plan
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Schedule Session</h3>
          <p className="text-sm text-gray-600 mb-4">
            Add a training session or modify existing schedules.
          </p>
          <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors">
            Schedule Session
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Video Analysis</h3>
          <p className="text-sm text-gray-600 mb-4">
            Review and analyze athlete running technique videos.
          </p>
          <button className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors">
            Analyze Video
          </button>
        </div>
      </div>
    </div>
  )
}