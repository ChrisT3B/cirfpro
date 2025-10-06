// src/components/athlete/PendingInvitationCard.tsx
'use client'

import { useState } from 'react'
import { Mail, Award, Briefcase, Clock, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Text } from '@/components/ui/Typography'
import InvitationAcceptanceModal from './InvitationAcceptanceModal'

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

interface PendingInvitationCardProps {
  invitation: PendingInvitation
  onAccepted: () => void
}

export default function PendingInvitationCard({ invitation, onAccepted }: PendingInvitationCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { coach } = invitation
  const expiresDate = new Date(invitation.expiresAt)
  const daysUntilExpiry = Math.ceil((expiresDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  const handleAcceptClick = () => {
    setIsModalOpen(true)
  }

  const handleAccepted = () => {
    setIsModalOpen(false)
    onAccepted()
  }

  return (
    <>
      <Card className="border-l-4 border-l-green-500 bg-gradient-to-r from-green-50 to-white">
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            {/* Coach Info */}
            <div className="flex items-start gap-4 flex-1">
              {/* Coach Photo */}
              <div className="flex-shrink-0">
                {coach.photoUrl ? (
                  <Image
                    src={coach.photoUrl}
                    alt={coach.name}
                    width={64}
                    height={64}
                    className="rounded-full border-2 border-green-200"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center border-2 border-green-200">
                    <span className="text-xl font-bold text-green-700">
                      {coach.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                )}
              </div>

              {/* Coach Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{coach.name}</h3>
                    <p className="text-sm text-gray-600 flex items-center mt-1">
                      <Mail className="w-3 h-3 mr-1" />
                      {coach.email}
                    </p>
                  </div>
                  
                  {/* Urgency Badge */}
                  <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                    daysUntilExpiry <= 2 
                      ? 'bg-red-100 text-red-700' 
                      : daysUntilExpiry <= 5 
                      ? 'bg-yellow-100 text-yellow-700' 
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    <Clock className="w-3 h-3" />
                    {daysUntilExpiry} {daysUntilExpiry === 1 ? 'day' : 'days'} left
                  </div>
                </div>

                {/* Personal Message */}
                {invitation.message && (
                  <div className="mb-3 p-3 bg-blue-50 border-l-2 border-blue-400 rounded">
                    <p className="text-sm text-blue-900 italic">"{invitation.message}"</p>
                  </div>
                )}

                {/* Coach Quick Info */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                  {coach.yearsExperience && (
                    <div className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4 text-green-600" />
                      <span>{coach.yearsExperience} years experience</span>
                    </div>
                  )}
                  {coach.qualifications && coach.qualifications.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Award className="w-4 h-4 text-green-600" />
                      <span>{coach.qualifications.length} qualification{coach.qualifications.length !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>

                {/* Qualifications Preview */}
                {coach.qualifications && coach.qualifications.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {coach.qualifications.slice(0, 3).map((qual, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium"
                      >
                        {qual}
                      </span>
                    ))}
                    {coach.qualifications.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                        +{coach.qualifications.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Action Button */}
                <Button
                  onClick={handleAcceptClick}
                  variant="primary"
                  className="w-full sm:w-auto"
                >
                  Review & Accept Invitation
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>

          {/* Invitation Details Footer */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Sent {new Date(invitation.sentAt).toLocaleDateString()}</span>
              <span>Expires {expiresDate.toLocaleDateString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Acceptance Modal */}
      {isModalOpen && (
        <InvitationAcceptanceModal
          invitation={invitation}
          onClose={() => setIsModalOpen(false)}
          onAccepted={handleAccepted}
        />
      )}
    </>
  )
}