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
    searchable_in_directory: false
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
        preferred_units: profileData.preferred_units || 'metric',
        typical_weekly_distance_km: profileData.typical_weekly_distance_km,
        favorite_distances: profileData.favorite_distances || [],
        running_interests: profileData.running_interests || [],
        medical_conditions: profileData.medical_conditions,
        current_injuries: profileData.current_injuries,
        injury_history: profileData.injury_history,
        profile_visibility: profileData.profile_visibility || 'private',
        searchable_in_directory: profileData.searchable_in_directory || false
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
        updated_at: new Date().toISOString()
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
      </CardHeader>
      <CardContent>
        <Text color="muted">Profile tab content will be built in next step</Text>
      </CardContent>
    </Card>
  )

  const renderRunningTab = () => (
    <Card>
      <CardHeader>
        <CardTitle>Running Background</CardTitle>
      </CardHeader>
      <CardContent>
        <Text color="muted">Running profile tab content will be built in next step</Text>
      </CardContent>
    </Card>
  )

  const renderHealthTab = () => (
    <Card>
      <CardHeader>
        <CardTitle>Health & Safety Information</CardTitle>
      </CardHeader>
      <CardContent>
        <Text color="muted">Health tab content will be built in next step</Text>
      </CardContent>
    </Card>
  )

  const renderPrivacyTab = () => (
    <Card>
      <CardHeader>
        <CardTitle>Privacy Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <Text color="muted">Privacy tab content will be built in next step</Text>
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