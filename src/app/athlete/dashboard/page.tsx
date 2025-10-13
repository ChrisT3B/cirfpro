// src/app/athlete/dashboard/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Heading, Text, Badge } from '@/components/ui/Typography'
import { Button } from '@/components/ui/Button'
import { toast } from 'sonner'
import { AlertCircle, Clock, CheckCircle } from 'lucide-react'
import type { AssessmentWithDetails } from '@/types/manual-database-types'
import PendingInvitationCard from '@/components/athlete/PendingInvitationCard'

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
  const [pendingAssessments, setPendingAssessments] = useState<AssessmentWithDetails[]>([])
  const [hasCoach, setHasCoach] = useState(false)

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

  // Check for pending invitations
  useEffect(() => {
    if (!user || !athleteProfile) return

    const checkPendingInvitations = async () => {
      try {
        setLoadingInvitations(true)
        const response = await fetch('/api/invitations/pending')

        if (response.ok) {
          const data = await response.json()
          if (data.success && data.invitations) {
            setPendingInvitations(data.invitations)
          }
        }
      } catch (error) {
        console.error('Error checking pending invitations:', error)
      } finally {
        setLoadingInvitations(false)
      }
    }

    checkPendingInvitations()
  }, [user, athleteProfile])

  // Fetch pending assessments
  useEffect(() => {
    if (!user || !athleteProfile) return

    const fetchPendingAssessments = async () => {
      try {
        const supabase = createClient()

        // Check if athlete has a coach
        const { data: relationships } = await supabase
          .from('coach_athlete_relationships')
          .select('id, status')
          .eq('athlete_id', athleteProfile.id)
          .eq('status', 'active')

        setHasCoach((relationships?.length ?? 0) > 0)

        // Get assessments pending athlete review
        const { data: assessments, error } = await supabase
          .from('athlete_assessments')
          .select(`
            *,
            coach_profiles!inner (
              workspace_slug,
              users!inner (
                first_name,
                last_name
              )
            )
          `)
          .eq('athlete_id', athleteProfile.id)
          .eq('status', 'pending_athlete_review')
          .eq('shared_with_athlete', true)
          .order('shared_at', { ascending: false })

        if (error) {
          console.error('Error fetching pending assessments:', error)
          toast.error('Failed to load pending assessments')
        } else {
          setPendingAssessments((assessments as AssessmentWithDetails[]) || [])
          
          if (assessments && assessments.length > 0) {
            toast.info(`You have ${assessments.length} assessment${assessments.length > 1 ? 's' : ''} pending review`)
          }
        }
      } catch (error) {
        console.error('Error fetching pending assessments:', error)
        toast.error('Failed to load dashboard data')
      }
    }

    fetchPendingAssessments()
  }, [user, athleteProfile])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-cirfpro-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cirfpro-green-600 mx-auto mb-4"></div>
          <Text color="muted">Loading your dashboard...</Text>
        </div>
      </div>
    )
  }

  const firstName = profile?.first_name || user?.user_metadata?.first_name || 'Athlete'

  return (
    <div className="min-h-screen bg-cirfpro-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Welcome Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <Heading level="h1" className="mb-2">
            Welcome back, {firstName}!
          </Heading>
          <Text color="muted">
            Track your training progress and stay connected with your coach.
          </Text>
        </div>

        {/* Pending Invitations */}
        {!loadingInvitations && pendingInvitations.length > 0 && (
          <div className="space-y-4">
            {pendingInvitations.map((invitation) => (
              <PendingInvitationCard
                key={invitation.id}
                invitation={invitation}
                onAccepted={() => {
                  // Refresh invitations list after acceptance
                  setPendingInvitations(prev => prev.filter(inv => inv.id !== invitation.id))
                  toast.success('Invitation accepted!')
                }}
              />
            ))}
          </div>
        )}

        {/* Pending Assessments Banner */}
        {pendingAssessments.length > 0 && (
          <div className="space-y-4">
            {pendingAssessments.map((assessment) => {
              const coachName = `${assessment.coach_profiles?.users?.first_name || ''} ${assessment.coach_profiles?.users?.last_name || ''}`.trim()
              const sharedDate = assessment.shared_at 
                ? new Date(assessment.shared_at).toLocaleDateString('en-GB', { 
                    day: 'numeric', 
                    month: 'short', 
                    year: 'numeric' 
                  })
                : 'Recently'

              return (
                <Card key={assessment.id} variant="accent" accentColor="yellow">
                  <CardContent className="py-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                          <AlertCircle className="w-6 h-6 text-yellow-600" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <Heading level="h3">
                            Assessment Review Required
                          </Heading>
                          <Badge variant="warning">Action Needed</Badge>
                        </div>
                        
                        <Text className="mb-3">
                          Your coach <span className="font-semibold">{coachName}</span> has completed 
                          your initial assessment and shared it with you for review.
                        </Text>
                        
                        <div className="flex items-center gap-2 text-sm text-cirfpro-gray-600 mb-4">
                          <Clock className="w-4 h-4" />
                          <Text size="sm" color="muted">
                            Shared on {sharedDate}
                          </Text>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <Link href={`/athlete/assessment-review/${assessment.id}`}>
                            <Button variant="primary">
                              Review Assessment
                            </Button>
                          </Link>
                          
                          <Button 
                            variant="outline"
                            onClick={() => toast.info('You can review the assessment at any time from your dashboard')}
                          >
                            Review Later
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* No Coach Prompt */}
        {!hasCoach && pendingInvitations.length === 0 && pendingAssessments.length === 0 && (
          <Card variant="accent" accentColor="blue">
            <CardContent className="py-6">
              <Heading level="h3" className="mb-2">
                Ready to start your training journey?
              </Heading>
              <Text className="mb-4" color="muted">
                Connect with a coach to get personalized training plans and expert guidance.
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
              {hasCoach ? (
                <>
                  <CheckCircle className="w-12 h-12 text-cirfpro-green-500 mx-auto mb-3" />
                  <Text color="muted">
                    Your training plan will appear here once your coach has set it up.
                  </Text>
                </>
              ) : (
                <Text color="muted">
                  Your training data will appear here once you connect with a coach.
                </Text>
              )}
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