// src/app/coach/[slug]/athletes/[athleteId]/onboarding/PersonalDetailsTab.tsx
'use client'

import React, { ChangeEvent } from 'react'
import type { AssessmentPersonalDetailsInsert } from '@/types/manual-database-types'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Badge, Label } from '@/components/ui/Typography' // adjust path if Badge is exported differently
import { CheckCircle } from 'lucide-react'

type Mode = 'view' | 'edit'

export interface PersonalDetailsTabProps {
  personalDetails: Partial<AssessmentPersonalDetailsInsert>
  setPersonalDetails: React.Dispatch<React.SetStateAction<Partial<AssessmentPersonalDetailsInsert>>>
  mode: Mode
  isLocked?: boolean
  onBlurSave?: () => Promise<void> | void
}

const validators = {
  age: (v: any) => {
    if (v === undefined || v === null || v === '') return undefined
    return Number.isFinite(Number(v)) ? undefined : 'Age must be numeric'
  },
  standing_height_cm: (v: any) => {
    if (v === undefined || v === null || v === '') return undefined
    return Number.isFinite(Number(v)) ? undefined : 'Height must be numeric (cm)'
  },
  days_per_week_available: (v: any) => {
    if (v === undefined || v === null || v === '') return undefined
    const n = Number(v)
    if (!Number.isFinite(n)) return 'Enter 0–7'
    if (n < 0 || n > 7) return 'Enter 0–7'
    return undefined
  },
}

const TRAINING_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export const PersonalDetailsTab: React.FC<PersonalDetailsTabProps> = ({
  personalDetails,
  setPersonalDetails,
  mode,
  isLocked = false,
  onBlurSave,
}) => {
  const readonly = mode === 'view' || isLocked

  const updateField = <K extends keyof AssessmentPersonalDetailsInsert>(
    key: K,
    value: AssessmentPersonalDetailsInsert[K] | undefined
  ) => {
    setPersonalDetails((prev) => ({ ...(prev ?? {}), [key]: value }))
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const name = e.target.name as keyof AssessmentPersonalDetailsInsert
    const value =
      (e.target as HTMLInputElement).type === 'number'
        ? (e.target.value === '' ? undefined : Number(e.target.value))
        : e.target.value
    updateField(name, value as any)
  }

  const handleBlurMaybeSave = async () => {
    if (onBlurSave) await onBlurSave()
  }

  const togglePreferredDay = (day: string, checked: boolean) => {
    setPersonalDetails((prev) => {
      const existing = (prev?.preferred_training_days ?? []) as string[]
      const set = new Set(existing)
      if (checked) set.add(day)
      else set.delete(day)
      return { ...(prev ?? {}), preferred_training_days: Array.from(set) }
    })
  }

  // Validation
  const ageError = validators.age(personalDetails.age)
  const heightError = validators.standing_height_cm(personalDetails.standing_height_cm)
  const daysError = validators.days_per_week_available(personalDetails.days_per_week_available)

  // Completion heuristic
  const personalComplete =
    Boolean(personalDetails.athlete_name?.trim()) &&
    personalDetails.age !== undefined &&
    personalDetails.days_per_week_available !== undefined

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Personal Details</CardTitle>
          {personalComplete ? (
            <Badge variant="success" className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4" /> Complete
            </Badge>
          ) : (
            <Badge variant="info">In progress</Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="athlete_name">Athlete name</Label>
            <Input
              id="athlete_name"
              name="athlete_name"
              value={personalDetails.athlete_name ?? ''}
              disabled={readonly}
              onChange={handleInputChange}
              onBlur={handleBlurMaybeSave}
            />
          </div>

          <div>
            <Label htmlFor="gender">Gender</Label>
            <Input
              id="gender"
              name="gender"
              value={personalDetails.gender ?? ''}
              disabled={readonly}
              onChange={handleInputChange}
              onBlur={handleBlurMaybeSave}
            />
          </div>

          <div>
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              name="age"
              type="number"
              value={personalDetails.age ?? ''}
              disabled={readonly}
              onChange={handleInputChange}
              onBlur={handleBlurMaybeSave}
            />
            {ageError && <p className="text-xs text-red-600 mt-1">{ageError}</p>}
          </div>

          <div>
            <Label htmlFor="standing_height_cm">Standing height (cm)</Label>
            <Input
              id="standing_height_cm"
              name="standing_height_cm"
              type="number"
              value={personalDetails.standing_height_cm ?? ''}
              disabled={readonly}
              onChange={handleInputChange}
              onBlur={handleBlurMaybeSave}
            />
            {heightError && <p className="text-xs text-red-600 mt-1">{heightError}</p>}
          </div>

          <div>
            <Label htmlFor="current_status">Current status</Label>
            <Input
              id="current_status"
              name="current_status"
              value={personalDetails.current_status ?? ''}
              disabled={readonly}
              onChange={handleInputChange}
              onBlur={handleBlurMaybeSave}
            />
          </div>

          <div>
            <Label htmlFor="hours_per_week_education_employment">Hours per week (education/employment)</Label>
            <Input
              id="hours_per_week_education_employment"
              name="hours_per_week_education_employment"
              type="number"
              value={personalDetails.hours_per_week_education_employment ?? ''}
              disabled={readonly}
              onChange={handleInputChange}
              onBlur={handleBlurMaybeSave}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="major_life_events_this_year">Major life events this year</Label>

          {/* Native textarea (styled to match Input) */}
          <textarea
            id="major_life_events_this_year"
            name="major_life_events_this_year"
            value={personalDetails.major_life_events_this_year ?? ''}
            disabled={readonly}
            onChange={handleInputChange}
            onBlur={handleBlurMaybeSave}
            className="w-full rounded-md border border-neutral-200 px-3 py-2 min-h-[80px] focus:outline-none focus:ring-2 focus:ring-cirfpro-green"
          />
        </div>

        <div>
          <Label htmlFor="days_per_week_available">Days per week available (0–7)</Label>
          <Input
            id="days_per_week_available"
            name="days_per_week_available"
            type="number"
            value={personalDetails.days_per_week_available ?? ''}
            disabled={readonly}
            onChange={handleInputChange}
            onBlur={handleBlurMaybeSave}
          />
          {daysError && <p className="text-xs text-red-600 mt-1">{daysError}</p>}
        </div>

        <div>
          <Label>Preferred training days</Label>
          <div className="flex flex-wrap gap-3 mt-2">
            {TRAINING_DAYS.map((d) => {
              const selected = (personalDetails.preferred_training_days ?? []).includes(d)
              return (
                <label key={d} className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selected}
                    disabled={readonly}
                    onChange={(e) => togglePreferredDay(d, e.target.checked)}
                    onBlur={handleBlurMaybeSave}
                  />
                  <span className="text-sm">{d}</span>
                </label>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default PersonalDetailsTab
