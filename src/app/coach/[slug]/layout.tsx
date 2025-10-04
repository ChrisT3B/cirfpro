// src/app/coach/[slug]/layout.tsx - JWT-FIRST ARCHITECTURE
'use client'

import { createClient } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useParams, usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Database } from '@/types/database.types'

// Type for coach data from public_coach_directory view
type PublicCoachData = Database['public']['Views']['public_coach_directory']['Row']

interface CoachData {
  id: string | null
  workspace_slug: string | null
  workspace_name: string | null
  first_name: string | null
  last_name: string | null
  email: string | null
  profile_photo_url: string | null
  coaching_philosophy: string | null
  years_experience: number | null
  coaching_location: string | null
  price_range: string | null
  availability_status: string | null
  qualifications: string[] | null
  specializations: string[] | null
  created_at: string | null
}

interface CoachLayoutProps {
  children: React.ReactNode
}

export default function CoachLayout({ children }: CoachLayoutProps) {
  const { 
    user, 
    loading: authLoading,
    // INSTANT JWT DATA
    isCoach,
    workspaceSlug,
    firstName,
    lastName,
    role 
  } = useAuth()
  
  const params = useParams()
  const pathname = usePathname()
  const slug = params.slug as string
  
  const [coachData, setCoachData] = useState<CoachData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  console.log('🏗️ Coach Layout loading - JWT-FIRST', {
    authLoading,
    user: !!user,
    isCoach,
    workspaceSlug,
    urlSlug: slug,
    firstName,
    lastName,
    role
  })

  // JWT-FIRST OWNERSHIP CHECK (instant, no database required for basic auth)
  const isOwner = user && isCoach && workspaceSlug === slug
  
  console.log('🔒 Layout ownership check:', {
    isOwner,
    userEmail: user?.email,
    isCoach,
    workspaceSlug,
    urlSlug: slug,
    'workspaceSlug === slug': workspaceSlug === slug
  })

  useEffect(() => {
    async function fetchCoachData() {
      try {
        console.log('📊 Fetching coach display data for layout...')
        const supabase = createClient()
        
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Database query timeout')), 10000) // 10 second timeout
        })

        const queryPromise = supabase
          .from('public_coach_directory')
          .select('*')
          .eq('workspace_slug', slug)
          .single()

        console.log('🔍 Executing database query with timeout...')
        const { data, error } = await Promise.race([queryPromise, timeoutPromise])

        console.log('📋 Database query completed:', { data, error, hasData: !!data })

        if (error) {
          console.error('❌ Error fetching coach data:', error)
          console.error('Error details:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          })
          
          if (error.code === 'PGRST116') {
            setError('Coach not found')
          } else {
            setError('Failed to load coach profile')
          }
          return
        }

        console.log('✅ Coach display data loaded successfully:', {
          workspace_slug: data?.workspace_slug,
          first_name: data?.first_name,
          last_name: data?.last_name,
          email: data?.email
        })
        setCoachData(data)
        
      } catch (err) {
        console.error('❌ Exception in fetchCoachData:', err)
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        if (errorMessage === 'Database query timeout') {
          setError('Database query timed out - please try again')
        } else {
          setError('Failed to load coach profile')
        }
      } finally {
        console.log('🏁 Setting loading to false')
        setLoading(false)
      }
    }

    if (slug && !authLoading) {
      console.log('🚀 Starting fetchCoachData for slug:', slug)
      fetchCoachData()
    }
  }, [slug, authLoading])

  // Show loading while auth is being initialized
  if (authLoading) {
    console.log('⏳ Layout showing auth loading')
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading authentication...</div>
      </div>
    )
  }

  // Show loading while fetching coach display data (only for a short time)
  if (loading) {
    console.log('⏳ Layout showing coach data loading')
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading coach workspace...</div>
      </div>
    )
  }

  // If database query failed but we have JWT data, continue with fallback
  if ((error || !coachData) && !(firstName && lastName)) {
    console.log('❌ Layout showing error (no JWT fallback):', error)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Coach Not Found</h1>
          <p className="text-gray-600 mb-4">{error || 'This coach profile does not exist.'}</p>
          <Link 
            href="/coach/directory" 
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Browse all coaches
          </Link>
        </div>
      </div>
    )
  }

  // If we reach here, either we have coachData OR we have JWT fallback data
  console.log('🎯 Layout proceeding with available data:', {
    hasCoachData: !!coachData,
    hasJWTFallback: !!(firstName && lastName),
    error: error
  })

  // Use JWT data for display when database times out
  const displayName = coachData?.workspace_name || 
                     (firstName && lastName ? `${firstName} ${lastName}` : 'Coach')

  console.log('✅ Layout ready to render with data:', {
    displayName,
    isOwner,
    hasCoachData: !!coachData,
    usingJWTFallback: !coachData && firstName && lastName
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Coach Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Coach Identity - Use JWT data when database fails */}
            <div className="flex items-center space-x-4">
              {/* Only show profile photo if we have database data */}
              {coachData?.profile_photo_url && (
                <Image
                  src={coachData.profile_photo_url}
                  alt={displayName}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full object-cover"
                />
              )}
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {displayName}
                </h1>
                <p className="text-sm text-gray-500">Running Coach</p>
                {/* Show fallback indicator if using JWT data */}
                {!coachData && firstName && (
                  <p className="text-xs text-blue-600">Using cached profile</p>
                )}
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex space-x-6">
              {/* Public Navigation */}
              <Link
                href={`/coach/${slug}/profile`}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  pathname.includes('/profile')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Profile
              </Link>

              {/* Private Navigation (only for coach owner) - JWT-based check */}
              {isOwner && (
                <>
                  <Link
                    href={`/coach/${slug}/dashboard`}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      pathname.includes('/dashboard')
                        ? 'bg-green-100 text-green-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    Dashboard
                  </Link>
                
                  <Link
                    href={`/coach/${slug}/athletes`}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      pathname.includes('/athletes')
                        ? 'bg-green-100 text-green-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    Athletes
                  </Link>

                  <Link
                    href={`/coach/${slug}/plans`}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      pathname.includes('/plans')
                        ? 'bg-green-100 text-green-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    Plans
                  </Link>

                  <Link
                    href={`/coach/${slug}/settings`}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      pathname.includes('/settings')
                        ? 'bg-green-100 text-green-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    Settings
                  </Link>
                </>
              )}

              {/* Auth state display */}
              <div className="flex items-center space-x-3">
                {user ? (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      {firstName || user.email}
                    </span>
                    {isOwner && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                        Owner
                      </span>
                    )}
                  </div>
                ) : (
                  <Link
                    href="/auth/signin"
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {children}
        </div>
      </main>

      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-0 right-0 p-4 bg-black bg-opacity-75 text-white text-xs max-w-sm">
          <details>
            <summary className="cursor-pointer">🔧 Layout Debug</summary>
            <div className="mt-2 space-y-1">
              <div>URL Slug: {slug}</div>
              <div>User: {user?.email || 'None'}</div>
              <div>Is Coach: {isCoach ? 'Yes' : 'No'}</div>
              <div>Workspace Slug: {workspaceSlug || 'None'}</div>
              <div>Is Owner: {isOwner ? 'Yes' : 'No'}</div>
              <div>Coach Data: {coachData ? 'Loaded' : 'None'}</div>
            </div>
          </details>
        </div>
      )}
    </div>
  )
}