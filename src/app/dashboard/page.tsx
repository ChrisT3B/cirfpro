// src/app/dashboard/page.tsx - FIXED VERSION
'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function DashboardPage() {
  const { 
    user, 
    loading, 
    roleProfileLoading,  // ← NEW: Wait for this too
    isCoach, 
    isAthlete, 
    workspaceSlug, 
    coachProfile,
    firstName, 
    role,
    signOut 
  } = useAuth()
  
  const router = useRouter()
  const [redirectAttempted, setRedirectAttempted] = useState(false)

  useEffect(() => {
    // Wait for BOTH authentication AND role profile to complete
    if (loading || roleProfileLoading) {
      console.log('⏳ Dashboard waiting...', { 
        authLoading: loading, 
        roleProfileLoading,
        isCoach,
        workspaceSlug 
      })
      return
    }

    // Redirect to login if not authenticated
    if (!user) {
      console.log('🔀 No user, redirecting to signin')
      router.push('/auth/signin')
      return
    }

    // Prevent multiple redirect attempts
    if (redirectAttempted) {
      console.log('⏭️ Redirect already attempted, skipping')
      return
    }

    console.log('🎯 Dashboard redirect logic:', {
      isCoach,
      isAthlete,
      workspaceSlug,
      coachProfileExists: !!coachProfile,
      role
    })

    // COACH: Redirect to workspace
    if (isCoach) {
      if (workspaceSlug) {
        console.log(`✅ Redirecting coach to: /coach/${workspaceSlug}/dashboard`)
        setRedirectAttempted(true)
        router.push(`/coach/${workspaceSlug}/dashboard`)
        return
      } else {
        console.log('⚠️ Coach detected but no workspace_slug available')
        console.log('coachProfile:', coachProfile)
        // Show error state below
      }
    } 
    
    // ATHLETE: Redirect to athlete dashboard
    else if (isAthlete) {
      console.log('✅ Redirecting athlete to: /athlete/dashboard')
      setRedirectAttempted(true)
      router.push('/athlete/dashboard')
      return
    } 
    
    // NO ROLE: Show error state
    else if (role === null) {
      console.log('⚠️ User has no role assigned')
      // Will show error UI below
    }
  }, [
    loading, 
    roleProfileLoading, 
    user, 
    isCoach, 
    isAthlete, 
    workspaceSlug, 
    coachProfile,
    role, 
    router, 
    redirectAttempted
  ])

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

  // Show loading while role-specific profile is loading
  if (roleProfileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your profile...</p>
          {isCoach && <p className="mt-2 text-sm text-gray-500">Fetching workspace details...</p>}
        </div>
      </div>
    )
  }

  // If we reach here, something is wrong - show debug info
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {isCoach && !workspaceSlug ? 'Workspace Not Found' : 'Account Setup Incomplete'}
        </h2>
        <p className="text-gray-600 mb-6">
          {isCoach && !workspaceSlug 
            ? 'Your coach profile is missing a workspace. Please contact support.'
            : 'Your account doesn\'t have a role assigned yet. Please contact support or complete your profile setup.'
          }
        </p>
        <div className="space-y-3">
          <div className="text-left text-sm text-gray-500 font-mono bg-gray-100 p-3 rounded">
            <div><strong>User ID:</strong> {user?.id}</div>
            <div><strong>Email:</strong> {user?.email}</div>
            <div><strong>Role:</strong> {role || 'none'}</div>
            <div><strong>Is Coach:</strong> {String(isCoach)}</div>
            <div><strong>Is Athlete:</strong> {String(isAthlete)}</div>
            <div><strong>Workspace Slug:</strong> {workspaceSlug || 'none'}</div>
            <div><strong>First Name:</strong> {firstName || 'none'}</div>
            <div><strong>Coach Profile:</strong> {coachProfile ? 'exists' : 'missing'}</div>
            {coachProfile && (
              <div className="mt-2 pt-2 border-t border-gray-300">
                <div><strong>Profile Workspace:</strong> {coachProfile.workspace_slug || 'none'}</div>
                <div><strong>Profile Name:</strong> {coachProfile.workspace_name || 'none'}</div>
              </div>
            )}
          </div>
          <button
            onClick={() => signOut()}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Sign Out and Try Again
          </button>
        </div>
      </div>
    </div>
  )
}