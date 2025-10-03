'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Heading, Text } from '@/components/ui/Typography'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Loader2, User, Activity, Settings } from 'lucide-react'
import Link from 'next/link'

export default function AthleteDashboardPage() {
  const router = useRouter()
  const { 
    user, 
    loading: authLoading,
    isAthlete,
    firstName,
    athleteProfile,
    signOut
  } = useAuth()

  // JWT-FIRST AUTHORIZATION CHECK
  useEffect(() => {
    console.log('🔒 Athlete dashboard authorization check...', {
      authLoading,
      user: !!user,
      isAthlete
    })

    if (authLoading) {
      console.log('⏳ Auth still loading...')
      return
    }

    if (!user) {
      console.log('🚫 No user, redirecting to home')
      window.location.href = '/'
      return
    }

    if (!isAthlete) {
      console.log('🚫 Not an athlete, redirecting to home')
      window.location.href = '/'
      return
    }

    console.log('✅ Athlete dashboard - authorization passed')

  }, [authLoading, user, isAthlete, router])

  // Show loading while auth initializes
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cirfpro-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-cirfpro-green-500" />
          <Text color="muted">Loading dashboard...</Text>
        </div>
      </div>
    )
  }

  // Not authorized
  if (!user || !isAthlete) {
    return null
  }

  return (
    <div className="min-h-screen bg-cirfpro-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-cirfpro-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Heading level="h1" className="text-cirfpro-gray-900">
                Athlete Dashboard
              </Heading>
              <Text size="sm" color="muted">
                Welcome back, {firstName}! 👋
              </Text>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/athlete/settings">
                <Button variant="secondary" className="flex items-center space-x-2">
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </Button>
              </Link>
              <Button variant="outline" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-base">
                <Activity className="w-5 h-5 text-blue-500" />
                <span>This Week</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-cirfpro-gray-900">0</div>
              <Text size="sm" color="muted">Training sessions completed</Text>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-base">
                <Activity className="w-5 h-5 text-green-500" />
                <span>Total Distance</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-cirfpro-gray-900">0 km</div>
              <Text size="sm" color="muted">This month</Text>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-base">
                <User className="w-5 h-5 text-purple-500" />
                <span>Profile</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Text className="font-medium capitalize">
                {athleteProfile?.experience_level || 'Not set'}
              </Text>
              <Text size="sm" color="muted">Experience level</Text>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Text>
                Welcome to CIRFPRO! Your athlete dashboard is ready.
              </Text>
              <div className="flex space-x-4">
                <Link href="/athlete/settings">
                  <Button variant="primary">
                    Complete Your Profile
                  </Button>
                </Link>
                <Link href="/coach/directory">
                  <Button variant="secondary">
                    Find a Coach
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}