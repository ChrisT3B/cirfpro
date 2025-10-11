// src/components/coach/DashboardAthletesSection.tsx
'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Plus } from 'lucide-react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Heading, Text } from '@/components/ui/Typography'
import AthletesCarousel from './AthletesCarousel'

interface Athlete {
  id: string
  first_name: string
  last_name: string
  email: string
  experience_level: string
  goal_race_distance: string | null
  created_at: string
}

interface DashboardAthletesSectionProps {
  athletes: Athlete[]
  coachSlug: string
  onInviteClick: () => void
}

export default function DashboardAthletesSection({ 
  athletes, 
  coachSlug, 
  onInviteClick 
}: DashboardAthletesSectionProps) {
  const [sectionOpen, setSectionOpen] = useState(true)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSectionOpen(!sectionOpen)}
            className="flex items-center gap-2 text-left flex-1"
          >
            <CardTitle>Your Athletes ({athletes.length})</CardTitle>
            {sectionOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          
          {/* Action buttons */}
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={onInviteClick}
              className="flex items-center gap-2 bg-cirfpro-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-cirfpro-green-700 transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Invite
            </button>
            
            {athletes.length > 0 && (
              <Link
                href={`/coach/${coachSlug}/athletes`}
                className="text-cirfpro-green-600 hover:text-cirfpro-green-700 text-sm font-medium px-3 py-1.5"
              >
                Manage All
              </Link>
            )}
          </div>
        </div>
      </CardHeader>
      
      {sectionOpen && (
        <CardContent className="pt-0">
          {athletes.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-cirfpro-gray-100 rounded-full flex items-center justify-center">
                <Plus className="w-8 h-8 text-cirfpro-gray-400" />
              </div>
              <Heading level="h3" color="muted" className="mb-2">
                No Athletes Yet
              </Heading>
              <Text color="muted" className="mb-4">
                Start building your coaching practice by inviting athletes
              </Text>
              <button
                onClick={onInviteClick}
                className="bg-cirfpro-green-600 text-white px-6 py-3 rounded-lg hover:bg-cirfpro-green-700 transition-colors font-medium"
              >
                Invite Your First Athlete
              </button>
            </div>
          ) : (
            <>
              {/* Athletes Carousel - This replaces the old list */}
              <AthletesCarousel athletes={athletes} coachSlug={coachSlug} />
              
              {/* Summary info below carousel */}
              {athletes.length > 0 && (
                <div className="mt-6 pt-4 border-t border-cirfpro-gray-100">
                  <div className="flex items-center justify-between text-sm">
                    <Text color="muted">
                      {athletes.length} athlete{athletes.length === 1 ? '' : 's'} in your program
                    </Text>
                    <Link
                      href={`/coach/${coachSlug}/athletes`}
                      className="text-cirfpro-green-600 hover:text-cirfpro-green-700 font-medium"
                    >
                      View all athletes →
                    </Link>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      )}
    </Card>
  )
}