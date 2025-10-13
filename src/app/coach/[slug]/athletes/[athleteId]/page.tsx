// src/app/coach/[slug]/athletes/[athleteId]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase'
import { ArrowLeft, User, FileText, Target, Calendar, TrendingUp, Plus, Settings, Bell, Clock, MapPin } from 'lucide-react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Heading, Text, Badge, Caption } from '@/components/ui/Typography'

// Safe date utility function
const safeDate = (dateStr: string | null | undefined): Date => {
  if (!dateStr) return new Date()
  try {
    return new Date(dateStr)
  } catch {
    return new Date()
  }
}

interface AthleteDetails {
  id: string
  user_id: string
  first_name: string
  last_name: string
  email: string
  experience_level: string | null
  goal_race_distance: string | null
  goal_race_date: string | null
  goal_time_minutes: number | null
  date_of_birth: string | null
  created_at: string | null
  medical_conditions: string | null
  injury_history: string | null
}

interface TrainingBackground {
  fitness_level: string | null
  weekly_mileage: number | null
  previous_injuries: string[]
  training_preferences: {
    preferred_days: string[]
    preferred_times: string[]
    available_equipment: string[]
  }
  medical_conditions: string[]
  motivation_goals: string[]
}

interface TrainingPlan {
  id: string
  name: string
  start_date: string
  end_date: string
  target_race_date: string
  phase_type: string
  status: string
  total_weeks: number | null
  current_week: number
  goal_race_name: string | null
}

interface ProgressStatus {
  current_week: number
  weeks_until_race: number
  total_sessions: number
  completed_sessions: number
  this_week_completed: number
  this_week_total: number
  compliance_rate: number
  last_activity_date: string | null
}

export default function AthleteTrainingZone() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  
  const coachSlug = typeof params?.slug === 'string' ? params.slug : ''
  const athleteId = typeof params?.athleteId === 'string' ? params.athleteId : ''
  
  const [athlete, setAthlete] = useState<AthleteDetails | null>(null)
  const [trainingBackground, setTrainingBackground] = useState<TrainingBackground | null>(null)
  const [trainingPlan, setTrainingPlan] = useState<TrainingPlan | null>(null)
  const [progressStatus, setProgressStatus] = useState<ProgressStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user || !athleteId || !coachSlug) return
    fetchAthleteData()
  }, [user, athleteId, coachSlug])

  const fetchAthleteData = async () => {
    try {
      setLoading(true)
      const supabase = createClient()

      // 1. FETCH ATHLETE DETAILS WITH USER INFORMATION
      const { data: athleteData, error: athleteError } = await supabase
        .from('athlete_profiles')
        .select(`
          *,
          users!athlete_profiles_user_id_fkey (
            first_name,
            last_name,
            email
          )
        `)
        .eq('id', athleteId)
        .single()

      if (athleteError) {
        throw new Error('Failed to fetch athlete details')
      }

      const formattedAthlete: AthleteDetails = {
        ...athleteData,
        first_name: athleteData.users?.first_name || '',
        last_name: athleteData.users?.last_name || '',
        email: athleteData.users?.email || ''
      }

      setAthlete(formattedAthlete)

      // 2. FETCH TRAINING BACKGROUND FROM ATHLETE PROFILE
      const trainingBg: TrainingBackground = {
        fitness_level: athleteData.experience_level,
        weekly_mileage: null,
        previous_injuries: athleteData.injury_history ? athleteData.injury_history.split(',').map((s: string) => s.trim()) : [],
        training_preferences: {
          preferred_days: [],
          preferred_times: [],
          available_equipment: []
        },
        medical_conditions: athleteData.medical_conditions ? athleteData.medical_conditions.split(',').map((s: string) => s.trim()) : [],
        motivation_goals: []
      }
      setTrainingBackground(trainingBg)

      // 3. FETCH CURRENT TRAINING PLAN (MACROCYCLE)
      const { data: macrocycleData, error: macrocycleError } = await supabase
        .from('macrocycles')
        .select('*')
        .eq('athlete_id', athleteId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (macrocycleData) {
        // Use safe date function for all date operations
        const startDate = safeDate(macrocycleData.start_date)
        const endDate = safeDate(macrocycleData.end_date)
        const currentDate = new Date()
        const totalWeeks = macrocycleData.total_weeks || 1
        const weeksPassed = Math.floor((currentDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000))
        const currentWeek = Math.max(1, Math.min(weeksPassed + 1, totalWeeks))

        const targetRaceDate = macrocycleData.goal_race_date || macrocycleData.end_date || new Date().toISOString()

        setTrainingPlan({
          id: macrocycleData.id,
          name: macrocycleData.name,
          start_date: macrocycleData.start_date || new Date().toISOString(),
          end_date: macrocycleData.end_date || new Date().toISOString(),
          target_race_date: targetRaceDate,
          phase_type: 'base_building',
          status: 'active',
          total_weeks: totalWeeks,
          current_week: currentWeek,
          goal_race_name: macrocycleData.goal_race_name
        })

        // 4. FETCH PROGRESS STATUS FROM TRAINING SESSIONS
        const { data: sessionsData, error: sessionsError } = await supabase
          .from('training_sessions')
          .select('*')
          .eq('athlete_id', athleteId)
          .order('created_at', { ascending: false })

if (sessionsData) {
  const totalSessions = sessionsData.length
  const completedSessions = sessionsData.filter(session => session.completed_at).length
  const lastCompletedSession = sessionsData.find(session => session.completed_at)
  
  const raceDate = safeDate(targetRaceDate)
  const weeksUntilRace = Math.ceil((raceDate.getTime() - currentDate.getTime()) / (7 * 24 * 60 * 60 * 1000))
  const complianceRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0

  setProgressStatus({
    current_week: currentWeek,
    weeks_until_race: Math.max(0, weeksUntilRace),
    total_sessions: totalSessions,
    completed_sessions: completedSessions,
    this_week_completed: 0, // Placeholder until we build scheduling
    this_week_total: 1, // Placeholder to avoid division by zero
    compliance_rate: complianceRate,
    last_activity_date: lastCompletedSession?.completed_at || null
  })
}
      } else {
        setTrainingPlan(null)
        setProgressStatus(null)
      }

    } catch (err) {
      console.error('Error fetching athlete data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load athlete data')
    } finally {
      setLoading(false)
    }
  }

  // Helper functions for styling
  const getExperienceColor = (level: string | null) => {
    switch (level) {
      case 'beginner': return 'success'
      case 'intermediate': return 'info'
      case 'advanced': return 'warning'
      default: return 'default'
    }
  }

  const getComplianceColor = (rate: number) => {
    if (rate >= 80) return 'success'
    if (rate >= 60) return 'warning'
    return 'error'
  }

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'base_building': return 'info'
      case 'build_up': return 'warning'
      case 'peak': return 'error'
      case 'taper': return 'success'
      default: return 'default'
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-cirfpro-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cirfpro-green-500 mx-auto mb-4"></div>
          <Text color="muted">Loading athlete training zone...</Text>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !athlete) {
    return (
      <div className="min-h-screen bg-cirfpro-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-8">
            <Heading level="h3" color="muted" className="mb-2">Error Loading Athlete</Heading>
            <Text color="muted" className="mb-4">{error || 'Athlete not found'}</Text>
            <Link
              href={`/coach/${coachSlug}/dashboard`}
              className="inline-flex items-center gap-2 text-cirfpro-green-600 hover:text-cirfpro-green-700"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cirfpro-gray-50">
      {/* Navigation Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Link
                href={`/coach/${coachSlug}/dashboard`}
                className="flex items-center gap-2 text-cirfpro-gray-600 hover:text-cirfpro-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <Text>Dashboard</Text>
              </Link>
              <div className="border-l border-cirfpro-gray-300 pl-4">
                <Heading level="h1">
                  {athlete.first_name} {athlete.last_name}
                </Heading>
                <Caption color="muted">Training Zone</Caption>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 text-cirfpro-gray-600 hover:text-cirfpro-gray-800 hover:bg-cirfpro-gray-100 rounded-lg transition-colors">
                <Bell className="w-4 h-4" />
                <Text size="sm">Notifications</Text>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-cirfpro-gray-600 hover:text-cirfpro-gray-800 hover:bg-cirfpro-gray-100 rounded-lg transition-colors">
                <Settings className="w-4 h-4" />
                <Text size="sm">Settings</Text>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column */}
          <div className="space-y-8">
            
            {/* 1. Athlete Profile */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Athlete Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 bg-cirfpro-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Text className="text-cirfpro-green-600 font-bold text-2xl">
                      {athlete.first_name?.charAt(0)}{athlete.last_name?.charAt(0)}
                    </Text>
                  </div>
                  <div className="flex-1 space-y-2">
                    <Heading level="h3">{athlete.first_name} {athlete.last_name}</Heading>
                    <Text color="muted" size="sm">{athlete.email}</Text>
                    {athlete.experience_level && (
                      <Badge variant={getExperienceColor(athlete.experience_level)} className="capitalize">
                        {athlete.experience_level} runner
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {athlete.goal_race_distance && (
                    <div>
                      <Caption color="muted" className="mb-1">Goal Distance</Caption>
                      <Text className="font-medium">{athlete.goal_race_distance}</Text>
                    </div>
                  )}
                  
                  {athlete.goal_race_date && (
                    <div>
                      <Caption color="muted" className="mb-1">Target Race Date</Caption>
                      <Text className="font-medium">
                        {safeDate(athlete.goal_race_date).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </Text>
                    </div>
                  )}

                  {athlete.goal_time_minutes && (
                    <div>
                      <Caption color="muted" className="mb-1">Goal Time</Caption>
                      <Text className="font-medium">
                        {Math.floor(athlete.goal_time_minutes / 60)}:{String(athlete.goal_time_minutes % 60).padStart(2, '0')}
                      </Text>
                    </div>
                  )}

                  {athlete.created_at && (
                    <div>
                      <Caption color="muted" className="mb-1">Training Since</Caption>
                      <Text className="font-medium">
                        {safeDate(athlete.created_at).toLocaleDateString('en-GB', {
                          month: 'long',
                          year: 'numeric'
                        })}
                      </Text>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 2. Athlete Training Background */}
            <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Training Background
                </div>
                {/* Show different actions based on onboarding status */}
                {trainingBackground && (trainingBackground.medical_conditions.length > 0 || trainingBackground.previous_injuries.length > 0) ? (
                    <Link
                    href={`/coach/${coachSlug}/athletes/${athlete.id}/onboarding`}
                    className="text-cirfpro-green-600 hover:text-cirfpro-green-700 text-sm font-medium"
                    >
                    View Details
                    </Link>
                ) : (
                    <Link
                    href={`/coach/${coachSlug}/athletes/${athlete.id}/onboarding`}
                    className="text-cirfpro-green-600 hover:text-cirfpro-green-700 text-sm font-medium"
                    >
                    Start Onboarding
                    </Link>
                )}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Check if we have meaningful training background data */}
                {trainingBackground && (
                trainingBackground.fitness_level || 
                trainingBackground.medical_conditions.length > 0 || 
                trainingBackground.previous_injuries.length > 0
                ) ? (
                /* COMPLETED/IN-PROGRESS ONBOARDING STATE */
                <>
                    {/* Basic Info Row */}
                    <div className="flex items-center justify-between p-4 bg-cirfpro-green-50 rounded-lg border border-cirfpro-green-100">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-cirfpro-green-500 rounded-full flex items-center justify-center">
                        <FileText className="w-4 h-4 text-white" />
                        </div>
                        <div>
                        <Text className="font-medium text-cirfpro-green-800">Onboarding Complete</Text>
                        <Caption className="text-cirfpro-green-600">Background assessment available</Caption>
                        </div>
                    </div>
                    <Link
                        href={`/coach/${coachSlug}/athletes/${athlete.id}/onboarding`}
                        className="text-cirfpro-green-600 hover:text-cirfpro-green-700 font-medium text-sm"
                    >
                        View Full Assessment →
                    </Link>
                    </div>

                    {/* Key Background Info Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Caption color="muted" className="mb-2">Experience Level</Caption>
                        {trainingBackground.fitness_level ? (
                        <Badge variant="info" className="capitalize">
                            {trainingBackground.fitness_level}
                        </Badge>
                        ) : (
                        <Text size="sm" color="muted">Not specified</Text>
                        )}
                    </div>
                    
                    {/* Show injury/medical summary if exists */}
                    {(trainingBackground.previous_injuries.length > 0 || trainingBackground.medical_conditions.length > 0) && (
                        <div>
                        <Caption color="muted" className="mb-2">Health Considerations</Caption>
                        <div className="flex flex-wrap gap-1">
                            {trainingBackground.previous_injuries.length > 0 && (
                            <Badge variant="warning" size="sm">
                                {trainingBackground.previous_injuries.length} injury history
                            </Badge>
                            )}
                            {trainingBackground.medical_conditions.length > 0 && (
                            <Badge variant="info" size="sm">
                                {trainingBackground.medical_conditions.length} medical condition(s)
                            </Badge>
                            )}
                        </div>
                        </div>
                    )}
                    </div>

                    {/* Quick Summary Lists */}
                    <div className="space-y-4">
                    {/* Previous Injuries Summary */}
                    {trainingBackground.previous_injuries.length > 0 && (
                        <div>
                        <Caption color="muted" className="mb-2">Recent Injury History</Caption>
                        <div className="bg-cirfpro-gray-50 rounded-lg p-3">
                            {trainingBackground.previous_injuries.slice(0, 2).map((injury, index) => (
                            <Text key={index} size="sm" className="block mb-1 last:mb-0">
                                • {injury}
                            </Text>
                            ))}
                            {trainingBackground.previous_injuries.length > 2 && (
                            <Text size="sm" color="muted" className="mt-2">
                                +{trainingBackground.previous_injuries.length - 2} more items
                            </Text>
                            )}
                        </div>
                        </div>
                    )}

                    {/* Medical Conditions Summary */}
                    {trainingBackground.medical_conditions.length > 0 && (
                        <div>
                        <Caption color="muted" className="mb-2">Medical Considerations</Caption>
                        <div className="bg-cirfpro-gray-50 rounded-lg p-3">
                            {trainingBackground.medical_conditions.slice(0, 2).map((condition, index) => (
                            <Text key={index} size="sm" className="block mb-1 last:mb-0">
                                • {condition}
                            </Text>
                            ))}
                            {trainingBackground.medical_conditions.length > 2 && (
                            <Text size="sm" color="muted" className="mt-2">
                                +{trainingBackground.medical_conditions.length - 2} more conditions
                            </Text>
                            )}
                        </div>
                        </div>
                    )}
                    </div>

                    {/* Action to view full onboarding */}
                    <div className="pt-4 border-t border-cirfpro-gray-100">
                    <Link
                        href={`/coach/${coachSlug}/athletes/${athlete.id}/onboarding`}
                        className="inline-flex items-center gap-2 text-cirfpro-green-600 hover:text-cirfpro-green-700 font-medium text-sm"
                    >
                        <FileText className="w-4 h-4" />
                        View Complete Assessment
                    </Link>
                    </div>
                </>
                ) : (
                /* NO ONBOARDING DATA STATE */
                <div className="text-center py-8">
                    <div className="w-16 h-16 bg-cirfpro-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-cirfpro-blue-600" />
                    </div>
                    
                    <Heading level="h4" className="mb-2">Onboarding Required</Heading>
                    <Text color="muted" className="mb-6 max-w-sm mx-auto">
                    Complete the athlete assessment to understand their background, goals, and training history.
                    </Text>

                    {/* Onboarding Benefits */}
                    <div className="bg-cirfpro-gray-50 rounded-lg p-4 mb-6 text-left">
                    <Caption className="font-medium mb-3 block">Assessment will collect:</Caption>
                    <ul className="space-y-2 text-sm text-cirfpro-gray-600">
                        <li className="flex items-start gap-2">
                        <div className="w-1 h-1 bg-cirfpro-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                        Training experience and fitness level
                        </li>
                        <li className="flex items-start gap-2">
                        <div className="w-1 h-1 bg-cirfpro-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                        Injury history and medical considerations
                        </li>
                        <li className="flex items-start gap-2">
                        <div className="w-1 h-1 bg-cirfpro-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                        Training preferences and availability
                        </li>
                        <li className="flex items-start gap-2">
                        <div className="w-1 h-1 bg-cirfpro-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                        Goals and motivation factors
                        </li>
                    </ul>
                    </div>

                    {/* Primary CTA */}
                    <Link
                    href={`/coach/${coachSlug}/athletes/${athlete.id}/onboarding`}
                    className="inline-flex items-center gap-2 bg-cirfpro-green-600 text-white px-6 py-3 rounded-lg hover:bg-cirfpro-green-700 transition-colors font-medium"
                    >
                    <FileText className="w-4 h-4" />
                    Begin Athlete Assessment
                    </Link>
                    
                    <Caption color="muted" className="mt-3 block">
                    Takes approximately 10-15 minutes
                    </Caption>
                </div>
                )}
            </CardContent>
            </Card>
            
            {/* 3. Athlete Training Plan */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Current Training Plan
                  </div>
                  {trainingPlan && (
                    <button className="text-cirfpro-green-600 hover:text-cirfpro-green-700 text-sm font-medium">
                      Edit Plan
                    </button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {trainingPlan && trainingPlan.total_weeks ? (
                  <div className="space-y-6">
                    <div>
                      <Heading level="h4" className="mb-2">{trainingPlan.name}</Heading>
                      <div className="flex items-center gap-4">
                        <Badge variant="success" size="sm" className="capitalize">
                          {trainingPlan.status}
                        </Badge>
                        <Badge variant={getPhaseColor(trainingPlan.phase_type)} size="sm" className="capitalize">
                          {trainingPlan.phase_type.replace('_', ' ')} phase
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Caption color="muted" className="mb-1">Plan Duration</Caption>
                        <Text size="sm" className="font-medium">
                          {trainingPlan.total_weeks} weeks
                        </Text>
                      </div>
                      <div>
                        <Caption color="muted" className="mb-1">Target Race</Caption>
                        <Text size="sm" className="font-medium">
                          {trainingPlan.goal_race_name || safeDate(trainingPlan.target_race_date).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short'
                          })}
                        </Text>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Caption color="muted">Plan Progress</Caption>
                        <Caption color="muted">
                          Week {trainingPlan.current_week} of {trainingPlan.total_weeks}
                        </Caption>
                      </div>
                      <div className="w-full bg-cirfpro-gray-200 rounded-full h-2">
                        <div 
                          className="bg-cirfpro-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(trainingPlan.current_week / trainingPlan.total_weeks) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-cirfpro-gray-100">
                      <div className="grid grid-cols-1 gap-3">
                        <Link
                          href={`/coach/${coachSlug}/athletes/${athlete.id}/plan`}
                          className="text-cirfpro-green-600 hover:text-cirfpro-green-700 text-sm font-medium"
                        >
                          View Full Training Plan →
                        </Link>
                        <Link
                          href={`/coach/${coachSlug}/athletes/${athlete.id}/schedule`}
                          className="text-cirfpro-green-600 hover:text-cirfpro-green-700 text-sm font-medium"
                        >
                          View Weekly Schedule →
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Text color="muted" className="mb-4">No training plan assigned</Text>
                    <button className="inline-flex items-center gap-2 bg-cirfpro-green-600 text-white px-6 py-3 rounded-lg hover:bg-cirfpro-green-700 transition-colors font-medium">
                      <Plus className="w-4 h-4" />
                      Create Training Plan
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 4. Training Plan Progress Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Progress Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                {progressStatus ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-cirfpro-blue-50 rounded-lg">
                        <Heading level="h3" color="brand" className="mb-1">
                          Week {progressStatus.current_week}
                        </Heading>
                        <Caption color="muted">Current Training Week</Caption>
                      </div>
                      <div className="text-center p-4 bg-cirfpro-green-50 rounded-lg">
                        <Heading level="h3" className="mb-1 text-cirfpro-green-600">
                          {progressStatus.weeks_until_race}
                        </Heading>
                        <Caption color="muted">Weeks Until Race</Caption>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Text size="sm" className="font-medium">This Week's Sessions</Text>
                        <Text size="sm" color="muted">
                          {progressStatus.this_week_completed}/{progressStatus.this_week_total}
                        </Text>
                      </div>
                      <div className="w-full bg-cirfpro-gray-200 rounded-full h-2">
                        <div 
                          className="bg-cirfpro-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(progressStatus.this_week_completed / progressStatus.this_week_total) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Caption color="muted" className="mb-1">Overall Compliance</Caption>
                        <Badge variant={getComplianceColor(progressStatus.compliance_rate)}>
                          {progressStatus.compliance_rate}%
                        </Badge>
                      </div>
                      <div>
                        <Caption color="muted" className="mb-1">Total Sessions</Caption>
                        <Text className="font-medium">
                          {progressStatus.completed_sessions}/{progressStatus.total_sessions}
                        </Text>
                      </div>
                    </div>

                    {progressStatus.last_activity_date && (
                      <div>
                        <Caption color="muted" className="mb-1">Last Training Session</Caption>
                        <Text size="sm">
                          {safeDate(progressStatus.last_activity_date).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'long',
                            weekday: 'short'
                          })}
                        </Text>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Text color="muted">No progress data available</Text>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 5. Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <button className="w-full flex items-center justify-center gap-2 bg-cirfpro-green-600 text-white px-4 py-3 rounded-lg hover:bg-cirfpro-green-700 transition-colors font-medium">
                  <Plus className="w-4 h-4" />
                  Add Training Session
                </button>
                <button className="w-full flex items-center justify-center gap-2 border border-cirfpro-gray-300 text-cirfpro-gray-700 px-4 py-3 rounded-lg hover:bg-cirfpro-gray-50 transition-colors">
                  <Calendar className="w-4 h-4" />
                  Schedule Check-in
                </button>
                <button className="w-full flex items-center justify-center gap-2 border border-cirfpro-gray-300 text-cirfpro-gray-700 px-4 py-3 rounded-lg hover:bg-cirfpro-gray-50 transition-colors">
                  <FileText className="w-4 h-4" />
                  Add Coach Notes
                </button>
                <Link
                  href={`/coach/${coachSlug}/athletes/${athlete.id}/communication`}
                  className="w-full flex items-center justify-center gap-2 border border-cirfpro-gray-300 text-cirfpro-gray-700 px-4 py-3 rounded-lg hover:bg-cirfpro-gray-50 transition-colors"
                >
                  <MapPin className="w-4 h-4" />
                  Send Message
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}