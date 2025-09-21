// src/app/coach/directory/page.tsx
'use client'

import { createClient } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface CoachListing {
  id: string
  workspace_slug: string
  workspace_name: string | null
  coaching_philosophy: string | null
  years_experience: number | null
  coaching_location: string | null
  price_range: string | null
  availability_status: string
  profile_photo_url: string | null
  qualifications: string[] | null
  specializations: string[] | null
  first_name: string
  last_name: string
}

export default function CoachDirectoryPage() {
  const [coaches, setCoaches] = useState<CoachListing[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [availabilityFilter, setAvailabilityFilter] = useState('')

  useEffect(() => {
    async function fetchCoaches() {
      try {
        const supabase = createClient()
        
        const { data, error } = await supabase
          .from('public_coach_directory')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching coaches:', error)
          return
        }

        setCoaches(data || [])
      } catch (err) {
        console.error('Failed to load coaches:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCoaches()
  }, [])

  // Filter coaches based on search criteria
  const filteredCoaches = coaches.filter(coach => {
    const matchesSearch = searchTerm === '' || 
      coach.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coach.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (coach.workspace_name && coach.workspace_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (coach.coaching_location && coach.coaching_location.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesLocation = locationFilter === '' || 
      (coach.coaching_location && coach.coaching_location.toLowerCase().includes(locationFilter.toLowerCase()))

    const matchesAvailability = availabilityFilter === '' || 
      coach.availability_status === availabilityFilter

    return matchesSearch && matchesLocation && matchesAvailability
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Image               
            src="/images/cirfpro-logo2.svg"               
            alt="Cirfpro"               
            width={64}
            height={64}
            className="h-16 w-auto"             
            />
          </div>
          <h1 className="text-3xl font-bold text-[#5a5e64] mb-4">
            Find Your Perfect Running Coach
          </h1>
          <p className="text-lg text-[#8b9198] max-w-2xl mx-auto">
            Connect with qualified running coaches who can help you achieve your goals.
            Browse profiles, read about their coaching philosophy, and find the right fit for you.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-[#5a5e64] mb-2">
                Search Coaches
              </label>
              <input
                type="text"
                id="search"
                placeholder="Name, location, or expertise..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#29b643] focus:border-[#29b643]"
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-[#5a5e64] mb-2">
                Location
              </label>
              <input
                type="text"
                id="location"
                placeholder="Enter location..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#29b643] focus:border-[#29b643]"
              />
            </div>

            <div>
              <label htmlFor="availability" className="block text-sm font-medium text-[#5a5e64] mb-2">
                Availability
              </label>
              <select
                id="availability"
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#29b643] focus:border-[#29b643]"
              >
                <option value="">All coaches</option>
                <option value="available">Available</option>
                <option value="limited">Limited availability</option>
                <option value="unavailable">Currently unavailable</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-[#8b9198]">
            Showing {filteredCoaches.length} of {coaches.length} coaches
          </p>
        </div>

        {/* Coaches Grid */}
        {filteredCoaches.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-[#5a5e64]">No coaches found</h3>
            <p className="mt-1 text-sm text-[#8b9198]">
              Try adjusting your search criteria or filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCoaches.map((coach) => {
              const displayName = coach.workspace_name || `${coach.first_name} ${coach.last_name}`
              
              return (
                <Link
                  key={coach.id}
                  href={`/coach/${coach.workspace_slug}/profile`}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-300 overflow-hidden"
                >
                  <div className="p-6">
                    {/* Coach Header */}
                    <div className="flex items-center space-x-4 mb-4">
                      {coach.profile_photo_url ? (
                        <Image
                        src={coach.profile_photo_url}
                        alt={displayName}
                        width={64}
                        height={64}
                        className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-[#29b643] bg-opacity-10 rounded-full flex items-center justify-center">
                          <span className="text-xl font-semibold text-[#29b643]">
                            {coach.first_name[0]}{coach.last_name[0]}
                          </span>
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-semibold text-[#5a5e64] truncate">
                          {displayName}
                        </h3>
                        <p className="text-sm text-[#8b9198]">Running Coach</p>
                      </div>
                    </div>

                    {/* Coach Details */}
                    <div className="space-y-2 mb-4">
                      {coach.coaching_location && (
                        <div className="flex items-center text-sm text-[#8b9198]">
                          <svg className="w-4 h-4 mr-2 text-[#29b643]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {coach.coaching_location}
                        </div>
                      )}
                      
                      {coach.years_experience && (
                        <div className="flex items-center text-sm text-[#8b9198]">
                          <svg className="w-4 h-4 mr-2 text-[#29b643]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {coach.years_experience} years experience
                        </div>
                      )}

                      {coach.price_range && (
                        <div className="flex items-center text-sm text-[#8b9198]">
                          <svg className="w-4 h-4 mr-2 text-[#29b643]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                          {coach.price_range}
                        </div>
                      )}
                    </div>

                    {/* Specializations */}
                    {coach.specializations && coach.specializations.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                          {coach.specializations.slice(0, 3).map((specialization, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#29b643] bg-opacity-10 text-[#29b643]"
                            >
                              {specialization}
                            </span>
                          ))}
                          {coach.specializations.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{coach.specializations.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Coaching Philosophy Preview */}
                    {coach.coaching_philosophy && (
                      <p className="text-sm text-[#8b9198] mb-4 line-clamp-3">
                        {coach.coaching_philosophy.substring(0, 120)}
                        {coach.coaching_philosophy.length > 120 && '...'}
                      </p>
                    )}

                    {/* Availability Status */}
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        coach.availability_status === 'available'
                          ? 'bg-[#29b643] bg-opacity-10 text-[#29b643]'
                          : coach.availability_status === 'limited'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {coach.availability_status}
                      </span>
                      
                      <span className="text-sm font-medium text-[#29b643] hover:text-[#1f8c33]">
                        View Profile →
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}