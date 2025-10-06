// src/app/invite/[token]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { UserPlus, LogIn, Mail, Award, Briefcase, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react'
import Image from 'next/image'

interface InvitationData {
  valid: boolean
  invitation: {
    id: string
    email: string
    message: string | null
    status: string
    expiresAt: string
    sentAt: string
    isExpired: boolean
    isAccepted: boolean
    isCancelled: boolean
  }
  coach: {
    name: string
    firstName: string
    lastName: string
    email: string
    photoUrl: string | null
    qualifications: string[]
    specializations: string[]
    philosophy: string | null
    yearsExperience: number | null
    workspaceSlug: string
  }
  hasAccount: boolean
  existingUserRole: string | null
}

export default function InvitationPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [loading, setLoading] = useState(true)
  const [invitationData, setInvitationData] = useState<InvitationData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function validateInvitation() {
      try {
        const response = await fetch(`/api/invitations/validate/${token}`)
        const data = await response.json()

        if (!response.ok || !data.valid) {
          setError(data.error || 'Invalid invitation')
          setInvitationData(data)
        } else {
          setInvitationData(data)
        }
      } catch (err) {
        console.error('Error validating invitation:', err)
        setError('Failed to load invitation details')
      } finally {
        setLoading(false)
      }
    }

    validateInvitation()
  }, [token])

  const handleCreateAccount = () => {
    // Store token in sessionStorage to retrieve after signup
    sessionStorage.setItem('pendingInvitationToken', token)
    router.push(`/auth/signup?email=${encodeURIComponent(invitationData?.invitation.email || '')}&redirect=athlete-dashboard`)
  }

  const handleSignIn = () => {
    // Store token in sessionStorage to retrieve after signin
    sessionStorage.setItem('pendingInvitationToken', token)
    router.push(`/auth/signin?redirect=athlete-dashboard`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading invitation...</p>
        </div>
      </div>
    )
  }

  // Error states
  if (error || !invitationData?.valid) {
    const invitation = invitationData?.invitation

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center">
            {invitation?.isExpired ? (
              <>
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Invitation Expired</h2>
                <p className="text-gray-600 mb-6">
                  This invitation expired on {new Date(invitation.expiresAt).toLocaleDateString()}.
                  Please contact your coach to receive a new invitation.
                </p>
              </>
            ) : invitation?.isAccepted ? (
              <>
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Already Accepted</h2>
                <p className="text-gray-600 mb-6">
                  This invitation has already been accepted. Please sign in to access your dashboard.
                </p>
                <button
                  onClick={() => router.push('/auth/signin')}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Sign In
                </button>
              </>
            ) : invitation?.isCancelled ? (
              <>
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Invitation Cancelled</h2>
                <p className="text-gray-600 mb-6">
                  This invitation has been cancelled by the coach.
                </p>
              </>
            ) : (
              <>
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Invitation</h2>
                <p className="text-gray-600 mb-6">
                  {error || 'This invitation link is not valid. Please check the link or contact your coach.'}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  const { coach, invitation, hasAccount, existingUserRole } = invitationData

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Coach Invitation</h1>
          <p className="text-gray-600">You've been invited to join a professional coaching program</p>
        </div>

        {/* Coach Profile Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          {/* Coach Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 p-8 text-white">
            <div className="flex items-center space-x-6">
              {coach.photoUrl ? (
                <Image
                  src={coach.photoUrl}
                  alt={coach.name}
                  width={80}
                  height={80}
                  className="rounded-full border-4 border-white"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center border-4 border-white">
                  <span className="text-3xl font-bold">
                    {coach.firstName[0]}{coach.lastName[0]}
                  </span>
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-1">{coach.name}</h2>
                <p className="text-green-100 flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  {coach.email}
                </p>
              </div>
            </div>
          </div>

          {/* Coach Details */}
          <div className="p-8">
            {invitation.message && (
              <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                <p className="text-sm font-medium text-blue-900 mb-1">Personal Message:</p>
                <p className="text-blue-800 italic">"{invitation.message}"</p>
              </div>
            )}

            <div className="space-y-6">
              {/* Experience */}
              {coach.yearsExperience && (
                <div className="flex items-start space-x-3">
                  <Briefcase className="w-5 h-5 text-green-600 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900">Experience</p>
                    <p className="text-gray-600">{coach.yearsExperience} years of coaching</p>
                  </div>
                </div>
              )}

              {/* Qualifications */}
              {coach.qualifications.length > 0 && (
                <div className="flex items-start space-x-3">
                  <Award className="w-5 h-5 text-green-600 mt-1" />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 mb-2">Qualifications</p>
                    <div className="flex flex-wrap gap-2">
                      {coach.qualifications.map((qual, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                        >
                          {qual}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Specializations */}
              {coach.specializations.length > 0 && (
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 mb-2">Specializations</p>
                    <div className="flex flex-wrap gap-2">
                      {coach.specializations.map((spec, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Philosophy */}
              {coach.philosophy && (
                <div className="pt-4 border-t">
                  <p className="font-semibold text-gray-900 mb-2">Coaching Philosophy</p>
                  <p className="text-gray-600 leading-relaxed">{coach.philosophy}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Invitation Details */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Invitation Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Sent to:</span>
              <span className="font-medium text-gray-900">{invitation.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Sent on:</span>
              <span className="font-medium text-gray-900">
                {new Date(invitation.sentAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Expires on:</span>
              <span className="font-medium text-gray-900">
                {new Date(invitation.expiresAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-xl shadow-md p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
            {hasAccount ? 'Sign in to accept this invitation' : 'Get started with your coaching journey'}
          </h3>
          
          {hasAccount && existingUserRole === 'coach' && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> This email is registered as a coach account. You'll need to use a different email 
                or contact support to create an athlete account.
              </p>
            </div>
          )}

          <div className="space-y-3">
            {!hasAccount && (
              <button
                onClick={handleCreateAccount}
                className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                <UserPlus className="w-5 h-5" />
                <span>Create Account & Accept Invitation</span>
              </button>
            )}

            {hasAccount && existingUserRole !== 'coach' && (
              <button
                onClick={handleSignIn}
                className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                <LogIn className="w-5 h-5" />
                <span>Sign In to Accept Invitation</span>
              </button>
            )}

            {hasAccount && (
              <p className="text-center text-sm text-gray-600">
                Already have an account? The invitation will appear in your dashboard after signing in.
              </p>
            )}

            {!hasAccount && (
              <p className="text-center text-sm text-gray-600">
                After creating your account, you can review and accept this invitation from your dashboard.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Questions? Contact your coach at{' '}
            <a href={`mailto:${coach.email}`} className="text-green-600 hover:text-green-700">
              {coach.email}
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}