'use client'

import { useState, useEffect, ChangeEvent } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Badge, Label } from '@/components/ui/Typography'
import { CheckCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { updateAthleteAssessment } from '@/lib/assessment-queries'

interface TrainingBackgroundTabProps {
  athleteId: string
  initialData?: {
    otherActivities?: string
    activityFrequency?: string
    activityDuration?: string
    activityLevel?: string
    runningExperienceYears?: string
    previousStructure?: string
    weeklyMileage?: string
    raceExperience?: string
    injuries?: string
    currentInjuries?: string
    recoveryStatus?: string
    medicalClearance?: string
  }
  isLocked?: boolean
}

export default function TrainingBackgroundTab({
  athleteId,
  initialData,
  isLocked = false,
}: TrainingBackgroundTabProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState(initialData || {})
  const [isSaving, setIsSaving] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  // Auto-completion tracking
  useEffect(() => {
    const requiredFields = [
      'runningExperienceYears',
      'previousStructure',
      'weeklyMileage',
    ]
    setIsComplete(requiredFields.every((f) => !!formData[f as keyof typeof formData]))
  }, [formData])

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleBlur = async () => {
    setIsSaving(true)
    try {
      await updateAthleteAssessment(athleteId, formData)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className="w-full max-w-3xl bg-cirfpro-dark border-cirfpro-gray-700 shadow-lg rounded-2xl">
      <CardHeader className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CardTitle className="text-lg font-semibold text-cirfpro-gray-50">
            Training Background
          </CardTitle>
          {isComplete && (
            <Badge variant="success" className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4" /> Complete
            </Badge>
          )}
        </div>
        {isSaving && (
          <Badge variant="info" className="animate-pulse">
            Saving...
          </Badge>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Other Activities */}
        <div>
          <Label htmlFor="otherActivities">Other Physical Activities</Label>
          <Input
            id="otherActivities"
            name="otherActivities"
            value={formData.otherActivities || ''}
            disabled={isLocked}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="List regular sports, training, etc."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="activityFrequency">Frequency</Label>
            <Input
              id="activityFrequency"
              name="activityFrequency"
              value={formData.activityFrequency || ''}
              disabled={isLocked}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g., 2–3 days/week"
            />
          </div>
          <div>
            <Label htmlFor="activityDuration">Duration</Label>
            <Input
              id="activityDuration"
              name="activityDuration"
              value={formData.activityDuration || ''}
              disabled={isLocked}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g., 60–90 mins"
            />
          </div>
          <div>
            <Label htmlFor="activityLevel">Level</Label>
            <Input
              id="activityLevel"
              name="activityLevel"
              value={formData.activityLevel || ''}
              disabled={isLocked}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g., recreational / competitive"
            />
          </div>
        </div>

        {/* Running Experience */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="runningExperienceYears">Years of Running Experience</Label>
            <Input
              id="runningExperienceYears"
              name="runningExperienceYears"
              value={formData.runningExperienceYears || ''}
              disabled={isLocked}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g., 3 years"
            />
          </div>
          <div>
            <Label htmlFor="previousStructure">Previous Training Structure</Label>
            <Input
              id="previousStructure"
              name="previousStructure"
              value={formData.previousStructure || ''}
              disabled={isLocked}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="None / Casual / Club / Coached"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="weeklyMileage">Typical Weekly Mileage / Volume</Label>
          <Input
            id="weeklyMileage"
            name="weeklyMileage"
            value={formData.weeklyMileage || ''}
            disabled={isLocked}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="e.g., 25 km/week"
          />
        </div>

        {/* Race Experience */}
        <div>
          <Label htmlFor="raceExperience">Race Experience / Best Times</Label>
          <Input
            id="raceExperience"
            name="raceExperience"
            value={formData.raceExperience || ''}
            disabled={isLocked}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="e.g., 5k – 22:30, 10k – 48:00"
          />
        </div>

        {/* Injuries */}
        <div>
          <Label htmlFor="injuries">Previous Injuries</Label>
          <Input
            id="injuries"
            name="injuries"
            value={formData.injuries || ''}
            disabled={isLocked}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="List any significant past injuries"
          />
        </div>

        <div>
          <Label htmlFor="currentInjuries">Current Injuries / Limitations</Label>
          <Input
            id="currentInjuries"
            name="currentInjuries"
            value={formData.currentInjuries || ''}
            disabled={isLocked}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="e.g., recovering ankle sprain"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="recoveryStatus">Recovery Status</Label>
            <Input
              id="recoveryStatus"
              name="recoveryStatus"
              value={formData.recoveryStatus || ''}
              disabled={isLocked}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g., cleared / in rehab"
            />
          </div>
          <div>
            <Label htmlFor="medicalClearance">Medical Clearance</Label>
            <Input
              id="medicalClearance"
              name="medicalClearance"
              value={formData.medicalClearance || ''}
              disabled={isLocked}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g., yes / pending"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
