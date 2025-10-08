// src/app/invite/[token]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { UserPlus, LogIn, Mail, Award, Briefcase, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Text, Heading } from '@/components/ui/Typography'

interface InvitationData {
  valid: boolean
  userExists: boolean
  existingUserId?: string | null
  invitation: {
    email: string
    message: string | null
    expiresAt: string
    sentAt: string
  }
  coach: {
    userId: string
    name: string
    workspaceName: string | null
    workspaceSlug: string
    email: string
    photoUrl: string | null
    bio: string | null
    philosophy: string | null
    yearsExperience: number | null
    location: string | null
    priceRange: string | null
    availabilityStatus: string | null
    qualifications: string[]
    specializations: string[]
  }
}

export default function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const router = useRouter()
  const [token, setToken] = useState<string>('')
  const [validationData, setValidationData] = useState<InvitationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Extract token from params
  useEffect(() => {
    async function extractToken() {
      const resolvedParams = await params
      setToken(resolvedParams.token)
    }
    extractToken()
  }, [params])

  // Validate invitation when token is available
  useEffect(() => {
    if (!token) return

    async function validateInvitation() {
      try {
        console.log('🔍 Validating invitation:', token)
        const response = await fetch(`/api/invitations/validate/${token}`)
        const data = await response.json()

        console.log('📋 Validation response:', data)

        if (!response.ok || !data.valid) {
          setError(data.error || 'Invalid invitation')
        } else {
          setValidationData(data)
        }
      } catch (err) {
        console.error('❌ Error validating invitation:', err)
        setError('Failed to load invitation details')
      } finally {
        setLoading(false)
      }
    }

    validateInvitation()
  }, [token])

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <Text color="muted">Loading invitation...</Text>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !validationData) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-md mx-auto">
          <Card variant="elevated">
            <CardContent className="p-8 text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <Heading level="h2" className="mb-2">Invalid Invitation</Heading>
              <Text color="muted" className="mb-6">
                {error || 'This invitation link is not valid or has expired.'}
              </Text>
              <Button variant="secondary" onClick={() => router.push('/')}>
                Go to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const { coach, invitation } = validationData

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Heading level="h1" className="mb-2">
            Coaching Invitation
          </Heading>
          <Text size="lg" color="muted">
            You've been invited to train with a CiRF certified coach
          </Text>
        </div>

        {/* Coach Profile Card */}
        <Card variant="elevated" className="mb-6">
          <CardContent className="p-8">
            {/* Coach Header */}
            <div className="flex items-center space-x-4 mb-6">
              {coach.photoUrl ? (
                <Image
                  src={coach.photoUrl}
                  alt={coach.name}
                  width={80}
                  height={80}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-semibold text-green-600">
                    {coach.name.charAt(0)}
                  </span>
                </div>
              )}
              <div>
                <Heading level="h2">{coach.workspaceName || coach.name}</Heading>
                <Text color="muted">{coach.email}</Text>
              </div>
            </div>

            {/* Coach Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Experience */}
              {coach.yearsExperience && (
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <Award className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <Text size="sm" weight="semibold" className="text-gray-900">
                      Experience
                    </Text>
                    <Text size="sm" color="muted">
                      {coach.yearsExperience} years coaching
                    </Text>
                  </div>
                </div>
              )}

              {/* Location */}
              {coach.location && (
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <Mail className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <Text size="sm" weight="semibold" className="text-gray-900">
                      Location
                    </Text>
                    <Text size="sm" color="muted">
                      {coach.location}
                    </Text>
                  </div>
                </div>
              )}

              {/* Availability */}
              {coach.availabilityStatus && (
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <Text size="sm" weight="semibold" className="text-gray-900">
                      Availability
                    </Text>
                    <Text size="sm" color="muted">
                      {coach.availabilityStatus === 'available' && 'Accepting new athletes'}
                      {coach.availabilityStatus === 'limited' && 'Limited availability'}
                      {coach.availabilityStatus === 'unavailable' && 'Not accepting new athletes'}
                    </Text>
                  </div>
                </div>
              )}

              {/* Price Range */}
              {coach.priceRange && (
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <Briefcase className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <Text size="sm" weight="semibold" className="text-gray-900">
                      Pricing
                    </Text>
                    <Text size="sm" color="muted">
                      {coach.priceRange}
                    </Text>
                  </div>
                </div>
              )}
            </div>

            {/* Qualifications */}
            {coach.qualifications && coach.qualifications.length > 0 && (
              <div className="mb-6">
                <Heading level="h3" className="mb-3">Qualifications</Heading>
                <div className="flex flex-wrap gap-2">
                  {coach.qualifications.map((qual, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                    >
                      {qual}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Specializations */}
            {coach.specializations && coach.specializations.length > 0 && (
              <div className="mb-6">
                <Heading level="h3" className="mb-3">Specializations</Heading>
                <div className="flex flex-wrap gap-2">
                  {coach.specializations.map((spec, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Bio */}
            {coach.bio && (
              <div className="mb-6">
                <Heading level="h3" className="mb-2">About</Heading>
                <Text color="muted">{coach.bio}</Text>
              </div>
            )}

            {/* Coaching Philosophy */}
            {coach.philosophy && (
              <div className="mb-6">
                <Heading level="h3" className="mb-2">Coaching Philosophy</Heading>
                <Text color="muted">{coach.philosophy}</Text>
              </div>
            )}

            {/* Personal Message */}
            {invitation.message && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <Heading level="h3" className="mb-2">Personal Message</Heading>
                <Text className="italic">"{invitation.message}"</Text>
              </div>
            )}

            {/* Invitation Details */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <Text size="sm" color="muted">
                  Sent: {new Date(invitation.sentAt).toLocaleDateString()}
                </Text>
                <Text size="sm" color="muted">
                  Expires: {new Date(invitation.expiresAt).toLocaleDateString()}
                </Text>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action Card */}
        <Card variant="elevated">
          <CardContent className="p-8 text-center">
            <Heading level="h3" className="mb-4">
              Ready to start your coaching journey?
            </Heading>
            
            {validationData.userExists ? (
              // User already has an account
              <div className="space-y-4">
                <Text className="mb-6" color="muted">
                  You already have an account with us! Sign in to accept this invitation and start training with {coach.name}.
                </Text>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => router.push(`/login?email=${encodeURIComponent(invitation.email)}&redirect=/invite/${token}`)}
                  className="w-full"
                >
                  <LogIn className="h-5 w-5 mr-2" />
                  Sign In to Accept Invitation
                </Button>
                <Text size="sm" color="muted" className="mt-4">
                  After signing in, you'll be redirected back to accept this invitation
                </Text>
              </div>
            ) : (
              // New user - needs to create account
              <div className="space-y-4">
                <Text className="mb-6" color="muted">
                  Create your account to accept this invitation and start your training journey with {coach.name}.
                </Text>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => router.push(`/signup?email=${encodeURIComponent(invitation.email)}&inviteToken=${token}`)}
                  className="w-full"
                >
                  <UserPlus className="h-5 w-5 mr-2" />
                  Create Account & Accept Invitation
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">or</span>
                  </div>
                </div>
                
                <Text size="sm" color="muted">
                  Already have an account?{' '}
                  <button
                    onClick={() => router.push(`/login?email=${encodeURIComponent(invitation.email)}&redirect=/invite/${token}`)}
                    className="text-cirfpro-green-600 hover:text-cirfpro-green-700 font-medium underline"
                  >
                    Sign in here
                  </button>
                </Text>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer Note */}
        <Text size="sm" color="muted" align="center" className="mt-6">
          By accepting this invitation, you agree to CIRFPRO's Terms of Service and Privacy Policy
        </Text>
      </div>
    </div>
  )
}