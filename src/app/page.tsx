'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Heading, Text } from '@/components/ui/Typography'
import { Button } from '@/components/ui/Button'
import { Activity, Users, ArrowRight } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const { user, isCoach, isAthlete, loading, workspaceSlug } = useAuth()

  // Derive dashboard URL safely
  const getDashboardUrl = () => {
    if (!user) return '/'
    if (isCoach && workspaceSlug) return `/coach/${workspaceSlug}/dashboard`
    if (isAthlete) return '/athlete/dashboard'
    return '/'
  }

  // Prevent “flash” before auth loads
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-cirfpro-gray-500 animate-pulse">Loading your experience...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-cirfpro-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-cirfpro-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-cirfpro-green-500 rounded-full flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <Heading level="h2" className="text-cirfpro-gray-900">
              CIRFPRO
            </Heading>
          </div>

          {/* Auth buttons */}
          <div className="flex items-center space-x-4">
            {!user ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => router.push('/auth/signin')}
                >
                  Sign In
                </Button>
                <Button
                  variant="primary"
                  onClick={() => router.push('/auth/signup')}
                >
                  Sign Up
                </Button>
              </>
            ) : (
              <Button
                variant="primary"
                onClick={() => router.push(getDashboardUrl())}
                className="flex items-center gap-2"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <Heading
          level="h1"
          className="text-5xl font-bold text-cirfpro-gray-900 mb-6 leading-tight"
        >
          Professional Running Coach Platform
        </Heading>
        <Text
          size="xl"
          color="muted"
          className="max-w-3xl mx-auto mb-10 text-lg text-cirfpro-gray-600"
        >
          RunCoachPro empowers coaches and athletes to train smarter together.
          Manage training plans, monitor progress, and deliver elite results —
          all in one sleek, performance-driven platform.
        </Text>

        {!user && (
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-10">
            <Button
              variant="primary"
              size="lg"
              className="flex items-center space-x-2"
              onClick={() => router.push('/auth/signup?role=coach')}
            >
              <Users className="w-5 h-5" />
              <span>I'm a Coach</span>
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="flex items-center space-x-2"
              onClick={() => router.push('/auth/signup?role=athlete')}
            >
              <Activity className="w-5 h-5" />
              <span>I'm an Athlete</span>
            </Button>
          </div>
        )}

        {/* Sign in link */}
        {!user && (
          <div className="text-sm text-cirfpro-gray-600">
            Already have an account?{' '}
            <button
              onClick={() => router.push('/auth/signin')}
              className="text-cirfpro-green-600 font-semibold hover:underline"
            >
              Sign in
            </button>{' '}
            or{' '}
            <button
              onClick={() => router.push('/auth/signup')}
              className="text-cirfpro-green-600 font-semibold hover:underline"
            >
              create one
            </button>
            .
          </div>
        )}
      </main>

      {/* Marketing Section */}
      <section className="bg-white border-t border-cirfpro-gray-200 py-16">
        <div className="max-w-6xl mx-auto px-4 grid gap-12 md:grid-cols-3 text-center">
          <div>
            <Activity className="w-10 h-10 mx-auto text-cirfpro-green-500 mb-3" />
            <Heading level="h3" className="text-lg font-semibold mb-2">
              Data-Driven Training
            </Heading>
            <Text color="muted">
              Monitor athlete progress with powerful analytics and real-time performance insights.
            </Text>
          </div>
          <div>
            <Users className="w-10 h-10 mx-auto text-cirfpro-green-500 mb-3" />
            <Heading level="h3" className="text-lg font-semibold mb-2">
              Athlete Management
            </Heading>
            <Text color="muted">
              Manage your entire coaching roster with ease — from onboarding to personalized plans.
            </Text>
          </div>
          <div>
            <ArrowRight className="w-10 h-10 mx-auto text-cirfpro-green-500 mb-3" />
            <Heading level="h3" className="text-lg font-semibold mb-2">
              Streamlined Workflow
            </Heading>
            <Text color="muted">
              Built for speed, clarity, and performance — so you can focus on coaching, not admin.
            </Text>
          </div>
        </div>
      </section>
    </div>
  )
}
