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
  
  // Type-safe extraction of token parameter
  const token = typeof params?.token === 'string' ? params.token : ''

  const [loading, setLoading] = useState(true)
  const [invitationData, setInvitationData] = useState<InvitationData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setError('Invalid invitation link')
      setLoading(false)
      return
    }

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
    if (!invitationData) return
    
    // Store token in sessionStorage to retrieve after signup
    sessionStorage.setItem('pendingInvitationToken', token)
    router.push(`/auth/signup?email=${encodeURIComponent(invitationData.invitation.email)}`)
  }

  const handleSignIn = () => {
    if (!invitationData) return
    
    // Store token in sessionStorage to retrieve after signin
    sessionStorage.setItem('pendingInvitationToken', token)
    router.push(`/auth/signin?email=${encodeURIComponent(invitationData.invitation.email)}`)
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

  if (error || !invitationData || !invitationData.valid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            {invitationData?.invitation?.isExpired ? (
              <>
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Invitation Expired</h2>
                <p className="text-gray-600 mb-6">
                  This invitation has expired. Please contact your coach to request a new invitation.
                </p>
              </>
            ) : invitationData?.invitation?.isAccepted ? (
              <>
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Already Accepted</h2>
                <p className="text-gray-600 mb-6">
                  This invitation has already been accepted.
                </p>
              </>
            ) : invitationData?.invitation?.isCancelled ? (
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
                  width={96}
                  height={96}
                  className="rounded-full border-4 border-white"
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-white/20 flex items-center justify-center border-4 border-white">
                  <span className="text-3xl font-bold">
                    {coach.firstName?.[0]}{coach.lastName?.[0]}
                  </span>
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-1">{coach.name}</h2>
                <div className="flex items-center space-x-2 text-green-100">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm">{coach.email}</span>
                </div>
                {coach.yearsExperience && (
                  <div className="flex items-center space-x-2 text-green-100 mt-2">
                    <Briefcase className="h-4 w-4" />
                    <span className="text-sm">{coach.yearsExperience} years experience</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Coach Details */}
          <div className="p-8 space-y-6">
            {/* Qualifications */}
            {coach.qualifications && coach.qualifications.length > 0 && (
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <Award className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold text-gray-900">Qualifications</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {coach.qualifications.map((qual, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                    >
                      {qual}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Specializations */}
            {coach.specializations && coach.specializations.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Specializations</h3>
                <div className="flex flex-wrap gap-2">
                  {coach.specializations.map((spec, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Coaching Philosophy */}
            {coach.philosophy && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Coaching Philosophy</h3>
                <p className="text-gray-600 leading-relaxed">{coach.philosophy}</p>
              </div>
            )}

            {/* Personal Message */}
            {invitation.message && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Personal Message</h3>
                <p className="text-gray-700 italic">"{invitation.message}"</p>
              </div>
            )}

            {/* Invitation Details */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Invitation sent: {new Date(invitation.sentAt).toLocaleDateString()}</span>
                <span>Expires: {new Date(invitation.expiresAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
            Ready to start your coaching journey?
          </h3>
          
          {hasAccount ? (
            <div className="space-y-4">
              <p className="text-center text-gray-600 mb-4">
                {existingUserRole === 'athlete' 
                  ? 'You already have an athlete account. Sign in to accept this invitation.'
                  : 'You already have an account. Sign in to continue.'}
              </p>
              <button
                onClick={handleSignIn}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
              >
                <LogIn className="h-5 w-5" />
                <span>Sign In to Accept Invitation</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-center text-gray-600 mb-4">
                Create your athlete account to accept this invitation and start training.
              </p>
              <button
                onClick={handleCreateAccount}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
              >
                <UserPlus className="h-5 w-5" />
                <span>Create Account & Accept</span>
              </button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or</span>
                </div>
              </div>
              
              <button
                onClick={handleSignIn}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-lg border border-gray-300 transition-colors"
              >
                <LogIn className="h-5 w-5" />
                <span>Already have an account? Sign In</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer Note */}
        <p className="text-center text-sm text-gray-500 mt-6">
          By accepting this invitation, you agree to CIRFPRO's Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}