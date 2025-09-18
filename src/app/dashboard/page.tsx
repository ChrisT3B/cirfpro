// src/app/dashboard/page.tsx
'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardPage() {
  const { user, profile, coachProfile, athleteProfile, loading, signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin')
    }
  }, [user, loading, router])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!user || !profile) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">CIRFPRO Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span>Welcome, {profile.first_name || 'User'}</span>
              <button
                onClick={signOut}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                {profile.role === 'coach' ? 'Coach Dashboard' : 'Athlete Dashboard'}
              </h2>
              
              {profile.role === 'coach' && coachProfile && (
                <div>
                  <p>Subscription: {coachProfile.subscription_tier}</p>
                  <p>Athlete Limit: {coachProfile.athlete_limit}</p>
                </div>
              )}
              
              {profile.role === 'athlete' && athleteProfile && (
                <div>
                  <p>Experience Level: {athleteProfile.experience_level}</p>
                  {athleteProfile.goal_race_distance && (
                    <p>Goal Race: {athleteProfile.goal_race_distance}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}