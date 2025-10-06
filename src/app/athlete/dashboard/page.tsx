// src/app/athlete/dashboard/page.tsx
'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Heading, Text, Caption } from '@/components/ui/Typography'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import PendingInvitationCard from '@/components/athlete/PendingInvitationCard' //cirfpro\src\components\athlete\PendingInvitationCard.tsx

interface PendingInvitation {
  id: string
  coachId: string
  email: string
  message: string | null
  status: string
  expiresAt: string
  sentAt: string
  invitationToken: string
  coach: {
    name: string
    email: string
    qualifications: string[]
    photoUrl: string | null
    philosophy: string | null
    yearsExperience: number | null
  }
}

export default function AthleteDashboard() {
  const { user, profile, athleteProfile, loading: authLoading, isAthlete } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [pendingInvitations, setPendingInvitations] = useState<PendingInvitation[]>([])
  const [loadingInvitations, setLoadingInvitations] = useState(true)

  // Authorization check
  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push('/auth/signin')
      return
    }

    if (!isAthlete) {
      router.push('/dashboard')
      return
    }

    setLoading(false)
  }, [authLoading, user, isAthlete, router])

  // Check for pending invitation from sessionStorage (from email link)
  useEffect(() => {
    const checkPendingInvitation = async () => {
      const invitationToken = sessionStorage.getItem('pendingInvitationToken')
      
      if (invitationToken && user) {
        // Validate the token is still valid and for this user
        try {
          const response = await fetch(`/api/invitations/validate/${invitationToken}`)
          const data = await response.json()
          
          if (data.valid && data.invitation.email === profile?.email) {
            // Token is valid and matches user - it will be shown in pending invitations
            console.log('Valid pending invitation detected from email link')
          }
          
          // Clear the token from sessionStorage regardless
          sessionStorage.removeItem('pendingInvitationToken')
        } catch (error) {
          console.error('Error checking pending invitation:', error)
          sessionStorage.removeItem('pendingInvitationToken')
        }
      }
    }

    if (!authLoading && user && profile) {
      checkPendingInvitation()
    }
  }, [authLoading, user, profile])

  // Fetch pending invitations from database
  useEffect(() => {
    const fetchPendingInvitations = async () => {
      if (!user) return

      try {
        setLoadingInvitations(true)
        const response = await fetch('/api/invitations/pending')
        
        if (response.ok) {
          const data = await response.json()
          setPendingInvitations(data.invitations || [])
        } else {
          console.error('Failed to fetch pending invitations')
        }
      } catch (error) {
        console.error('Error fetching pending invitations:', error)
      } finally {
        setLoadingInvitations(false)
      }
    }

    if (!authLoading && user) {
      fetchPendingInvitations()
    }
  }, [authLoading, user])

  // Refresh invitations after acceptance
  const handleInvitationAccepted = () => {
    // Refresh the pending invitations list
    const fetchPendingInvitations = async () => {
      try {
        const response = await fetch('/api/invitations/pending')
        if (response.ok) {
          const data = await response.json()
          setPendingInvitations(data.invitations || [])
        }
      } catch (error) {
        console.error('Error refreshing invitations:', error)
      }
    }

    fetchPendingInvitations()
  }

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const firstName = profile?.first_name || 'Athlete'

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Welcome Header */}
        <div>
          <Heading level="h1">Welcome back, {firstName}!</Heading>
          <Text color="muted" className="mt-2">
            {athleteProfile?.coach_id 
              ? 'Track your progress and stay connected with your coach.'
              : 'Your athlete dashboard is ready.'}
          </Text>
        </div>

        {/* Pending Invitations Section */}
        {loadingInvitations ? (
          <Card>
            <CardContent className="py-8">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                <Text className="ml-3">Checking for pending invitations...</Text>
              </div>
            </CardContent>
          </Card>
        ) : pendingInvitations.length > 0 ? (
          <div className="space-y-4">
            {pendingInvitations.map((invitation) => (
              <PendingInvitationCard
                key={invitation.id}
                invitation={invitation}
                onAccepted={handleInvitationAccepted}
              />
            ))}
          </div>
        ) : null}

        {/* Quick Actions */}
        {!athleteProfile?.coach_id && (
          <Card>
            <CardHeader>
              <CardTitle>Get Started</CardTitle>
            </CardHeader>
            <CardContent>
              <Text color="muted" className="mb-4">
                Complete your profile and connect with a professional coach to begin your training journey.
              </Text>
              <div className="flex flex-wrap gap-3">
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
            </CardContent>
          </Card>
        )}

        {/* Training Overview - Placeholder for future development */}
        <Card>
          <CardHeader>
            <CardTitle>Training Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Text color="muted">
                Your training data will appear here once you connect with a coach.
              </Text>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity - Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Text color="muted">
                No recent activity to display.
              </Text>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}