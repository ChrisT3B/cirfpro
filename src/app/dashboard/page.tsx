// src/app/dashboard/page.tsx - PRODUCTION VERSION WITH ATHLETE ROUTING
'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function DashboardPage() {
  const { 
    user, 
    loading, 
    isCoach, 
    isAthlete, 
    workspaceSlug, 
    firstName, 
    lastName, 
    role,
    signOut 
  } = useAuth()
  
  const router = useRouter()
  const [dashboardReady, setDashboardReady] = useState(false)

  useEffect(() => {
    // Wait for authentication to complete
    if (loading) {
      return
    }

    // Redirect to login if not authenticated
    if (!user) {
      router.push('/auth/signin')
      return
    }

    // COACH: Redirect to workspace
    if (isCoach) {
      if (workspaceSlug) {
        router.push(`/coach/${workspaceSlug}/dashboard`)
        return
      }
      // Continue loading while workspace_slug loads from database
      return
    } 
    
    // ✨ NEW: ATHLETE - Redirect to athlete dashboard
    else if (isAthlete) {
      router.push('/athlete/dashboard')
      return
    } 
    
    // NO ROLE: Show error or setup flow
    else if (role === null) {
      setDashboardReady(true)
    }
  }, [loading, user, isCoach, isAthlete, workspaceSlug, role, router])

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

  // Show loading while checking coach workspace
  if (isCoach && !workspaceSlug) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your coaching workspace...</p>
        </div>
      </div>
    )
  }

  // If we reach here, user is authenticated but has no role
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

  // Fallback for users with no role (shouldn't happen)
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">CIRFPRO Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                Welcome, {firstName || 'User'}
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

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Account Setup Required
              </h2>
              <p className="text-gray-600">
                Please contact support to complete your account setup.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}