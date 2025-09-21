// src/app/coach/[slug]/layout.tsx
'use client'

import { createClient } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useParams, usePathname } from 'next/navigation'
import Link from 'next/link'

interface CoachData {
  id: string
  workspace_slug: string
  workspace_name: string | null
  first_name: string
  last_name: string
  email: string
  profile_photo_url: string | null
  public_profile_visible: boolean
}

interface CoachLayoutProps {
  children: React.ReactNode
}

export default function CoachLayout({ children }: CoachLayoutProps) {
  const { user, profile, coachProfile } = useAuth()
  const params = useParams()
  const pathname = usePathname()
  const slug = params.slug as string
  
  const [coachData, setCoachData] = useState<CoachData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const isPublicRoute = pathname.includes('/profile') || 
                       pathname.includes('/methodology') || 
                       pathname.includes('/reviews')
  const isOwner = coachData && profile?.role === 'coach' && 
                  user && user.email === coachData.email

  useEffect(() => {
    async function fetchCoachData() {
      try {
        const supabase = createClient()
        
        // Query the public view for coach data
        const { data, error } = await supabase
          .from('public_coach_directory')
          .select('*')
          .eq('workspace_slug', slug)
          .single()

        if (error) {
          if (error.code === 'PGRST116') {
            setError('Coach not found')
          } else {
            setError('Failed to load coach profile')
          }
          return
        }

        setCoachData(data)
        
        // Check ownership: if current user's email matches coach's email, they own this workspace
        if (user && data && user.email === data.email) {
          // This user owns this workspace
        }
        
      } catch (err) {
        setError('Failed to load coach profile')
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchCoachData()
    }
  }, [slug, user])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (error || !coachData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Coach Not Found</h1>
          <p className="text-gray-600 mb-4">{error || 'This coach profile does not exist.'}</p>
          <Link 
            href="/coaches" 
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Browse all coaches
          </Link>
        </div>
      </div>
    )
  }

  const displayName = coachData.workspace_name || 
                     `${coachData.first_name} ${coachData.last_name}`

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Coach Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Coach Identity */}
            <div className="flex items-center space-x-4">
              {coachData.profile_photo_url && (
                <img
                  src={coachData.profile_photo_url}
                  alt={displayName}
                  className="w-10 h-10 rounded-full object-cover"
                />
              )}
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {displayName}
                </h1>
                <p className="text-sm text-gray-500">Running Coach</p>
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

              {/* Private Navigation (only for coach owner) */}
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
                </>
              )}

              {/* Auth state display */}
              {user ? (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span>Hello, {profile?.first_name}</span>
                </div>
              ) : (
                <Link
                  href="/auth/signin"
                  className="px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  Sign In
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}