// ================================================================
// FILE: src/components/coach/OnboardingNotificationBanner.tsx
// Notification banner for new athlete onboarding (US037)
// ================================================================

'use client'

import React from 'react'
import Link from 'next/link'
import { X, UserPlus, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Heading, Text, Badge } from '@/components/ui/Typography'
import type { AthleteNeedingOnboarding } from '@/types/manual-database-types'

interface OnboardingNotificationBannerProps {
  athletes: AthleteNeedingOnboarding[]
  coachSlug: string
  onDismiss: (relationshipId: string) => void
  onDismissAll?: () => void
}

/**
 * OnboardingNotificationBanner Component
 * 
 * Displays a prominent notification when new athletes accept invitations
 * and are ready for onboarding. Follows CIRFPRO design system patterns.
 * 
 * Features:
 * - Shows multiple athletes needing onboarding
 * - Dismissible per athlete or all at once
 * - Links to onboarding workflow
 * - Responsive design
 * - Uses CIRFPRO UI components
 */
export default function OnboardingNotificationBanner({
  athletes,
  coachSlug,
  onDismiss,
  onDismissAll
}: OnboardingNotificationBannerProps) {
  // Don't render if no athletes need onboarding
  if (!athletes || athletes.length === 0) {
    return null
  }

  // Single athlete banner
  if (athletes.length === 1) {
    const athlete = athletes[0]
    
    return (
      <Card variant="accent" accentColor="cirfpro-green" className="mb-6">
        <CardContent className="py-4">
          <div className="flex items-start justify-between gap-4">
            {/* Icon and Content */}
            <div className="flex items-start gap-3 flex-1">
              {/* Icon */}
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-cirfpro-green-100 flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-cirfpro-green-600" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <Heading level="h3" className="mb-1">
                  {athlete.athlete_name} accepted your invitation! 🎉
                </Heading>
                <Text size="sm" color="muted" className="mb-3">
                  Start their onboarding to set up training plans and goals.
                </Text>

                {/* Athlete Details */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {athlete.experience_level && (
                    <Badge variant="info" size="sm">
                      {athlete.experience_level}
                    </Badge>
                  )}
                  {athlete.goal_race_distance && (
                    <Badge variant="default" size="sm">
                      Goal: {athlete.goal_race_distance}
                    </Badge>
                  )}
                </div>

                {/* Action Button */}
                <Link
                  href={`/coach/${coachSlug}/athletes/${athlete.athlete_id}/onboarding`}
                  className="inline-flex items-center gap-2 bg-cirfpro-green-600 text-white px-4 py-2 rounded-lg hover:bg-cirfpro-green-700 transition-colors font-medium text-sm"
                >
                  Begin Onboarding
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Dismiss Button */}
            <button
              onClick={() => onDismiss(athlete.relationship_id)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors p-1"
              aria-label="Dismiss notification"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Multiple athletes banner
  return (
    <Card variant="accent" accentColor="cirfpro-green" className="mb-6">
      <CardContent className="py-4">
        <div className="flex items-start justify-between gap-4 mb-4">
          {/* Header */}
          <div className="flex items-start gap-3 flex-1">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-cirfpro-green-100 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-cirfpro-green-600" />
            </div>
            <div>
              <Heading level="h3" className="mb-1">
                {athletes.length} athletes accepted your invitations! 🎉
              </Heading>
              <Text size="sm" color="muted">
                Start their onboarding to set up training plans and goals.
              </Text>
            </div>
          </div>

          {/* Dismiss All Button */}
          {onDismissAll && (
            <button
              onClick={onDismissAll}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors p-1"
              aria-label="Dismiss all notifications"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Athlete List */}
        <div className="space-y-3 ml-13">
          {athletes.map((athlete) => (
            <div
              key={athlete.relationship_id}
              className="flex items-center justify-between gap-4 p-3 bg-gray-50 rounded-lg"
            >
              {/* Athlete Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Text weight="medium">{athlete.athlete_name}</Text>
                  {athlete.experience_level && (
                    <Badge variant="info" size="sm">
                      {athlete.experience_level}
                    </Badge>
                  )}
                </div>
                {athlete.goal_race_distance && (
                  <Text size="sm" color="muted">
                    Goal: {athlete.goal_race_distance}
                  </Text>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Link
                  href={`/coach/${coachSlug}/athletes/${athlete.athlete_id}/onboarding`}
                  className="inline-flex items-center gap-1 bg-cirfpro-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-cirfpro-green-700 transition-colors font-medium"
                >
                  Start Onboarding
                  <ArrowRight className="w-3 h-3" />
                </Link>
                <button
                  onClick={() => onDismiss(athlete.relationship_id)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                  aria-label={`Dismiss ${athlete.athlete_name}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}