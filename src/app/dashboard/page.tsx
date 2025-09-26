// src/app/dashboard/page.tsx - JWT-FIRST AUTHORIZATION
'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function DashboardPage() {
  console.log('🏗️ Dashboard component is loading/mounting')
  
  const authContextValues = useAuth()
  console.log('🔗 Auth context values received:', {
    hasUser: !!authContextValues.user,
    loading: authContextValues.loading,
    role: authContextValues.role,
    isCoach: authContextValues.isCoach,
    isAthlete: authContextValues.isAthlete,
    workspaceSlug: authContextValues.workspaceSlug,
    firstName: authContextValues.firstName,
    lastName: authContextValues.lastName
  })

  const { 
    user, 
    loading, 
    // INSTANT JWT DATA (available immediately)
    isCoach, 
    isAthlete, 
    workspaceSlug, 
    firstName, 
    lastName, 
    role,
    // DETAILED PROFILE DATA (loaded in background)
    profile, 
    coachProfile, 
    athleteProfile, 
    profilesLoading,
    signOut 
  } = authContextValues
  
  const router = useRouter()
  const [dashboardReady, setDashboardReady] = useState(false)

  console.log('🎯 Dashboard state after destructuring:', {
    user: !!user,
    loading,
    role,
    isCoach,
    isAthlete,
    workspaceSlug,
    firstName,
    lastName
  })

  useEffect(() => {
    console.log('🔍 Dashboard effect running...', {
      loading,
      user: !!user,
      role,
      isCoach,
      isAthlete,
      workspaceSlug,
      'workspaceSlug length': workspaceSlug?.length,
      'workspaceSlug value': `"${workspaceSlug}"`
    })

    // Wait for authentication to complete
    if (loading) {
      console.log('⏳ Still loading authentication...')
      return
    }

    // Redirect to login if not authenticated
    if (!user) {
      console.log('🚫 No user found, redirecting to signin')
      router.push('/auth/signin')
      return
    }

    // INSTANT JWT-BASED AUTHORIZATION (no database calls required)
    if (isCoach) {
      console.log('👨‍💼 Coach detected, checking workspace...', {
        workspaceSlug,
        hasWorkspaceSlug: !!workspaceSlug,
        workspaceSlugType: typeof workspaceSlug
      })
      
      if (workspaceSlug) {
        console.log(`✅ Coach has workspace: "${workspaceSlug}", redirecting to /coach/${workspaceSlug}/dashboard`)
        router.push(`/coach/${workspaceSlug}/dashboard`)
        return
      } else {
        console.log('⚠️ Coach workspaceSlug is null/undefined, showing current values:', {
          firstName,
          lastName,
          workspaceSlug,
          role,
          isCoach
        })
        // Continue to show loading while workspace_slug loads from database
        return
      }
    } else if (isAthlete) {
      console.log('🏃‍♂️ Athlete detected, showing athlete dashboard')
      setDashboardReady(true)
    } else if (role === null && !profilesLoading) {
      console.log('❓ No role found in JWT and profiles loaded - potential data issue')
      // Show error or setup flow
      setDashboardReady(true)
    }
  }, [loading, user, isCoach, isAthlete, workspaceSlug, role, profilesLoading, firstName, lastName, router])

  // Show loading spinner while auth is initializing
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading authentication...</p>
        </div>
      </div>
    )
  }

  // Show loading while checking coach workspace (waiting for workspace_slug from database)
  if (isCoach && !workspaceSlug) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your coaching workspace...</p>
          <p className="mt-2 text-sm text-gray-500">Getting workspace information...</p>
        </div>
      </div>
    )
  }

  // If we reach here, user is authenticated but not redirected
  if (!dashboardReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Preparing your dashboard...</p>
        </div>
      </div>
    )
  }

  // ATHLETE DASHBOARD (coaches should have been redirected by now)
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">CIRFPRO Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              {/* Show instant JWT data */}
              <span className="text-gray-700">
                Welcome, {firstName || 'User'}
                {role && (
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                    {role}
                  </span>
                )}
              </span>
              <button
                onClick={signOut}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Athlete Dashboard
              </h2>
              
              {/* Show JWT-based info immediately */}
              <div className="mb-6 p-4 bg-green-50 rounded-lg">
                <h3 className="text-sm font-medium text-green-800 mb-2">
                  ✅ Instant Authentication Data (JWT-based)
                </h3>
                <div className="text-sm text-green-700 space-y-1">
                  <p>Name: {firstName} {lastName}</p>
                  <p>Role: {role}</p>
                  <p>Is Athlete: {isAthlete ? 'Yes' : 'No'}</p>
                  <p>Is Coach: {isCoach ? 'Yes' : 'No'}</p>
                  {workspaceSlug && <p>Workspace: {workspaceSlug}</p>}
                </div>
              </div>

              {/* Show detailed profile data when available */}
              {profilesLoading && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="text-sm font-medium text-blue-800 mb-2">
                    🔄 Loading Detailed Profile Data...
                  </h3>
                  <div className="animate-pulse flex space-x-4">
                    <div className="rounded-full bg-blue-200 h-4 w-4"></div>
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-2 bg-blue-200 rounded w-3/4"></div>
                      <div className="h-2 bg-blue-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              )}

              {athleteProfile && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-800 mb-2">
                    📊 Detailed Athlete Profile
                  </h3>
                  <div className="text-sm text-gray-700 space-y-1">
                    <p>Experience Level: {athleteProfile.experience_level || 'Not set'}</p>
                    {athleteProfile.goal_race_distance && (
                      <p>Goal Race Distance: {athleteProfile.goal_race_distance}</p>
                    )}
                    {athleteProfile.coach_id && (
                      <p>Assigned Coach: Yes</p>
                    )}
                  </div>
                </div>
              )}

              {/* Debug Info */}
              <details className="mt-6">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  🔧 Debug Information
                </summary>
                <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono">
                  <pre>{JSON.stringify({
                    userExists: !!user,
                    role,
                    isCoach,
                    isAthlete,
                    workspaceSlug,
                    firstName,
                    lastName,
                    profileExists: !!profile,
                    coachProfileExists: !!coachProfile,
                    athleteProfileExists: !!athleteProfile,
                    profilesLoading
                  }, null, 2)}</pre>
                </div>
              </details>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}