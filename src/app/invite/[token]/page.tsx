// src/app/invite/[token]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserPlus, LogIn, Mail, Award, Briefcase, MapPin, DollarSign, Clock, XCircle } from 'lucide-react'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Text, Heading, Badge } from '@/components/ui/Typography'

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

  // Handler for creating new account
  const handleCreateAccount = () => {
    if (!validationData) return
    
    console.log('🔘 Create Account button clicked')
    console.log('📧 Email:', validationData.invitation.email)
    console.log('🎫 Token:', token)
    
    sessionStorage.setItem('pendingInvitationToken', token)
    router.push(`/auth/signup?email=${encodeURIComponent(validationData.invitation.email)}`)
  }

  // Handler for signing in existing users
  const handleSignIn = () => {
    if (!validationData) return
    
    console.log('🔘 Sign In button clicked')
    console.log('📧 Email:', validationData.invitation.email)
    console.log('🎫 Token:', token)
    
    sessionStorage.setItem('pendingInvitationToken', token)
    router.push(`/auth/signin?email=${encodeURIComponent(validationData.invitation.email)}`)
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-cirfpro-gray-50 flex items-center justify-center p-4">
        <Card variant="elevated" className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cirfpro-green-600 mx-auto mb-4" />
            <Text color="muted">Loading invitation...</Text>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (error || !validationData) {
    return (
      <div className="min-h-screen bg-cirfpro-gray-50 flex items-center justify-center p-4">
        <Card variant="elevated" className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <Heading level="h2" className="mb-2">Invalid Invitation</Heading>
            <Text color="muted" className="mb-6">
              {error || 'This invitation link is not valid or has expired.'}
            </Text>
            <Button 
              variant="secondary" 
              onClick={() => router.push('/')}
            >
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { invitation, coach } = validationData

  return (
    <div className="min-h-screen bg-cirfpro-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <Heading level="h1" className="mb-2">
            You're Invited to Train with a Professional Coach
          </Heading>
          <Text color="muted" size="lg">
            {coach.name} has invited you to join their coaching program
          </Text>
        </div>

        {/* Coach Profile Card */}
        <Card variant="elevated">
          <CardContent className="p-8">
            {/* Coach Header */}
            <div className="flex flex-col items-center mb-6">
              {/* Avatar */}
              <div className="relative w-24 h-24 rounded-full bg-cirfpro-gray-200 flex items-center justify-center overflow-hidden mb-4">
                {coach.photoUrl ? (
                  <Image
                    src={coach.photoUrl}
                    alt={coach.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <Briefcase className="h-10 w-10 text-cirfpro-gray-400" />
                )}
              </div>

              {/* Coach Name & Email */}
              <Heading level="h2" className="mb-1">
                {coach.name}
              </Heading>
              
              {coach.workspaceName && (
                <Text color="brand" weight="medium" className="mb-2">
                  {coach.workspaceName}
                </Text>
              )}
              
              <div className="flex items-center gap-2 text-cirfpro-gray-600">
                <Mail className="h-4 w-4" />
                <Text size="sm" color="muted">{coach.email}</Text>
              </div>
            </div>

            {/* Coach Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {coach.yearsExperience && (
                <div className="flex items-center gap-2 p-3 bg-cirfpro-gray-50 rounded-lg">
                  <Award className="h-5 w-5 text-cirfpro-green-600" />
                  <div>
                    <Text size="xs" color="muted" className="uppercase">Experience</Text>
                    <Text weight="semibold">{coach.yearsExperience} years</Text>
                  </div>
                </div>
              )}

              {coach.location && (
                <div className="flex items-center gap-2 p-3 bg-cirfpro-gray-50 rounded-lg">
                  <MapPin className="h-5 w-5 text-cirfpro-green-600" />
                  <div>
                    <Text size="xs" color="muted" className="uppercase">Location</Text>
                    <Text weight="semibold">{coach.location}</Text>
                  </div>
                </div>
              )}

              {coach.priceRange && (
                <div className="flex items-center gap-2 p-3 bg-cirfpro-gray-50 rounded-lg">
                  <DollarSign className="h-5 w-5 text-cirfpro-green-600" />
                  <div>
                    <Text size="xs" color="muted" className="uppercase">Price Range</Text>
                    <Text weight="semibold">{coach.priceRange}</Text>
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
                    <Badge key={index} variant="info" size="base">
                      {qual}
                    </Badge>
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
                    <Badge key={index} variant="brand" size="base">
                      {spec}
                    </Badge>
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
              <Card variant="accent" accentColor="green" className="mb-6">
                <CardContent className="p-4">
                  <Heading level="h3" className="mb-2">Personal Message</Heading>
                  <Text className="italic">"{invitation.message}"</Text>
                </CardContent>
              </Card>
            )}

            {/* Invitation Details Footer */}
            <div className="pt-6 border-t border-cirfpro-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-cirfpro-gray-400" />
                  <Text size="sm" color="muted">
                    Sent: {new Date(invitation.sentAt).toLocaleDateString()}
                  </Text>
                </div>
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
              // Existing user flow
              <div className="space-y-4">
                <Text className="mb-6" color="muted">
                  You already have an account with us! Sign in to accept this invitation and start training with {coach.name}.
                </Text>
                
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleSignIn}
                  className="w-full"
                >
                  <LogIn className="h-5 w-5 mr-2" />
                  Sign In to Accept Invitation
                </Button>
                
                <Text size="sm" color="muted" className="mt-4">
                  After signing in, you'll be able to accept this invitation
                </Text>
              </div>
            ) : (

          // New user flow
          <div className="space-y-4">
            <Text className="mb-6" color="muted">
              Create your account to accept this invitation and start your training journey with {coach.name}.
            </Text>
            
            <Button
              variant="primary"
              size="lg"
              onClick={handleCreateAccount}
              className="w-full"
            >
              <UserPlus className="h-5 w-5 mr-2" />
              Create Account & Accept
            </Button>
          </div>
        )}

          </CardContent>
        </Card>

        {/* Footer Note */}
        <div className="text-center pt-4">
          <Text size="sm" color="muted">
            By accepting this invitation, you agree to CIRFPRO's Terms of Service and Privacy Policy
          </Text>
        </div>
      </div>
    </div>
  )
}