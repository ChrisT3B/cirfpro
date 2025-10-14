'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { AssessmentQueries } from '@/lib/supabase/assessment-queries'
import type {
  AthleteAssessment,
  AssessmentPersonalDetailsInsert,
  AssessmentTrainingBackgroundInsert,
} from '@/types/manual-database-types'

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge, Heading, Text } from '@/components/ui/Typography'
import { CheckCircle, Share2, Lock } from 'lucide-react'

import PersonalDetailsTab from './PersonalDetailsTab'
import TrainingBackgroundTab from './TrainingBackGroundTab' // ✅ fixed casing

export default function OnboardingPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()

  const slug = params.slug as string
  const athleteId = params.athleteId as string
  const relationshipId = searchParams.get('relationshipId') || ''

  const supabase = createClient()
  const queries = new AssessmentQueries(supabase)

  // ---------------- STATE ----------------
  const [assessment, setAssessment] = useState<AthleteAssessment | null>(null)
  const [personalDetails, setPersonalDetails] = useState<AssessmentPersonalDetailsInsert>({} as AssessmentPersonalDetailsInsert)
  const [trainingBackground, setTrainingBackground] = useState<AssessmentTrainingBackgroundInsert>({} as AssessmentTrainingBackgroundInsert)
  const [activeTab, setActiveTab] = useState<'personal' | 'training'>('personal')
  const [mode, setMode] = useState<'view' | 'edit'>('edit')
  const [loading, setLoading] = useState(true)
  const [autoSaving, setAutoSaving] = useState(false)

  // ---------------- LOAD OR CREATE ----------------
  useEffect(() => {
    const init = async () => {
      setLoading(true)

      const { data: existing } = await queries.getActiveAssessmentByRelationship(relationshipId)
      let current = existing

      if (!current) {
        const { data: created } = await queries.createAssessment({
          athlete_id: athleteId,
          coach_id: '', // TODO: inject from auth
          relationship_id: relationshipId,
          status: 'draft',
          assessment_type: 'initial_onboarding',
        })
        current = created
      }

      if (current) {
        const { data: full } = await queries.getAssessmentWithDetails(current.id)
        setAssessment(full || current)

        // Normalize potential nulls → undefined
        setPersonalDetails({
          ...full?.personal_details,
          athlete_name: full?.personal_details?.athlete_name ?? undefined,
        } as AssessmentPersonalDetailsInsert)

        setTrainingBackground({
          ...full?.training_background,
          other_activities: full?.training_background?.other_activities ?? undefined,
        } as AssessmentTrainingBackgroundInsert)
      }

      setLoading(false)
    }

    init()
  }, [relationshipId, athleteId])

  // ---------------- AUTO SAVE ----------------
  useEffect(() => {
    if (!assessment?.id || mode !== 'edit') return
    const timer = setTimeout(async () => {
      setAutoSaving(true)
      if (activeTab === 'personal') {
        await queries.upsertPersonalDetails(assessment.id, personalDetails)
      } else {
        await queries.upsertTrainingBackground(assessment.id, trainingBackground)
      }
      setAutoSaving(false)
    }, 25000)
    return () => clearTimeout(timer)
  }, [personalDetails, trainingBackground, activeTab, mode, assessment?.id])

  // ---------------- SHARE ----------------
  const handleShare = async () => {
    if (!assessment?.id) return
    await queries.shareWithAthlete(assessment.id, assessment.coach_id)
    router.push(`/coach/${slug}/dashboard`)
  }

  // ---------------- MODE TOGGLE ----------------
  const toggleMode = async () => {
    if (mode === 'edit' && assessment?.id) {
      setAutoSaving(true)
      if (activeTab === 'personal') {
        await queries.upsertPersonalDetails(assessment.id, personalDetails)
      } else {
        await queries.upsertTrainingBackground(assessment.id, trainingBackground)
      }
      setAutoSaving(false)
    }
    setMode(mode === 'edit' ? 'view' : 'edit')
  }

  if (loading) {
    return <Text>Loading assessment...</Text>
  }

  if (assessment?.status === 'pending_athlete_review') {
    return (
      <Card className="border-yellow-500 border-2 p-4">
        <Heading level="h3" className="flex items-center gap-2 text-yellow-700">
          <Lock size={18} /> Assessment Locked
        </Heading>
        <Text className="mt-2">
          This assessment is currently awaiting athlete review and is locked.
        </Text>
      </Card>
    )
  }

  // ---------------- RENDER ----------------
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Heading level="h2">Athlete Onboarding</Heading>
        <div className="flex items-center gap-3">
          <Button onClick={toggleMode}>
            {mode === 'view' ? 'Edit' : 'Save & View'}
          </Button>
          <Button
            variant="outline"
            onClick={handleShare}
            disabled={!assessment}
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share with Athlete
          </Button>
          {autoSaving && <Badge variant="info">Saving...</Badge>}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-2 border-b border-cirfpro-gray-300">
        <Button
          variant={activeTab === 'personal' ? 'primary' : 'secondary'}
          onClick={() => setActiveTab('personal')}
        >
          Personal Details
          {assessment?.personal_details_completed && (
            <CheckCircle size={16} className="ml-1 text-green-500" />
          )}
        </Button>
        <Button
          variant={activeTab === 'training' ? 'primary' : 'secondary'}
          onClick={() => setActiveTab('training')}
        >
          Training Background
          {assessment?.training_background_completed && (
            <CheckCircle size={16} className="ml-1 text-green-500" />
          )}
        </Button>
      </div>

      {/* Tab Content */}
      {activeTab === 'personal' && (
        <Card>
          <CardContent>
            <PersonalDetailsTab
              personalDetails={personalDetails}
              setPersonalDetails={setPersonalDetails}
              assessmentQueries={queries}
              mode={mode}
            />
          </CardContent>
        </Card>
      )}

      {activeTab === 'training' && (
        <Card>
          <CardContent>
            <TrainingBackgroundTab
              trainingBackground={trainingBackground}
              setTrainingBackground={setTrainingBackground}
              assessmentQueries={queries}
              mode={mode}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
