// src/app/coach/[slug]/profile/page.tsx
'use client'

import { createClient } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Image from 'next/image'

  interface CoachProfile {
    id: string | null
    workspace_slug: string | null  // ← Add | null
    workspace_name: string | null
    coaching_philosophy: string | null
    years_experience: number | null
    coaching_location: string | null
    price_range: string | null
    availability_status: string | null  // ← Add | null
    profile_photo_url: string | null
    qualifications: string[] | null
    specializations: string[] | null
    first_name: string | null  // ← Add | null
    last_name: string | null  // ← Add | null
    email: string | null  // ← Add | null
    created_at: string | null  // ← Add | null
  }

export default function CoachProfilePage() {
  const params = useParams()
  const { user } = useAuth()
  const slug = params.slug as string
  
  const [coachProfile, setCoachProfile] = useState<CoachProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCoachProfile() {
      try {
        const supabase = createClient()
        
        const { data, error } = await supabase
          .from('public_coach_directory')
          .select('*')
          .eq('workspace_slug', slug)
          .single()

        if (error) {
          console.error('Error fetching coach profile:', error)
          return
        }

        setCoachProfile(data)
      } catch (err) {
        console.error('Failed to load coach profile:', err)
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchCoachProfile()
    }
  }, [slug])

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    )
  }

  if (!coachProfile) {
    return (
      <div className="text-center py-12">
        <p className="text-[#8b9198]">Coach profile not found.</p>
      </div>
    )
  }

  const displayName = coachProfile.workspace_name || 
                     `${coachProfile.first_name} ${coachProfile.last_name}`

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex items-start space-x-6">
            {/* Profile Photo */}
            <div className="flex-shrink-0">
              {coachProfile.profile_photo_url ? (
            <Image
            src={coachProfile.profile_photo_url}
            alt={displayName}
            width={96}
            height={96}
            className="w-24 h-24 rounded-full object-cover"
            />
              ) : (
                <div className="w-24 h-24 bg-[#29b643] bg-opacity-10 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-semibold text-[#29b643]">
                    const displayName = coachProfile.workspace_name || 
                   `${coachProfile.first_name || ''} ${coachProfile.last_name || ''}`.trim() ||
                   'Coach'
                  </span>
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold text-[#5a5e64] mb-2">
                {displayName}
              </h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-[#8b9198]">
                {coachProfile.years_experience && (
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-[#29b643]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">Experience:</span> {coachProfile.years_experience} years
                  </div>
                )}
                
                {coachProfile.coaching_location && (
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-[#29b643]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="font-medium">Location:</span> {coachProfile.coaching_location}
                  </div>
                )}
                
                {coachProfile.price_range && (
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-[#29b643]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    <span className="font-medium">Price Range:</span> {coachProfile.price_range}
                  </div>
                )}
                
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-[#29b643]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">Availability:</span>{' '}
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ml-2 ${
                    coachProfile.availability_status === 'available'
                      ? 'bg-[#29b643] bg-opacity-10 text-[#29b643]'
                      : coachProfile.availability_status === 'limited'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {coachProfile.availability_status}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex-shrink-0">
              {user ? (
                <button className="bg-[#29b643] text-white px-6 py-2 rounded-lg hover:bg-[#1f8c33] transition-colors font-medium">
                  Contact Coach
                </button>
              ) : (
                <a
                  href="/auth/signin"
                  className="bg-[#29b643] text-white px-6 py-2 rounded-lg hover:bg-[#1f8c33] transition-colors font-medium inline-block"
                >
                  Sign In to Contact
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Qualifications and Specializations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Qualifications */}
        {coachProfile.qualifications && coachProfile.qualifications.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-[#5a5e64] mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-[#29b643]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              Qualifications
            </h2>
            <div className="space-y-2">
              {coachProfile.qualifications.map((qualification, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-[#29b643] rounded-full"></div>
                  <span className="text-[#5a5e64]">{qualification}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Specializations */}
        {coachProfile.specializations && coachProfile.specializations.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-[#5a5e64] mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-[#29b643]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Specializations
            </h2>
            <div className="flex flex-wrap gap-2">
              {coachProfile.specializations.map((specialization, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#29b643] bg-opacity-10 text-[#29b643]"
                >
                  {specialization}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Coaching Philosophy */}
      {coachProfile.coaching_philosophy && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-[#5a5e64] mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-[#29b643]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Coaching Philosophy
          </h2>
          <div className="prose prose-gray max-w-none">
            <p className="text-[#5a5e64] leading-relaxed">
              {coachProfile.coaching_philosophy}
            </p>
          </div>
        </div>
      )}

      {/* About Section - Default content when philosophy is empty */}
      {!coachProfile.coaching_philosophy && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-[#5a5e64] mb-4">About {coachProfile.first_name}</h2>
          <div className="text-[#8b9198] text-center py-8">
            <svg className="mx-auto h-12 w-12 text-[#29b643] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <p>This coach hasn&apos;t added their coaching philosophy yet.</p>
            <p className="text-sm mt-2">Contact them to learn more about their approach to coaching.</p>
          </div>
        </div>
      )}

      {/* Contact Section */}
      <div className="bg-gradient-to-r from-[#29b643] to-[#1f8c33] rounded-lg p-6 text-center text-white">
        <h3 className="text-lg font-semibold mb-2">
          Ready to start training with {coachProfile.first_name}?
        </h3>
        <p className="mb-4 text-green-100">
          Get in touch to discuss your running goals and training needs.
        </p>
        {user ? (
          <button className="bg-white text-[#29b643] px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors font-medium">
            Send Message
          </button>
        ) : (
          <a
            href="/auth/signin"
            className="bg-white text-[#29b643] px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors font-medium inline-block"
          >
            Sign In to Contact
          </a>
        )}
      </div>
    </div>
  )
}