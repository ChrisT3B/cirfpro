'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase'
import { InputSanitizer } from '@/utils/InputSanitizer'
import { Heading, Text } from '@/components/ui/Typography'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { 
  User, 
  Activity, 
  Heart, 
  Eye, 
  Bell, 
  Lock,
  Save,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react'

// Type definitions for form data
interface AthleteFormData {
  // Profile fields (Tab 1)
  first_name: string
  last_name: string
  email: string
  date_of_birth: string | null
  gender: string | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  profile_photo_url: string | null


  // Running Profile fields (Tab 2)
  experience_level: 'beginner' | 'intermediate' | 'advanced'
  preferred_units: 'metric' | 'imperial'
  typical_weekly_distance_km: number | null
  favorite_distances: string[]
  running_interests: string[]

  // Health & Safety fields (Tab 3)
  medical_conditions: string | null
  current_injuries: string | null
  injury_history: string | null

  // Privacy fields (Tab 4)
  profile_visibility: 'public' | 'private' | 'coach_only'
  searchable_in_directory: boolean
  share_health_with_coach: boolean    // NEW
  share_emergency_contact: boolean    // NEW
}

type TabKey = 'profile' | 'running' | 'health' | 'privacy' | 'account'

export default function AthleteSettingsPage() {
  const router = useRouter()
  const { 
    user, 
    profile, 
    athleteProfile, 
    loading: authLoading,  // ← AUTH loading state (JWT initialization)
    isAthlete  // ← JWT flag (instant, no DB call needed)
  } = useAuth()
  
  // Component state management
  const [activeTab, setActiveTab] = useState<TabKey>('profile')
  const [loading, setLoading] = useState(true)  // ← COMPONENT loading state (data fetching)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [successMessage, setSuccessMessage] = useState('')
  
  // Form data state
  const [formData, setFormData] = useState<AthleteFormData>({
    first_name: '',
    last_name: '',
    email: '',
    date_of_birth: null,
    gender: null,
    emergency_contact_name: null,
    emergency_contact_phone: null,
    profile_photo_url: null,
    experience_level: 'beginner',
    preferred_units: 'metric',
    typical_weekly_distance_km: null,
    favorite_distances: [],
    running_interests: [],
    medical_conditions: null,
    current_injuries: null,
    injury_history: null,
    profile_visibility: 'private',
    searchable_in_directory: false,
    share_health_with_coach: false,    // NEW - default to false for privacy
  share_emergency_contact: false     // NEW - default to false for privacy
  })

  // JWT-FIRST AUTHORIZATION CHECK (same pattern as coach dashboard)
  useEffect(() => {
    console.log('🔒 Running athlete settings authorization check...', {
      authLoading,
      user: !!user,
      isAthlete
    })

    if (authLoading) {
      console.log('⏳ Auth still loading...')
      return
    }

    if (!user) {
      console.log('🚫 No user, redirecting to signin')
      router.push('/auth/signin')
      return
    }

    if (!isAthlete) {
      console.log('🚫 Not an athlete, redirecting to dashboard')
      router.push('/dashboard')
      return
    }

    console.log('✅ Authorization passed - athlete accessing settings')
    // Authorization complete, load profile data
    loadAthleteProfile()

  }, [authLoading, user, isAthlete, router])

  // Load athlete profile data
  const loadAthleteProfile = async () => {
    if (!user || !athleteProfile) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const supabase = createClient()

      // Fetch athlete profile data
      const { data: profileData, error: profileError } = await supabase
        .from('athlete_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (profileError) throw profileError

      // Map database fields to form data
      setFormData({
        // From users table (via AuthContext)
        first_name: profile?.first_name || '',
        last_name: profile?.last_name || '',
        email: profile?.email || user.email || '',
        
        // From athlete_profiles table
        date_of_birth: profileData.date_of_birth,
        gender: profileData.gender,
        emergency_contact_name: profileData.emergency_contact_name,
        emergency_contact_phone: profileData.emergency_contact_phone,
        profile_photo_url: profileData.profile_photo_url,
        experience_level: profileData.experience_level || 'beginner',
        // Type assertion to ensure it matches the literal type
        preferred_units: (profileData.preferred_units === 'metric' || profileData.preferred_units === 'imperial') 
          ? profileData.preferred_units 
          : 'metric',
        typical_weekly_distance_km: profileData.typical_weekly_distance_km,
        favorite_distances: profileData.favorite_distances || [],
        running_interests: profileData.running_interests || [],
        medical_conditions: profileData.medical_conditions,
        current_injuries: profileData.current_injuries,
        injury_history: profileData.injury_history,
        // Type assertion to ensure it matches the literal type
        profile_visibility: (profileData.profile_visibility === 'public' || 
                            profileData.profile_visibility === 'private' || 
                            profileData.profile_visibility === 'coach_only')
          ? profileData.profile_visibility 
          : 'private',
        searchable_in_directory: profileData.searchable_in_directory || false,
      share_health_with_coach: formData.share_health_with_coach,
       share_emergency_contact: formData.share_emergency_contact,
      })

      console.log('✅ Athlete profile data loaded successfully')

    } catch (error) {
      console.error('Error loading athlete profile:', error)
      setErrors({ general: 'Failed to load profile data' })
    } finally {
      setLoading(false)
    }
  }

  // Update field helper
  const updateField = (field: keyof AthleteFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Emergency contact validation
    if (formData.emergency_contact_name && !formData.emergency_contact_phone) {
      newErrors.emergency_contact_phone = 'Phone number required when contact name is provided'
    }
    if (formData.emergency_contact_phone && !formData.emergency_contact_name) {
      newErrors.emergency_contact_name = 'Contact name required when phone number is provided'
    }

    // Text length validations
    if (formData.medical_conditions && formData.medical_conditions.length > 1000) {
      newErrors.medical_conditions = 'Medical conditions must be 1000 characters or less'
    }
    if (formData.current_injuries && formData.current_injuries.length > 500) {
      newErrors.current_injuries = 'Current injuries must be 500 characters or less'
    }
    if (formData.injury_history && formData.injury_history.length > 1000) {
      newErrors.injury_history = 'Injury history must be 1000 characters or less'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Save profile
  const handleSave = async () => {
    if (!validateForm()) {
      return
    }

    setSaving(true)
    setSuccessMessage('')
    setErrors({})

    try {
      if (!user || !athleteProfile) {
        throw new Error('User not authenticated')
      }

      // Prepare athlete profile data (only fields in athlete_profiles table)
      const athleteData = {
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,
        emergency_contact_name: formData.emergency_contact_name,
        emergency_contact_phone: formData.emergency_contact_phone,
        profile_photo_url: formData.profile_photo_url,
        experience_level: formData.experience_level,
        preferred_units: formData.preferred_units,
        typical_weekly_distance_km: formData.typical_weekly_distance_km,
        favorite_distances: formData.favorite_distances,
        running_interests: formData.running_interests,
        medical_conditions: formData.medical_conditions,
        current_injuries: formData.current_injuries,
        injury_history: formData.injury_history,
        profile_visibility: formData.profile_visibility,
        searchable_in_directory: formData.searchable_in_directory,
          share_health_with_coach: formData.share_health_with_coach,
        share_emergency_contact: formData.share_emergency_contact,
        
      }

      // Sanitize data
      const sanitizedData = InputSanitizer.sanitizeFormData(athleteData)

      const supabase = createClient()

      // Update athlete profile
      const { error: updateError } = await supabase
        .from('athlete_profiles')
        .update(sanitizedData)
        .eq('id', athleteProfile.id)
        .eq('user_id', user.id)

      if (updateError) throw updateError

      setSuccessMessage('Profile updated successfully!')
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000)

    } catch (error) {
      console.error('Error saving profile:', error)
      setErrors({ 
        general: error instanceof Error ? error.message : 'Failed to save profile' 
      })
    } finally {
      setSaving(false)
    }
  }

  // Tab configuration
  const tabs = [
    { key: 'profile' as TabKey, label: 'Profile', icon: User },
    { key: 'running' as TabKey, label: 'Running Profile', icon: Activity },
    { key: 'health' as TabKey, label: 'Health & Safety', icon: Heart },
    { key: 'privacy' as TabKey, label: 'Privacy', icon: Eye },
    { key: 'account' as TabKey, label: 'Account', icon: Lock }
  ]

  // Render tab content (placeholders for now)
  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileTab()
      case 'running':
        return renderRunningTab()
      case 'health':
        return renderHealthTab()
      case 'privacy':
        return renderPrivacyTab()
      case 'account':
        return renderAccountTab()
      default:
        return null
    }
  }

  // Tab renderers (placeholders - we'll build these next)
const renderProfileTab = () => (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <Text size="sm" color="muted">
          Update your basic profile information and emergency contacts
        </Text>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Basic Information Section */}
          <div>
            <Heading level="h3" className="text-base font-semibold text-cirfpro-gray-900 mb-4">
              Basic Information
            </Heading>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="First Name"
                value={formData.first_name}
                onChange={(e) => updateField('first_name', e.target.value)}
                error={errors.first_name}
                placeholder="Enter your first name"
                disabled={true}
                helperText="Contact support to change your name"
              />
              
              <Input
                label="Last Name"
                value={formData.last_name}
                onChange={(e) => updateField('last_name', e.target.value)}
                error={errors.last_name}
                placeholder="Enter your last name"
                disabled={true}
                helperText="Contact support to change your name"
              />
              
              <Input
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                error={errors.email}
                disabled={true}
                helperText="Contact support to change your email"
              />
              
              <Input
                label="Date of Birth"
                type="date"
                value={formData.date_of_birth || ''}
                onChange={(e) => updateField('date_of_birth', e.target.value || null)}
                error={errors.date_of_birth}
                helperText="Used for age-appropriate training recommendations"
              />
            </div>
          </div>

          {/* Gender Selection */}
          <div>
            <label className="block text-sm font-medium text-cirfpro-gray-700 mb-3">
              Gender
            </label>
            <div className="flex flex-wrap gap-3">
              {['male', 'female', 'non-binary', 'prefer-not-to-say'].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => updateField('gender', option)}
                  className={`
                    px-4 py-2 rounded-lg border-2 transition-all
                    ${formData.gender === option
                      ? 'border-cirfpro-green-500 bg-cirfpro-green-50 text-cirfpro-green-700'
                      : 'border-cirfpro-gray-300 bg-white text-cirfpro-gray-700 hover:border-cirfpro-gray-400'
                    }
                  `}
                >
                  {option.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </button>
              ))}
            </div>
            <Text size="xs" color="muted" className="mt-2">
              Optional - helps us provide relevant health information
            </Text>
          </div>

          {/* Emergency Contact Section */}
          <div>
            <Heading level="h3" className="text-base font-semibold text-cirfpro-gray-900 mb-4">
              Emergency Contact
            </Heading>
            <Text size="sm" color="muted" className="mb-4">
              This information will only be used in case of emergency during training activities
            </Text>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Contact Name"
                value={formData.emergency_contact_name || ''}
                onChange={(e) => updateField('emergency_contact_name', e.target.value || null)}
                error={errors.emergency_contact_name}
                placeholder="Enter emergency contact name"
              />
              
              <Input
                label="Contact Phone Number"
                type="tel"
                value={formData.emergency_contact_phone || ''}
                onChange={(e) => updateField('emergency_contact_phone', e.target.value || null)}
                error={errors.emergency_contact_phone}
                placeholder="+44 7700 900000"
                helperText="Include country code"
              />
            </div>
          </div>

          {/* Profile Photo Section - Placeholder */}
          <div>
            <Heading level="h3" className="text-base font-semibold text-cirfpro-gray-900 mb-4">
              Profile Photo
            </Heading>
            <div className="flex items-center space-x-4">
              <div className="w-24 h-24 rounded-full bg-cirfpro-gray-200 flex items-center justify-center">
                {formData.profile_photo_url ? (
                  <img 
                    src={formData.profile_photo_url} 
                    alt="Profile" 
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-cirfpro-gray-400" />
                )}
              </div>
              <div>
                <Button variant="secondary" disabled>
                  Upload Photo
                </Button>
                <Text size="xs" color="muted" className="mt-2">
                  Photo upload coming soon
                </Text>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderRunningTab = () => (
    <Card>
      <CardHeader>
        <CardTitle>Running Background</CardTitle>
        <Text size="sm" color="muted">
          Help us understand your running experience and preferences
        </Text>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Experience Level */}
          <div>
            <label className="block text-sm font-medium text-cirfpro-gray-700 mb-3">
              Experience Level <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-3">
              {[
                { value: 'beginner', label: 'Beginner', desc: 'New to running or returning after a break' },
                { value: 'intermediate', label: 'Intermediate', desc: 'Regular runner with some experience' },
                { value: 'advanced', label: 'Advanced', desc: 'Experienced runner with consistent training' }
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updateField('experience_level', option.value)}
                  className={`
                    flex-1 min-w-[200px] p-4 rounded-lg border-2 text-left transition-all
                    ${formData.experience_level === option.value
                      ? 'border-cirfpro-green-500 bg-cirfpro-green-50'
                      : 'border-cirfpro-gray-300 bg-white hover:border-cirfpro-gray-400'
                    }
                  `}
                >
                  <div className="font-medium text-cirfpro-gray-900">{option.label}</div>
                  <div className="text-sm text-cirfpro-gray-600 mt-1">{option.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Preferred Units */}
          <div>
            <label className="block text-sm font-medium text-cirfpro-gray-700 mb-3">
              Preferred Distance Units
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => updateField('preferred_units', 'metric')}
                className={`
                  flex-1 px-6 py-3 rounded-lg border-2 transition-all
                  ${formData.preferred_units === 'metric'
                    ? 'border-cirfpro-green-500 bg-cirfpro-green-50 text-cirfpro-green-700'
                    : 'border-cirfpro-gray-300 bg-white text-cirfpro-gray-700 hover:border-cirfpro-gray-400'
                  }
                `}
              >
                <div className="font-medium">Metric</div>
                <div className="text-sm mt-1">Kilometers (km)</div>
              </button>
              <button
                type="button"
                onClick={() => updateField('preferred_units', 'imperial')}
                className={`
                  flex-1 px-6 py-3 rounded-lg border-2 transition-all
                  ${formData.preferred_units === 'imperial'
                    ? 'border-cirfpro-green-500 bg-cirfpro-green-50 text-cirfpro-green-700'
                    : 'border-cirfpro-gray-300 bg-white text-cirfpro-gray-700 hover:border-cirfpro-gray-400'
                  }
                `}
              >
                <div className="font-medium">Imperial</div>
                <div className="text-sm mt-1">Miles (mi)</div>
              </button>
            </div>
          </div>

          {/* Typical Weekly Distance */}
          <div>
            <Input
              label="Typical Weekly Distance"
              type="number"
              value={formData.typical_weekly_distance_km || ''}
              onChange={(e) => updateField('typical_weekly_distance_km', e.target.value ? parseFloat(e.target.value) : null)}
              error={errors.typical_weekly_distance_km}
              placeholder="Enter average weekly distance"
              helperText={`In ${formData.preferred_units === 'metric' ? 'kilometers' : 'miles'}`}
            />
          </div>

          {/* Favorite Distances */}
          <div>
            <label className="block text-sm font-medium text-cirfpro-gray-700 mb-3">
              Favorite Race Distances
            </label>
            <Text size="sm" color="muted" className="mb-3">
              Select all that apply
            </Text>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {['5K', '10K', 'Half Marathon', 'Marathon', 'Ultra Marathon', 'Trail Running'].map((distance) => (
                <button
                  key={distance}
                  type="button"
                  onClick={() => {
                    const current = formData.favorite_distances || []
                    const updated = current.includes(distance)
                      ? current.filter(d => d !== distance)
                      : [...current, distance]
                    updateField('favorite_distances', updated)
                  }}
                  className={`
                    px-4 py-3 rounded-lg border-2 text-center transition-all
                    ${(formData.favorite_distances || []).includes(distance)
                      ? 'border-cirfpro-green-500 bg-cirfpro-green-50 text-cirfpro-green-700'
                      : 'border-cirfpro-gray-300 bg-white text-cirfpro-gray-700 hover:border-cirfpro-gray-400'
                    }
                  `}
                >
                  {distance}
                </button>
              ))}
            </div>
          </div>

          {/* Running Interests */}
          <div>
            <label className="block text-sm font-medium text-cirfpro-gray-700 mb-3">
              Running Interests
            </label>
            <Text size="sm" color="muted" className="mb-3">
              What aspects of running interest you most?
            </Text>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                'Racing',
                'Trail Running',
                'Road Running',
                'Track Running',
                'Social Running',
                'Solo Running',
                'Speed Work',
                'Long Distance',
                'Cross Training',
                'Recovery Runs'
              ].map((interest) => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => {
                    const current = formData.running_interests || []
                    const updated = current.includes(interest)
                      ? current.filter(i => i !== interest)
                      : [...current, interest]
                    updateField('running_interests', updated)
                  }}
                  className={`
                    px-4 py-3 rounded-lg border-2 text-left transition-all
                    ${(formData.running_interests || []).includes(interest)
                      ? 'border-cirfpro-green-500 bg-cirfpro-green-50 text-cirfpro-green-700'
                      : 'border-cirfpro-gray-300 bg-white text-cirfpro-gray-700 hover:border-cirfpro-gray-400'
                    }
                  `}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

    const renderHealthTab = () => (
    <Card>
      <CardHeader>
        <CardTitle>Health & Safety Information</CardTitle>
        <Text size="sm" color="muted">
          Help your coach understand your health status for safe, effective training
        </Text>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Important Notice */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <Text size="sm" className="text-blue-900 font-medium">
                  Privacy Notice
                </Text>
                <Text size="sm" className="text-blue-800 mt-1">
                  This information is confidential and will only be shared with your assigned coach. 
                  It helps ensure safe training recommendations tailored to your health status.
                </Text>
              </div>
            </div>
          </div>

          {/* Medical Conditions */}
          <div>
            <label className="block text-sm font-medium text-cirfpro-gray-700 mb-2">
              Medical Conditions
            </label>
            <Text size="sm" color="muted" className="mb-3">
              List any medical conditions your coach should be aware of (e.g., asthma, heart conditions, diabetes)
            </Text>
            <textarea
              value={formData.medical_conditions || ''}
              onChange={(e) => updateField('medical_conditions', e.target.value || null)}
              placeholder="Enter any relevant medical conditions..."
              rows={4}
              className={`
                w-full px-3 py-2 border rounded-lg
                focus:outline-none focus:ring-2 focus:ring-cirfpro-green-500 focus:border-transparent
                ${errors.medical_conditions 
                  ? 'border-red-300 bg-red-50' 
                  : 'border-cirfpro-gray-300'
                }
              `}
              maxLength={1000}
            />
            <div className="flex justify-between mt-1">
              {errors.medical_conditions && (
                <Text size="xs" className="text-red-600">
                  {errors.medical_conditions}
                </Text>
              )}
              <Text size="xs" color="muted" className="ml-auto">
                {(formData.medical_conditions || '').length}/1000 characters
              </Text>
            </div>
          </div>

          {/* Current Injuries */}
          <div>
            <label className="block text-sm font-medium text-cirfpro-gray-700 mb-2">
              Current Injuries
            </label>
            <Text size="sm" color="muted" className="mb-3">
              Describe any current injuries or pain that might affect your training
            </Text>
            <textarea
              value={formData.current_injuries || ''}
              onChange={(e) => updateField('current_injuries', e.target.value || null)}
              placeholder="Enter any current injuries or areas of discomfort..."
              rows={3}
              className={`
                w-full px-3 py-2 border rounded-lg
                focus:outline-none focus:ring-2 focus:ring-cirfpro-green-500 focus:border-transparent
                ${errors.current_injuries 
                  ? 'border-red-300 bg-red-50' 
                  : 'border-cirfpro-gray-300'
                }
              `}
              maxLength={500}
            />
            <div className="flex justify-between mt-1">
              {errors.current_injuries && (
                <Text size="xs" className="text-red-600">
                  {errors.current_injuries}
                </Text>
              )}
              <Text size="xs" color="muted" className="ml-auto">
                {(formData.current_injuries || '').length}/500 characters
              </Text>
            </div>
          </div>

          {/* Injury History */}
          <div>
            <label className="block text-sm font-medium text-cirfpro-gray-700 mb-2">
              Injury History
            </label>
            <Text size="sm" color="muted" className="mb-3">
              List any past injuries that your coach should know about (e.g., stress fractures, tendonitis)
            </Text>
            <textarea
              value={formData.injury_history || ''}
              onChange={(e) => updateField('injury_history', e.target.value || null)}
              placeholder="Enter relevant past injuries..."
              rows={4}
              className={`
                w-full px-3 py-2 border rounded-lg
                focus:outline-none focus:ring-2 focus:ring-cirfpro-green-500 focus:border-transparent
                ${errors.injury_history 
                  ? 'border-red-300 bg-red-50' 
                  : 'border-cirfpro-gray-300'
                }
              `}
              maxLength={1000}
            />
            <div className="flex justify-between mt-1">
              {errors.injury_history && (
                <Text size="xs" className="text-red-600">
                  {errors.injury_history}
                </Text>
              )}
              <Text size="xs" color="muted" className="ml-auto">
                {(formData.injury_history || '').length}/1000 characters
              </Text>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <Text size="sm" className="text-amber-900 font-medium">
                  Medical Disclaimer
                </Text>
                <Text size="sm" className="text-amber-800 mt-1">
                  This information does not replace professional medical advice. Always consult with a healthcare 
                  provider before starting any new exercise program, especially if you have pre-existing conditions 
                  or injuries.
                </Text>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

const renderPrivacyTab = () => (
  <Card>
    <CardHeader>
      <CardTitle>Privacy & Coach Access</CardTitle>
      <Text size="sm" color="muted">
        Control what information your coach can access
      </Text>
    </CardHeader>
    <CardContent>
      <div className="space-y-6">
        {/* Privacy Notice */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <Eye className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <Text size="sm" className="text-blue-900 font-medium">
                Your Profile is Private
              </Text>
              <Text size="sm" className="text-blue-800 mt-1">
                Your profile is never visible to other athletes or the public. Only you and coaches you give 
                permission to can view your information.
              </Text>
            </div>
          </div>
        </div>

        {/* Coach Access Controls */}
        <div>
          <Heading level="h3" className="text-base font-semibold text-cirfpro-gray-900 mb-3">
            What Can Your Coach See?
          </Heading>
          <Text size="sm" color="muted" className="mb-4">
            Choose what information you want to share with your assigned coach
          </Text>
          
          <div className="space-y-3">
            {/* Basic Profile - Always Shared */}
            <div className="p-4 bg-cirfpro-gray-50 rounded-lg border-2 border-cirfpro-gray-300">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-cirfpro-gray-600" />
                    <Text className="font-medium text-cirfpro-gray-900">Basic Profile</Text>
                  </div>
                  <Text size="sm" color="muted" className="mt-1 ml-6">
                    Name, experience level, running preferences - Always shared with your coach
                  </Text>
                </div>
                <div className="flex-shrink-0 ml-4">
                  <CheckCircle className="w-5 h-5 text-cirfpro-gray-400" />
                </div>
              </div>
            </div>

            {/* Health Information - Toggle */}
            <div className={`
              p-4 rounded-lg border-2 transition-all
              ${formData.share_health_with_coach 
                ? 'bg-cirfpro-green-50 border-cirfpro-green-500' 
                : 'bg-white border-cirfpro-gray-300'
              }
            `}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <Heart className="w-4 h-4 text-red-500" />
                    <Text className="font-medium text-cirfpro-gray-900">Health & Safety Information</Text>
                  </div>
                  <Text size="sm" color="muted" className="mt-1 ml-6">
                    Medical conditions, injuries, and injury history
                  </Text>
                  <div className="mt-3 ml-6 p-3 bg-amber-50 border border-amber-200 rounded">
                    <Text size="xs" className="text-amber-900">
                      <strong>Recommended:</strong> Sharing this helps your coach create safe, personalized 
                      training plans that account for your health status and injury history.
                    </Text>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => updateField('share_health_with_coach', !formData.share_health_with_coach)}
                  className={`
                    relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                    transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-cirfpro-green-500 focus:ring-offset-2
                    ${formData.share_health_with_coach ? 'bg-cirfpro-green-600' : 'bg-cirfpro-gray-200'}
                  `}
                  role="switch"
                  aria-checked={formData.share_health_with_coach}
                >
                  <span
                    className={`
                      pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 
                      transition duration-200 ease-in-out
                      ${formData.share_health_with_coach ? 'translate-x-5' : 'translate-x-0'}
                    `}
                  />
                </button>
              </div>
            </div>

            {/* Emergency Contact - Toggle */}
            <div className={`
              p-4 rounded-lg border-2 transition-all
              ${formData.share_emergency_contact 
                ? 'bg-cirfpro-green-50 border-cirfpro-green-500' 
                : 'bg-white border-cirfpro-gray-300'
              }
            `}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-orange-500" />
                    <Text className="font-medium text-cirfpro-gray-900">Emergency Contact</Text>
                  </div>
                  <Text size="sm" color="muted" className="mt-1 ml-6">
                    Emergency contact name and phone number
                  </Text>
                  <div className="mt-3 ml-6 p-3 bg-amber-50 border border-amber-200 rounded">
                    <Text size="xs" className="text-amber-900">
                      <strong>Recommended:</strong> In case of emergency during training activities, your coach 
                      can contact your emergency contact if needed.
                    </Text>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => updateField('share_emergency_contact', !formData.share_emergency_contact)}
                  className={`
                    relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                    transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-cirfpro-green-500 focus:ring-offset-2
                    ${formData.share_emergency_contact ? 'bg-cirfpro-green-600' : 'bg-cirfpro-gray-200'}
                  `}
                  role="switch"
                  aria-checked={formData.share_emergency_contact}
                >
                  <span
                    className={`
                      pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 
                      transition duration-200 ease-in-out
                      ${formData.share_emergency_contact ? 'translate-x-5' : 'translate-x-0'}
                    `}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Data Security */}
        <div>
          <Heading level="h3" className="text-base font-semibold text-cirfpro-gray-900 mb-3">
            Data Security
          </Heading>
          <div className="p-4 bg-cirfpro-gray-50 rounded-lg">
            <Text size="sm" color="muted">
              Your data is encrypted and stored securely. We follow industry best practices for data protection 
              and comply with data privacy regulations. You can request to export or delete your data at any time 
              by contacting support.
            </Text>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
)

  const renderAccountTab = () => (
    <Card>
      <CardHeader>
        <CardTitle>Account Management</CardTitle>
      </CardHeader>
      <CardContent>
        <Text color="muted">Account tab content will be built in next step</Text>
      </CardContent>
    </Card>
  )

  // Show loading while auth is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-cirfpro-green-500" />
          <Text color="muted">Loading authentication...</Text>
        </div>
      </div>
    )
  }

  // Show loading while checking authorization OR loading profile data
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-cirfpro-green-500" />
          <Text color="muted">Loading your profile...</Text>
        </div>
      </div>
    )
  }

  // Not authorized - this should never show if logic above is correct
  if (!user || !isAthlete) {
    return null
  }

  return (
    <div className="min-h-screen bg-cirfpro-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <Heading level="h1" className="text-cirfpro-gray-900">
                Athlete Settings
              </Heading>
              <Text color="muted" className="mt-2">
                Manage your profile and training preferences
              </Text>
            </div>
            
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center space-x-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </Button>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <Text size="sm" className="text-green-800">
                {successMessage}
              </Text>
            </div>
          )}

          {/* Error Message */}
          {errors.general && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <Text size="sm" className="text-red-800">
                {errors.general}
              </Text>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-cirfpro-gray-200">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.key
                
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`
                      flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap
                      transition-colors duration-200
                      ${isActive
                        ? 'border-cirfpro-green-500 text-cirfpro-green-600'
                        : 'border-transparent text-cirfpro-gray-500 hover:text-cirfpro-gray-700 hover:border-cirfpro-gray-300'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  )
}