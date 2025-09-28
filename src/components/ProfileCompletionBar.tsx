// src/components/ProfileCompletionBar.tsx
'use client'

import React from 'react'
import { CheckCircle, AlertCircle, Clock } from 'lucide-react'
import { Heading, Text } from '@/components/ui/Typography'
import { Card, CardContent } from '@/components/ui/Card'

interface CoachProfile {
  profile_photo_url: string | null
  coaching_philosophy: string | null
  years_experience: number | null
  coaching_location: string | null
  availability_status: string
  qualifications: string[] | null
  specializations: string[] | null
  workspace_name: string | null
  price_range: string | null
}

interface ProfileCompletionBarProps {
  profile: CoachProfile
  onEditClick: () => void
  className?: string
}

interface CompletionItem {
  key: string
  label: string
  completed: boolean
  priority: 'required' | 'recommended'
  description: string
}

const ProfileCompletionBar: React.FC<ProfileCompletionBarProps> = ({ 
  profile, 
  onEditClick, 
  className = '' 
}) => {
  const completionItems: CompletionItem[] = [
    {
      key: 'profile_photo',
      label: 'Profile Photo',
      completed: !!profile.profile_photo_url,
      priority: 'required',
      description: 'Professional photo helps athletes connect with you'
    },
    {
      key: 'coaching_philosophy',
      label: 'Coaching Philosophy',
      completed: !!profile.coaching_philosophy && profile.coaching_philosophy.length >= 50,
      priority: 'required',
      description: 'Minimum 50 characters describing your approach'
    },
    {
      key: 'experience',
      label: 'Years of Experience',
      completed: !!profile.years_experience && profile.years_experience > 0,
      priority: 'required',
      description: 'Your coaching experience helps establish credibility'
    },
    {
      key: 'location',
      label: 'Coaching Location',
      completed: !!profile.coaching_location,
      priority: 'required',
      description: 'Where you provide coaching services'
    },
    {
      key: 'qualifications',
      label: 'Qualifications',
      completed: !!profile.qualifications && profile.qualifications.length >= 2,
      priority: 'required',
      description: 'Minimum 2 coaching qualifications required'
    },
    {
      key: 'specializations',
      label: 'Specializations',
      completed: !!profile.specializations && profile.specializations.length >= 1,
      priority: 'required',
      description: 'At least 1 coaching specialization area'
    },
    {
      key: 'workspace_name',
      label: 'Professional Name',
      completed: !!profile.workspace_name,
      priority: 'recommended',
      description: 'Professional name for your coaching practice'
    },
    {
      key: 'price_range',
      label: 'Price Range',
      completed: !!profile.price_range,
      priority: 'recommended',
      description: 'Helps athletes understand your pricing'
    }
  ]

  const requiredItems = completionItems.filter(item => item.priority === 'required')
  const recommendedItems = completionItems.filter(item => item.priority === 'recommended')
  
  const requiredCompleted = requiredItems.filter(item => item.completed).length
  const totalRequired = requiredItems.length
  const isEligibleForDirectory = requiredCompleted === totalRequired

  const recommendedCompleted = recommendedItems.filter(item => item.completed).length
  const totalRecommended = recommendedItems.length

  const overallCompletion = Math.round(
    ((requiredCompleted + recommendedCompleted) / (totalRequired + totalRecommended)) * 100
  )

  const getStatusIcon = () => {
    if (isEligibleForDirectory && recommendedCompleted === totalRecommended) {
      return <CheckCircle className="w-5 h-5 text-green-600" />
    } else if (isEligibleForDirectory) {
      return <CheckCircle className="w-5 h-5 text-blue-600" />
    } else {
      return <AlertCircle className="w-5 h-5 text-orange-500" />
    }
  }

  const getStatusMessage = () => {
    if (isEligibleForDirectory && recommendedCompleted === totalRecommended) {
      return {
        title: 'Profile Complete!',
        message: 'Your profile is complete and optimized for the public directory.',
        color: 'text-green-700'
      }
    } else if (isEligibleForDirectory) {
      return {
        title: 'Directory Ready',
        message: 'Your profile meets minimum requirements for the public directory.',
        color: 'text-blue-700'
      }
    } else {
      return {
        title: 'Profile Incomplete',
        message: `Complete ${totalRequired - requiredCompleted} more required items to appear in public directory.`,
        color: 'text-orange-700'
      }
    }
  }

  const status = getStatusMessage()

  return (
    <Card className={`${className}`} variant="default">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {getStatusIcon()}
            <div>
              <Heading level="h3" className="mb-1">
                {status.title}
              </Heading>
              <Text size="sm" className={status.color}>
                {status.message}
              </Text>
            </div>
          </div>
          <button
            onClick={onEditClick}
            className="bg-cirfpro-green-500 text-white px-4 py-2 rounded-lg hover:bg-cirfpro-green-600 transition-colors font-medium text-sm"
          >
            Edit Profile
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <Text size="sm" weight="medium">
              Overall Progress
            </Text>
            <Text size="sm" color="muted">
              {overallCompletion}%
            </Text>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-cirfpro-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${overallCompletion}%` }}
            />
          </div>
        </div>

        {/* Required Items Status */}
        <div className="space-y-3">
          <div>
            <Text size="sm" weight="semibold" className="flex items-center space-x-2 mb-2">
              <span>Required for Directory ({requiredCompleted}/{totalRequired})</span>
              {isEligibleForDirectory && <CheckCircle className="w-4 h-4 text-green-600" />}
            </Text>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {requiredItems.map(item => (
                <div 
                  key={item.key}
                  className="flex items-center space-x-2 text-sm"
                >
                  {item.completed ? (
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  ) : (
                    <Clock className="w-4 h-4 text-orange-500 flex-shrink-0" />
                  )}
                  <span className={item.completed ? 'text-gray-700' : 'text-orange-700'}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Items Status */}
          <div>
            <Text size="sm" weight="semibold" className="mb-2">
              Recommended ({recommendedCompleted}/{totalRecommended})
            </Text>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {recommendedItems.map(item => (
                <div 
                  key={item.key}
                  className="flex items-center space-x-2 text-sm"
                >
                  {item.completed ? (
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  ) : (
                    <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  )}
                  <span className={item.completed ? 'text-gray-700' : 'text-gray-500'}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Directory Status */}
          {isEligibleForDirectory && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <Text size="sm" weight="medium" color="success">
                ✓ Your profile is live in the public coach directory
              </Text>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default ProfileCompletionBar