'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Heading, Text } from '@/components/ui/Typography'
import { Button } from '@/components/ui/Button'
import { Activity, Users, ArrowRight } from 'lucide-react'

export default function HomePage() {
  const { user, isCoach, isAthlete, loading, workspaceSlug } = useAuth() // ensure your context exposes `loading`

  const getDashboardUrl = () => {
  if (!user) return '/'

  // Use workspaceSlug — same as other pages
  if (isCoach && workspaceSlug) return `/coach/${workspaceSlug}/dashboard`
  if (isAthlete) return '/athlete/dashboard'
  return '/'
}

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-cirfpro-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-cirfpro-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-cirfpro-green-500 rounded-full flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <Heading level="h2" className="text-cirfpro-gray-900">CIRFPRO</Heading>
          </div>

          {/* Auth buttons */}
          {!loading && (
            <div className="flex items-center space-x-4">
              {!user ? (
                <>
                  <Link href="/auth/signin">
                    <Button variant="outline">Sign In</Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button variant="primary">Sign Up</Button>
                  </Link>
                </>
              ) : (
                <Link href={getDashboardUrl()}>
                  <Button variant="primary">Go to Dashboard</Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <Heading level="h1" className="text-5xl font-bold text-cirfpro-gray-900 mb-6">
          Professional Running Coach Platform
        </Heading>
        <Text size="xl" color="muted" className="max-w-3xl mx-auto mb-8">
          Evidence-based training planning and athlete management for qualified running coaches.
          Built on proven periodization principles.
        </Text>

        {!loading && !user && (
          <>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-6">
              <Link href="/auth/signup?role=coach">
                <Button variant="primary" size="lg" className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>I'm a Coach</span>
                </Button>
              </Link>
              <Link href="/auth/signup?role=athlete">
                <Button variant="secondary" size="lg" className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>I'm an Athlete</span>
                </Button>
              </Link>
            </div>

            <div className="mt-4 text-sm text-cirfpro-gray-600">
              Already have an account?{' '}
              <Link href="/auth/signin" className="text-cirfpro-green-600 font-semibold hover:underline">
                Sign in
              </Link>{' '}
              or{' '}
              <Link href="/auth/signup" className="text-cirfpro-green-600 font-semibold hover:underline">
                create one
              </Link>.
            </div>
          </>
        )}
      </main>
    </div>
  )
}
