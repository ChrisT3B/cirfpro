// src/components/athlete/InvitationAcceptanceModal.tsx
'use client'

import { useState } from 'react'
import { X, Award, Briefcase, FileText, CheckCircle, AlertCircle } from 'lucide-react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

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

interface InvitationAcceptanceModalProps {
  invitation: PendingInvitation
  onClose: () => void
  onAccepted: () => void
}

export default function InvitationAcceptanceModal({ 
  invitation, 
  onClose, 
  onAccepted 
}: InvitationAcceptanceModalProps) {
  const { user, athleteProfile } = useAuth()
  const [step, setStep] = useState<'profile' | 'terms' | 'accepting'>('profile')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [accepting, setAccepting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { coach } = invitation

    const handleAcceptInvitation = async () => {
        alert('Function called!')  // This will always show if the function runs
    if (!termsAccepted) {
        setError('You must accept the terms and conditions to continue')
        return
    }

    if (!user || !athleteProfile) {
        setError('Unable to verify your account. Please refresh and try again.')
        return
    }

    setAccepting(true)
    setError(null)
    setStep('accepting')

    try {
        console.log('🔍 Starting acceptance process')
        const supabase = createClient()

        // Get the coach's profile ID (not user ID)
        const { data: coachProfileData, error: coachProfileError } = await supabase
        .from('coach_profiles')
        .select('id')
        .eq('user_id', invitation.coachId)
        .single()
            console.log('🔍 Coach profile lookup:', {
  searchingForUserId: invitation.coachId,
  foundProfile: coachProfileData,
  error: coachProfileError
})
        if (coachProfileError || !coachProfileData) {
        console.error('Error fetching coach profile:', coachProfileError)
        throw new Error('Coach profile not found')
        }
console.log('✅ Using coach_profile.id:', coachProfileData.id)
        // Create the coach-athlete relationship
        const { data: relationship, error: relationshipError } = await supabase
        .from('coach_athlete_relationships')
        .insert({
            coach_id: coachProfileData.id,  // ← Use coach_profiles.id
            athlete_id: athleteProfile.id,
            invitation_id: invitation.id,
            terms_accepted_at: new Date().toISOString(),
            terms_version: '1.0',
            status: 'active'
        })
        .select()
        .single()

        if (relationshipError) {
        console.error('Error creating relationship:', relationshipError)
        throw new Error('Failed to create coach-athlete relationship')
        }

        // Update the invitation status to accepted
        const { error: updateError } = await supabase
        .from('coach_athlete_invitations')
        .update({
            status: 'accepted',
            accepted_at: new Date().toISOString(),
            athlete_id: athleteProfile.id
        })
        .eq('id', invitation.id)

        if (updateError) {
        console.error('Error updating invitation:', updateError)
        // Don't throw - relationship is created, just log the error
        }

        // Update athlete profile with coach_id (still uses user_id)
        const { error: profileError } = await supabase
        .from('athlete_profiles')
        .update({ coach_id: coachProfileData.id })  
        .eq('id', athleteProfile.id)

        if (profileError) {
        console.error('Error updating athlete profile:', profileError)
        }

        // ✨ NEW: Send notification email to coach (non-blocking)
        try {
        console.log('📧 Sending coach notification email...')
        
        const emailResult = await fetch('/api/notifications/coach-acceptance', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({
            coachId: coachProfileData.id,  // Use the coach profile ID
            athleteId: athleteProfile.id,  // Use the athlete profile ID
            acceptedAt: new Date().toISOString(),
            }),
        })

        if (emailResult.ok) {
            console.log('✅ Coach notification email sent successfully')
        } else {
            // Log error but don't fail acceptance - email is non-critical
            const errorData = await emailResult.json()
            console.error('⚠️ Failed to send coach notification email:', errorData)
        }
        } catch (emailError) {
        // Log error but don't fail acceptance - email is non-critical
        console.error('⚠️ Error sending coach notification:', emailError)
        }

        // Success! Call the parent callback
        setTimeout(() => {
        onAccepted()
        }, 1500)

    } catch (err) {
        console.error('Error accepting invitation:', err)
        setError(err instanceof Error ? err.message : 'Failed to accept invitation')
        setStep('terms')
        setAccepting(false)
    }
    }
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
            <h2 className="text-2xl font-bold text-gray-900">
              {step === 'profile' && 'Coach Profile'}
              {step === 'terms' && 'Terms & Conditions'}
              {step === 'accepting' && 'Processing...'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              disabled={accepting}
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
            
            {/* STEP 1: Coach Profile */}
            {step === 'profile' && (
              <div className="p-6 space-y-6">
                {/* Coach Header */}
                <div className="flex items-center gap-4 pb-6 border-b">
                  {coach.photoUrl ? (
                    <Image
                      src={coach.photoUrl}
                      alt={coach.name}
                      width={80}
                      height={80}
                      className="rounded-full border-2 border-green-200"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center border-2 border-green-200">
                      <span className="text-2xl font-bold text-green-700">
                        {coach.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{coach.name}</h3>
                    <p className="text-gray-600">{coach.email}</p>
                  </div>
                </div>

                {/* Personal Message */}
                {invitation.message && (
                  <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                    <p className="text-sm font-medium text-blue-900 mb-1">Message from your coach:</p>
                    <p className="text-blue-800 italic">"{invitation.message}"</p>
                  </div>
                )}

                {/* Experience */}
                {coach.yearsExperience && (
                  <div className="flex items-start gap-3">
                    <Briefcase className="w-5 h-5 text-green-600 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-900">Coaching Experience</p>
                      <p className="text-gray-600">{coach.yearsExperience} years of professional coaching</p>
                    </div>
                  </div>
                )}

                {/* Qualifications */}
                {coach.qualifications && coach.qualifications.length > 0 && (
                  <div className="flex items-start gap-3">
                    <Award className="w-5 h-5 text-green-600 mt-1" />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 mb-3">Professional Qualifications</p>
                      <div className="flex flex-wrap gap-2">
                        {coach.qualifications.map((qual, index) => (
                          <span
                            key={index}
                            className="px-3 py-1.5 bg-green-100 text-green-800 rounded-lg text-sm font-medium"
                          >
                            {qual}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Coaching Philosophy */}
                {coach.philosophy && (
                  <div className="pt-4 border-t">
                    <p className="font-semibold text-gray-900 mb-2">Coaching Philosophy</p>
                    <p className="text-gray-600 leading-relaxed">{coach.philosophy}</p>
                  </div>
                )}

                {/* Important Notice */}
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-900 mb-1">Important Notice</p>
                      <p className="text-sm text-yellow-800">
                        By accepting this invitation, you will be entering into a direct professional coaching 
                        relationship with {coach.name.split(' ')[0]}. You'll need to review and accept the 
                        Coach-Athlete Relationship Agreement in the next step.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Terms & Conditions */}
            {step === 'terms' && (
              <div className="p-6">
                {/* Terms Document */}
                <div className="prose prose-sm max-w-none mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200 max-h-96 overflow-y-auto">
                  <h1>CIRFPRO Coach-Athlete Relationship Agreement</h1>
                  <p className="text-sm text-gray-600"><strong>Version 1.0</strong></p>

                  <h2>1. DEFINITIONS</h2>
                  <p><strong>"Platform"</strong> means the CIRFPRO digital coaching platform, including all software, applications, and related services.</p>
                  <p><strong>"Coach"</strong> means the qualified running coach who has invited the Athlete to establish a professional coaching relationship through the Platform.</p>
                  <p><strong>"Athlete"</strong> means the individual accepting the Coach's invitation to receive professional coaching services.</p>
                  <p><strong>"Relationship"</strong> means the direct professional coaching services agreement between Coach and Athlete, facilitated but not administered by the Platform.</p>
                  <p><strong>"CIRFPRO"</strong> means the Platform operator, which acts solely as a technology service provider.</p>

                  <h2>2. NATURE OF PLATFORM SERVICES</h2>
                  <h3>2.1 Technology Facilitation Only</h3>
                  <p>CIRFPRO provides a digital platform that:</p>
                  <ul>
                    <li>Enables qualified coaches to connect with athletes seeking professional coaching</li>
                    <li>Offers training plan management, progress tracking, and communication tools</li>
                    <li>Facilitates video analysis, technique feedback, and coaching methodologies</li>
                    <li>Provides secure data storage and export capabilities</li>
                  </ul>

                  <h3>2.2 Platform Limitations</h3>
                  <p>CIRFPRO explicitly does NOT:</p>
                  <ul>
                    <li>Provide coaching services or professional training advice</li>
                    <li>Act as a payment processor, billing agent, or financial intermediary</li>
                    <li>Guarantee coaching outcomes, performance improvements, or injury prevention</li>
                    <li>Mediate disputes between coaches and athletes</li>
                    <li>Verify the ongoing competency or insurance status of coaches beyond initial platform registration</li>
                  </ul>

                  <h2>3. DIRECT PROFESSIONAL RELATIONSHIP</h2>
                  <h3>3.1 Independent Coaching Relationship</h3>
                  <p>By accepting this invitation, both parties acknowledge that:</p>
                  <ul>
                    <li>A direct, independent professional coaching relationship is being established between Coach and Athlete only</li>
                    <li>CIRFPRO is not a party to this coaching relationship</li>
                    <li>All terms of service, payment arrangements, and professional obligations are matters solely between Coach and Athlete</li>
                    <li>The Platform serves only as a technological tool to facilitate the delivery of coaching services</li>
                  </ul>

                  <h3>3.2 Separate Commercial Agreement Required</h3>
                  <p>Coach and Athlete acknowledge they must establish their own separate agreement covering:</p>
                  <ul>
                    <li>Coaching fees, payment schedules, and billing arrangements</li>
                    <li>Service expectations, training commitments, and performance goals</li>
                    <li>Cancellation policies, refund terms, and notice requirements</li>
                    <li>Professional boundaries, confidentiality, and communication protocols</li>
                  </ul>

                  <h2>4. ATHLETE ACKNOWLEDGMENTS AND RESPONSIBILITIES</h2>
                  <h3>4.1 Informed Consent</h3>
                  <p>The Athlete acknowledges and confirms:</p>
                  <ul>
                    <li>They have reviewed the Coach's qualifications, experience, and coaching approach</li>
                    <li>They understand they are engaging professional coaching services directly with the Coach</li>
                    <li>CIRFPRO is providing technology tools only and is not responsible for coaching quality or outcomes</li>
                    <li>They accept the risks inherent in endurance running training and coaching activities</li>
                  </ul>

                  <h3>4.2 Medical and Health Responsibilities</h3>
                  <p>The Athlete represents that:</p>
                  <ul>
                    <li>They have obtained appropriate medical clearance for the proposed training activities</li>
                    <li>They will disclose any relevant health conditions, injuries, or medical limitations to their Coach</li>
                    <li>They understand the importance of following medical advice and will not substitute coaching guidance for medical care</li>
                    <li>They accept personal responsibility for their health and safety during training</li>
                  </ul>

                  <h2>5. DATA OWNERSHIP AND PRIVACY</h2>
                  <p>Athlete retains ownership of their personal training data and performance metrics. Both parties agree to comply with applicable data protection laws including GDPR and UK Data Protection Act.</p>

                  <h2>6. RELATIONSHIP TERMINATION</h2>
                  <p>Either Coach or Athlete may terminate their coaching relationship at any time with appropriate notice. Following termination, Athlete retains access to historical training data.</p>

                  <h2>7. GOVERNING LAW</h2>
                  <p>This Agreement is governed by English law for UK-based coaches and athletes, and local applicable law for international users.</p>

                  <p className="text-sm text-gray-600 mt-6"><strong>Important Notice:</strong> This Agreement establishes the framework for coach-athlete relationships facilitated through the CIRFPRO Platform. It does not constitute the coaching services agreement itself, which must be established separately between Coach and Athlete.</p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                {/* Acceptance Checkbox */}
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                  <input
                    type="checkbox"
                    id="terms-accept"
                    checked={termsAccepted}
                    onChange={(e) => {
                      setTermsAccepted(e.target.checked)
                      setError(null)
                    }}
                    className="mt-1 w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <label htmlFor="terms-accept" className="flex-1 text-sm text-gray-700 cursor-pointer">
                    I have read and accept the <strong>CIRFPRO Coach-Athlete Relationship Agreement</strong>. 
                    I understand that I am entering into a direct professional coaching relationship with {coach.name}, 
                    and that CIRFPRO acts solely as a technology platform provider.
                  </label>
                </div>
              </div>
            )}

            {/* STEP 3: Processing */}
            {step === 'accepting' && (
              <div className="p-12">
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                    {accepting ? (
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
                    ) : (
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    )}
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {accepting ? 'Creating your coaching relationship...' : 'Success!'}
                  </h3>
                  <p className="text-gray-600">
                    {accepting 
                      ? 'Please wait while we set up your connection with your coach.'
                      : 'You are now connected with your coach!'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-between items-center">
            {step === 'profile' && (
              <>
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setStep('terms')}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  Continue to Terms
                  <FileText className="w-4 h-4" />
                </button>
              </>
            )}

            {step === 'terms' && (
              <>
                <button
                  onClick={() => setStep('profile')}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={accepting}
                >
                  Back
                </button>
                <button
                  onClick={handleAcceptInvitation}
                  disabled={!termsAccepted || accepting}
                  className={`px-6 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                    termsAccepted && !accepting
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {accepting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Accept Invitation
                    </>
                  )}
                </button>
              </>
            )}

            {step === 'accepting' && !accepting && (
              <button
                onClick={onClose}
                className="ml-auto px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}