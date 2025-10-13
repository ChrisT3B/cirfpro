// src/app/athlete/assessment-review/[assessmentId]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase'
import { AssessmentQueries } from '@/lib/supabase/assessment-queries'
import { RelationshipQueries } from '@/lib/supabase/relationship-queries'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Heading, Text, Badge, Caption } from '@/components/ui/Typography'
import { Button } from '@/components/ui/Button'
import BaseModal from '@/components/ui/BaseModal'
import { toast } from 'sonner'
import { 
  ArrowLeft, 
  CheckCircle, 
  AlertTriangle, 
  User, 
  Activity,
  Calendar,
  Clock,
  Heart,
  TrendingUp,
  FileText,
  MessageSquare
} from 'lucide-react'
import type { AssessmentWithDetails } from '@/types/manual-database-types'

export default function AssessmentReviewPage() {
  const params = useParams()
  const router = useRouter()
  const { user, athleteProfile, loading: authLoading } = useAuth()
  
  const assessmentId = params?.assessmentId as string
  
  const [loading, setLoading] = useState(true)
  const [assessment, setAssessment] = useState<AssessmentWithDetails | null>(null)
  const [sharedCustomQuestions, setSharedCustomQuestions] = useState<any[]>([])
  const [showDisputeModal, setShowDisputeModal] = useState(false)
  const [disputeNotes, setDisputeNotes] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return

    if (!user || !athleteProfile) {
      router.push('/auth/signin')
      return
    }

    loadAssessment()
  }, [authLoading, user, athleteProfile, assessmentId])

  const loadAssessment = async () => {
    if (!athleteProfile?.id || !assessmentId) return

    try {
      setLoading(true)
      setError(null)
      
      const supabase = createClient()
      const assessmentQueries = new AssessmentQueries(supabase)

      // Load assessment with details
      const { data: assessmentData, error: assessmentError } = await assessmentQueries.getAssessmentWithDetails(assessmentId)

      if (assessmentError) {
        console.error('Error loading assessment:', assessmentError)
        setError('Failed to load assessment')
        return
      }

      if (!assessmentData) {
        setError('Assessment not found')
        return
      }

      // Verify this assessment belongs to the current athlete
      if (assessmentData.athlete_id !== athleteProfile.id) {
        setError('You do not have permission to view this assessment')
        return
      }

      // Verify assessment is shared with athlete
      if (!assessmentData.shared_with_athlete) {
        setError('This assessment has not been shared yet')
        return
      }

      setAssessment(assessmentData)

      // Load shareable custom questions
      const { data: questionsData } = await assessmentQueries.getShareableCustomResponses(assessmentId)
      setSharedCustomQuestions(questionsData || [])

    } catch (err) {
      console.error('Error loading assessment:', err)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async () => {
    if (!assessment || !athleteProfile?.id) return

    setActionLoading(true)
    try {
      const supabase = createClient()
      const assessmentQueries = new AssessmentQueries(supabase)
      const relationshipQueries = new RelationshipQueries(supabase)

      // Accept the assessment
      const { error: acceptError } = await assessmentQueries.athleteAcceptAssessment(
        assessment.id,
        athleteProfile.id
      )

      if (acceptError) {
        throw new Error('Failed to accept assessment')
      }

      // Update relationship onboarding status
      const { error: relationshipError } = await relationshipQueries.updateOnboardingStatus(
        assessment.relationship_id,
        'completed'
      )

      if (relationshipError) {
        console.error('Error updating relationship status:', relationshipError)
        // Don't fail the whole operation if this fails
      }

      toast.success('Assessment accepted! You can now access your training plan.')
      
      // Redirect to athlete dashboard
      router.push('/athlete/dashboard')
    } catch (err) {
      console.error('Error accepting assessment:', err)
      toast.error('Failed to accept assessment. Please try again.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDispute = async () => {
    if (!assessment || !athleteProfile?.id) return
    
    if (!disputeNotes.trim()) {
      toast.error('Please provide details about what needs correction')
      return
    }

    setActionLoading(true)
    try {
      const supabase = createClient()
      const assessmentQueries = new AssessmentQueries(supabase)

      // Submit dispute
      const { error: disputeError } = await assessmentQueries.athleteDisputeAssessment(
        assessment.id,
        athleteProfile.id,
        disputeNotes.trim()
      )

      if (disputeError) {
        throw new Error('Failed to submit dispute')
      }

      toast.success('Dispute submitted. Your coach will review and update the information.')
      setShowDisputeModal(false)
      
      // Redirect to dashboard
      router.push('/athlete/dashboard')
    } catch (err) {
      console.error('Error disputing assessment:', err)
      toast.error('Failed to submit dispute. Please try again.')
    } finally {
      setActionLoading(false)
    }
  }

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-cirfpro-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cirfpro-green-600 mx-auto mb-4"></div>
          <Text color="muted">Loading assessment...</Text>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !assessment) {
    return (
      <div className="min-h-screen bg-cirfpro-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
            <Heading level="h3" className="mb-2">
              {error || 'Assessment Not Found'}
            </Heading>
            <Text color="muted" className="mb-6">
              {error || 'The assessment you are looking for could not be found.'}
            </Text>
            <Link href="/athlete/dashboard">
              <Button variant="primary">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Return to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const coachName = `${assessment.coach_profiles?.users?.first_name || ''} ${assessment.coach_profiles?.users?.last_name || ''}`.trim() || 'Your Coach'
  const sharedDate = assessment.shared_at 
    ? new Date(assessment.shared_at).toLocaleDateString('en-GB', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      })
    : 'Recently'

  return (
    <div className="min-h-screen bg-cirfpro-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-cirfpro-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link 
            href="/athlete/dashboard"
            className="inline-flex items-center text-cirfpro-gray-600 hover:text-cirfpro-gray-800 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <Text size="sm">Back to Dashboard</Text>
          </Link>
          
          <Heading level="h1" className="mb-2">
            Assessment Review
          </Heading>
          <Text color="muted">
            Review your assessment information shared by {coachName}
          </Text>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Info Banner */}
        <Card variant="accent" accentColor="blue">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <Text className="font-semibold mb-1">
                  Please review the information below carefully
                </Text>
                <Text size="sm" color="muted">
                  Shared by {coachName} on {sharedDate}. If any information is incorrect, 
                  you can dispute it and your coach will make corrections.
                </Text>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Details */}
        {assessment.personal_details && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-cirfpro-green-600" />
                <CardTitle>Personal Details</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {assessment.personal_details.athlete_name && (
                  <div>
                    <dt className="text-sm font-medium text-cirfpro-gray-600 mb-1">Name</dt>
                    <dd className="text-base text-cirfpro-gray-900">{assessment.personal_details.athlete_name}</dd>
                  </div>
                )}
                {assessment.personal_details.age && (
                  <div>
                    <dt className="text-sm font-medium text-cirfpro-gray-600 mb-1">Age</dt>
                    <dd className="text-base text-cirfpro-gray-900">{assessment.personal_details.age} years</dd>
                  </div>
                )}
                {assessment.personal_details.gender && (
                  <div>
                    <dt className="text-sm font-medium text-cirfpro-gray-600 mb-1">Gender</dt>
                    <dd className="text-base text-cirfpro-gray-900 capitalize">{assessment.personal_details.gender}</dd>
                  </div>
                )}
                {assessment.personal_details.standing_height_cm && (
                  <div>
                    <dt className="text-sm font-medium text-cirfpro-gray-600 mb-1">Height</dt>
                    <dd className="text-base text-cirfpro-gray-900">{assessment.personal_details.standing_height_cm} cm</dd>
                  </div>
                )}
                {assessment.personal_details.current_status && (
                  <div>
                    <dt className="text-sm font-medium text-cirfpro-gray-600 mb-1">Current Status</dt>
                    <dd className="text-base text-cirfpro-gray-900">{assessment.personal_details.current_status}</dd>
                  </div>
                )}
                {assessment.personal_details.days_per_week_available !== null && (
                  <div>
                    <dt className="text-sm font-medium text-cirfpro-gray-600 mb-1">Days Available per Week</dt>
                    <dd className="text-base text-cirfpro-gray-900">{assessment.personal_details.days_per_week_available} days</dd>
                  </div>
                )}
                {assessment.personal_details.preferred_training_days && assessment.personal_details.preferred_training_days.length > 0 && (
                  <div className="md:col-span-2">
                    <dt className="text-sm font-medium text-cirfpro-gray-600 mb-1">Preferred Training Days</dt>
                    <dd className="flex flex-wrap gap-2">
                      {assessment.personal_details.preferred_training_days.map((day, idx) => (
                        <Badge key={idx} variant="info">{day}</Badge>
                      ))}
                    </dd>
                  </div>
                )}
                {assessment.personal_details.preferred_training_times && (
                  <div className="md:col-span-2">
                    <dt className="text-sm font-medium text-cirfpro-gray-600 mb-1">Preferred Training Times</dt>
                    <dd className="text-base text-cirfpro-gray-900">{assessment.personal_details.preferred_training_times}</dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>
        )}

        {/* Training Background */}
        {assessment.training_background && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-cirfpro-green-600" />
                <CardTitle>Training Background</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {assessment.training_background.years_running_experience !== null && (
                  <div>
                    <dt className="text-sm font-medium text-cirfpro-gray-600 mb-1">Years of Running Experience</dt>
                    <dd className="text-base text-cirfpro-gray-900">{assessment.training_background.years_running_experience} years</dd>
                  </div>
                )}
                {assessment.training_background.typical_weekly_mileage_km !== null && (
                  <div>
                    <dt className="text-sm font-medium text-cirfpro-gray-600 mb-1">Typical Weekly Mileage</dt>
                    <dd className="text-base text-cirfpro-gray-900">{assessment.training_background.typical_weekly_mileage_km} km</dd>
                  </div>
                )}
                {assessment.training_background.previous_training_structure && (
                  <div>
                    <dt className="text-sm font-medium text-cirfpro-gray-600 mb-1">Previous Training Structure</dt>
                    <dd className="text-base text-cirfpro-gray-900 capitalize">{assessment.training_background.previous_training_structure}</dd>
                  </div>
                )}
                {assessment.training_background.coach_experience_categorization && (
                  <div>
                    <dt className="text-sm font-medium text-cirfpro-gray-600 mb-1">Experience Level</dt>
                    <dd>
                      <Badge variant="brand" className="capitalize">
                        {assessment.training_background.coach_experience_categorization}
                      </Badge>
                    </dd>
                  </div>
                )}
              </dl>

              {/* Other Physical Activities */}
              {assessment.training_background.other_activities && assessment.training_background.other_activities.length > 0 && (
                <div>
                  <dt className="text-sm font-medium text-cirfpro-gray-600 mb-2">Other Physical Activities</dt>
                  <div className="space-y-2">
                    {assessment.training_background.other_activities.map((activity, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-cirfpro-gray-50 rounded-lg">
                        <div>
                          <Text className="font-medium">{activity.activity}</Text>
                          <Caption>
                            {activity.frequency} • {activity.duration_minutes} min • {activity.level}
                          </Caption>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Previous Race Experiences */}
              {assessment.training_background.previous_race_experiences && (
                <div>
                  <dt className="text-sm font-medium text-cirfpro-gray-600 mb-1">Previous Race Experiences</dt>
                  <dd className="text-base text-cirfpro-gray-900 whitespace-pre-wrap">
                    {assessment.training_background.previous_race_experiences}
                  </dd>
                </div>
              )}

              {/* Injury Information */}
              {assessment.training_background.previous_running_injuries && (
                <div>
                  <dt className="text-sm font-medium text-cirfpro-gray-600 mb-1">Previous Running Injuries</dt>
                  <dd className="text-base text-cirfpro-gray-900 whitespace-pre-wrap">
                    {assessment.training_background.previous_running_injuries}
                  </dd>
                </div>
              )}
              
              {assessment.training_background.current_injuries_limitations && (
                <div>
                  <dt className="text-sm font-medium text-cirfpro-gray-600 mb-1">Current Injuries or Limitations</dt>
                  <dd className="text-base text-cirfpro-gray-900 whitespace-pre-wrap">
                    {assessment.training_background.current_injuries_limitations}
                  </dd>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Custom Questions (Only Shared) */}
        {sharedCustomQuestions.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-cirfpro-green-600" />
                <CardTitle>Additional Questions</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {sharedCustomQuestions.map((question) => (
                <div key={question.id} className="p-4 bg-cirfpro-gray-50 rounded-lg">
                  <Text className="font-semibold mb-2">{question.question_text}</Text>
                  <Text color="muted">{question.response_text || 'No response provided'}</Text>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-end pt-4">
          <Button 
            variant="outline" 
            onClick={() => setShowDisputeModal(true)}
            disabled={actionLoading}
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Dispute Information
          </Button>
          <Button 
            variant="primary"
            onClick={handleAccept}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Accept & Continue
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Dispute Modal */}
      <BaseModal
        isOpen={showDisputeModal}
        onClose={() => !actionLoading && setShowDisputeModal(false)}
        title="Dispute Assessment Information"
        size="md"
        preventClose={actionLoading}
      >
        <div className="space-y-4">
          <Text color="muted">
            Please explain what information needs to be corrected. Your coach will review your feedback 
            and update the assessment accordingly.
          </Text>
          
          <div>
            <label htmlFor="disputeNotes" className="block text-sm font-medium text-cirfpro-gray-700 mb-2">
              What needs to be corrected? *
            </label>
            <textarea
              id="disputeNotes"
              value={disputeNotes}
              onChange={(e) => setDisputeNotes(e.target.value)}
              disabled={actionLoading}
              placeholder="e.g., My weekly mileage is typically higher at around 50km, and I have been running consistently for 3 years, not 2..."
              rows={5}
              className="w-full px-3 py-2 border border-cirfpro-gray-300 rounded-lg focus:ring-2 focus:ring-cirfpro-green-500 focus:border-cirfpro-green-500 disabled:bg-cirfpro-gray-50 disabled:text-cirfpro-gray-500 resize-none"
              maxLength={1000}
            />
            <Caption className="mt-1">
              {disputeNotes.length}/1000 characters
            </Caption>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button 
              variant="outline" 
              onClick={() => setShowDisputeModal(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button 
              variant="primary"
              onClick={handleDispute}
              disabled={actionLoading || !disputeNotes.trim()}
            >
              {actionLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                'Submit Dispute'
              )}
            </Button>
          </div>
        </div>
      </BaseModal>
    </div>
  )
}