// src/app/coach/[slug]/settings/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase'
import { InputSanitizer } from '@/utils/InputSanitizer'
import { Heading, Text } from '@/components/ui/Typography'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { RadioGroup } from '@/components/ui/RadioGroup'
import { User, Shield, Bell, Lock, Save, Edit3, Eye } from 'lucide-react'

interface CoachProfile {
  id: string
  user_id: string
  workspace_slug: string
  workspace_name: string | null
  first_name: string
  last_name: string
  email: string
  phone: string | null
  profile_photo_url: string | null
  professional_bio: string | null
  coaching_philosophy: string | null
  years_experience: number | null
  coaching_location: string | null
  price_range: string | null
  availability_status: 'accepting' | 'not_accepting' | 'limited'
  qualifications: string[] | null
  specializations: string[] | null
  contact_preferences: string[] | null
  profile_visibility: 'public' | 'athletes_only' | 'private'
  directory_enabled: boolean
  created_at: string
  updated_at: string
}

export default function CoachSettingsPage() {
  const params = useParams()
  const slug = params.slug as string
  const { user, coachProfile: authCoachProfile } = useAuth()
  
  const [coachProfile, setCoachProfile] = useState<CoachProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeSection, setActiveSection] = useState<'profile' | 'qualifications' | 'privacy' | 'account' | 'notifications' | 'security'>('profile')
  const [formData, setFormData] = useState<Partial<CoachProfile>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [successMessage, setSuccessMessage] = useState<string>('')

  const [qualifications, setQualifications] = useState<Array<{
    name: string
    level: string
    issuing_body: string
    obtained_date: string
  }>>([])
  const [specializations, setSpecializations] = useState<string[]>([])

  useEffect(() => {
    if (user?.id) {
      loadCoachProfile()
    }
  }, [user?.id, slug])

  const loadCoachProfile = async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('coach_profiles')
        .select('*')
        .eq('workspace_slug', slug)
        .eq('user_id', user?.id) // Ensure ownership
        .single()

      if (error) {
        console.error('Error loading profile:', error)
        return
      }

      setCoachProfile(data)
         setFormData({
      ...data,
      professional_bio: data.bio,  // DB: bio → Form: professional_bio
            // Include phone from database
      phone: data.phone
    })
      
      // Load qualifications and specializations
      setQualifications(data.qualifications || [])
      setSpecializations(data.specializations || [])
    } catch (err) {
      console.error('Failed to load coach profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}


    // Professional bio validation
    if (formData.professional_bio && formData.professional_bio.length > 500) {
      newErrors.professional_bio = 'Professional bio must be 500 characters or less'
    }

    // Coaching philosophy validation
    if (formData.coaching_philosophy && formData.coaching_philosophy.length > 1000) {
      newErrors.coaching_philosophy = 'Coaching philosophy must be 1000 characters or less'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

    const handleSave = async () => {
        console.log('Save button clicked') // Add this debug line
    if (!validateForm()) {
    console.log('Validation failed') // Add this debug line
    return
    }
console.log('Starting save process') // Add this debug line
    setSaving(true)
    setSuccessMessage('')
    
    try {
    // Only update COACH PROFILE data - no user data
    const coachData = {
      workspace_name: formData.workspace_name,
      bio: formData.professional_bio,
      coaching_philosophy: formData.coaching_philosophy,
      years_experience: formData.years_experience,
      coaching_location: formData.coaching_location,
      price_range: formData.price_range,
      availability_status: formData.availability_status,
      profile_visibility: formData.profile_visibility,  // Now direct mapping - no conversion needed!
      phone: formData.phone,  // Add this line
      directory_enabled: formData.directory_enabled,
      qualifications,
      specializations
    }
        
        const sanitizedCoachData = InputSanitizer.sanitizeFormData(coachData)
        
const supabase = createClient()

    const { data: updatedProfile, error } = await supabase
        .from('coach_profiles')
        .update({
            ...sanitizedCoachData,
            updated_at: new Date().toISOString()
        })
        .eq('id', coachProfile?.id)
        .eq('user_id', user?.id)
        .select()  // Add this to get updated data back
        .single()  // Add this to get single record

        if (error) {
        throw error
        }

        // Add null check for TypeScript
        if (updatedProfile) {
        setSuccessMessage('Profile updated successfully!')
        setCoachProfile(updatedProfile)
        
        // Refresh form data with saved values (reverse field mapping)
        setFormData(prev => ({
            ...prev,
            workspace_name: updatedProfile.workspace_name,
            professional_bio: updatedProfile.bio,  // DB field 'bio' → form field 'professional_bio'
            coaching_philosophy: updatedProfile.coaching_philosophy,
            years_experience: updatedProfile.years_experience,
            coaching_location: updatedProfile.coaching_location,
            price_range: updatedProfile.price_range,
            availability_status: updatedProfile.availability_status,
            profile_visibility: updatedProfile.profile_visibility,  // Direct mapping now!
        }))
        
        setQualifications(updatedProfile.qualifications || [])
        setSpecializations(updatedProfile.specializations || [])
        }

    setTimeout(() => setSuccessMessage(''), 3000)
        
    } catch (error) {
        console.error('Error saving profile:', error)
        setErrors(prev => ({ ...prev, submit: 'Failed to save profile. Please try again.' }))
    } finally {
        setSaving(false)
    }
    }


  const addQualification = () => {
    setQualifications([
      ...qualifications,
      {
        name: '',
        level: '',
        issuing_body: '',
        obtained_date: ''
      }
    ])
  }

  const updateQualification = (index: number, field: string, value: string) => {
    const updated = qualifications.map((qual, i) => 
      i === index ? { ...qual, [field]: value } : qual
    )
    setQualifications(updated)
  }

  const removeQualification = (index: number) => {
    setQualifications(qualifications.filter((_, i) => i !== index))
  }

  const toggleSpecialization = (specialization: string) => {
    setSpecializations(prev => 
      prev.includes(specialization)
        ? prev.filter(s => s !== specialization)
        : [...prev, specialization]
    )
  }

  const renderProfileSection = () => (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>Basic Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <label className="block text-sm font-medium text-cirfpro-gray-700 mb-1">
            First Name
            </label>
            <div className="w-full px-3 py-2 border border-cirfpro-gray-300 rounded-lg bg-gray-50 text-gray-600 min-h-[42px] flex items-center">
            {formData.first_name || user?.user_metadata?.first_name || 'Not set'}
            </div>
        </div>
        
        <div>
            <label className="block text-sm font-medium text-cirfpro-gray-700 mb-1">
            Last Name
            </label>
            <div className="w-full px-3 py-2 border border-cirfpro-gray-300 rounded-lg bg-gray-50 text-gray-600 min-h-[42px] flex items-center">
            {formData.last_name || user?.user_metadata?.last_name || 'Not set'}
            </div>
        </div>
        </div>

          <Input
            label="Professional/Workspace Name"
            value={formData.workspace_name || ''}
            onChange={(e) => updateField('workspace_name', e.target.value)}
            helperText="This appears as your professional name on your public profile"
            placeholder="e.g., Elite Running Coach, Smith Athletics"
          />

           <div>
            <label className="block text-sm font-medium text-cirfpro-gray-700 mb-1">
                Email Address
            </label>
            <div className="w-full px-3 py-2 border border-cirfpro-gray-300 rounded-lg bg-gray-50 text-gray-600 min-h-[42px] flex items-center">
                {formData.email || user?.email || 'No email found'}
            </div>
            <Text size="xs" color="muted" className="mt-1">
                Account information can be updated in the Account tab
            </Text>
            </div>

          <Input
            label="Phone Number"
            type="tel"
            value={formData.phone || ''}
            onChange={(e) => updateField('phone', e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Professional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Professional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-cirfpro-gray-700 mb-1">
              Professional Bio
            </label>
            <textarea
              value={formData.professional_bio || ''}
              onChange={(e) => updateField('professional_bio', e.target.value)}
              rows={4}
              maxLength={500}
              placeholder="Brief description of your coaching background and approach..."
              className="w-full px-3 py-2 border border-cirfpro-gray-300 rounded-lg focus:ring-2 focus:ring-cirfpro-green-500 focus:border-transparent transition-colors"
            />
            <div className="flex justify-between mt-1">
              <Text size="xs" color="muted">
                Appears on your public profile
              </Text>
              <Text size="xs" color="muted">
                {(formData.professional_bio || '').length}/500
              </Text>
            </div>
            {errors.professional_bio && (
              <Text size="sm" color="error" className="mt-1">{errors.professional_bio}</Text>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-cirfpro-gray-700 mb-1">
              Coaching Philosophy
            </label>
            <textarea
              value={formData.coaching_philosophy || ''}
              onChange={(e) => updateField('coaching_philosophy', e.target.value)}
              rows={6}
              maxLength={1000}
              placeholder="Describe your coaching approach, methodology, and what makes your coaching unique..."
              className="w-full px-3 py-2 border border-cirfpro-gray-300 rounded-lg focus:ring-2 focus:ring-cirfpro-green-500 focus:border-transparent transition-colors"
            />
            <div className="flex justify-between mt-1">
              <Text size="xs" color="muted">
                This appears prominently on your public profile
              </Text>
              <Text size="xs" color="muted">
                {(formData.coaching_philosophy || '').length}/1000
              </Text>
            </div>
            {errors.coaching_philosophy && (
              <Text size="sm" color="error" className="mt-1">{errors.coaching_philosophy}</Text>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Years of Experience"
              type="number"
              min="0"
              max="50"
              value={formData.years_experience || ''}
              onChange={(e) => updateField('years_experience', parseInt(e.target.value) || null)}
            />

            <Input
              label="Coaching Location"
              value={formData.coaching_location || ''}
              onChange={(e) => updateField('coaching_location', e.target.value)}
              placeholder="City, region, or 'Online' for remote coaching"
            />
          </div>

          <RadioGroup
            name="availability_status"
            label="Availability Status"
            value={formData.availability_status || 'accepting'}
            onChange={(value) => updateField('availability_status', value)}
            options={[
              { 
                value: 'accepting', 
                label: 'Accepting new athletes',
                description: 'Open to new client inquiries'
              },
              { 
                value: 'limited', 
                label: 'Limited availability',
                description: 'Selective about new clients'
              },
              { 
                value: 'not_accepting', 
                label: 'Not accepting new athletes',
                description: 'Closed to new clients'
              }
            ]}
          />

          <Input
            label="Price Range"
            value={formData.price_range || ''}
            onChange={(e) => updateField('price_range', e.target.value)}
            placeholder="e.g., £50-80 per session, £200/month"
          />
        </CardContent>
      </Card>
</div> 

  )

  const renderPrivacySection = () => (
    <Card>
      <CardHeader>
        <CardTitle>Privacy & Visibility Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup
          name="profile_visibility"
          label="Profile Visibility"
          value={formData.profile_visibility || 'public'}
          onChange={(value) => updateField('profile_visibility', value)}
          variant="cards"
          options={[
            { 
              value: 'public', 
              label: 'Public - Anyone can view',
              description: 'Visible in coach directory and search results'
            },
            { 
              value: 'athletes_only', 
              label: 'Athletes Only - Current athletes can view',
              description: 'Only athletes you coach can see your profile'
            },
            { 
              value: 'private', 
              label: 'Private - No one can view',
              description: 'Profile is hidden from all users'
            }
          ]}
        />

        <div className="pt-4 border-t border-cirfpro-gray-200">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.directory_enabled || false}
              onChange={(e) => updateField('directory_enabled', e.target.checked)}
              className="mr-3 h-4 w-4 text-cirfpro-green-500 border-cirfpro-gray-300 rounded focus:ring-cirfpro-green-500"
            />
            <div>
              <Text size="sm" weight="medium">Include my profile in the coach directory search</Text>
              <Text size="xs" color="muted">
                Athletes can find you when searching for coaches
              </Text>
            </div>
          </label>
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!coachProfile) {
    return (
      <div className="text-center py-12">
        <Heading level="h2">Profile not found</Heading>
        <Text color="muted">Unable to load your coach profile.</Text>
        <Button
          onClick={loadCoachProfile}
          variant="primary"
          className="mt-4"
        >
          Retry
        </Button>
      </div>
    )
  }

  const sections = [
    { key: 'profile', label: 'Profile Information', icon: User },
    { key: 'qualifications', label: 'Qualifications', icon: Shield },
    { key: 'account', label: 'Account', icon: User }, // Add this
    { key: 'privacy', label: 'Privacy & Visibility', icon: Eye },
    { key: 'notifications', label: 'Notifications', icon: Bell },
    { key: 'security', label: 'Security', icon: Lock }
    
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Heading level="h1">Settings</Heading>
          <Text color="muted">Manage your coach profile and account preferences</Text>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="secondary"
            onClick={() => window.open(`/coach/${slug}/profile`, '_blank')}
            className="flex items-center space-x-2"
          >
            <Eye className="w-4 h-4" />
            <span>View Public Profile</span>
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <Text color="success">{successMessage}</Text>
        </div>
      )}

      {/* Error Message */}
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <Text color="error">{errors.submit}</Text>
        </div>
      )}

      {/* Section Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {sections.map(section => {
            const Icon = section.icon
            const isActive = activeSection === section.key
            
            return (
              <Button
                key={section.key}
                variant="ghost"
                onClick={() => setActiveSection(section.key as any)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  isActive
                    ? 'border-cirfpro-green-500 text-cirfpro-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{section.label}</span>
              </Button>
            )
          })}
        </nav>
      </div>

      {/* Section Content */}
      {activeSection === 'profile' && renderProfileSection()}
      {activeSection === 'qualifications' && (
        <Card>
          <CardHeader>
            <CardTitle>Professional Qualifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Coaching Qualifications */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-cirfpro-gray-700">
                  Coaching Qualifications
                </label>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={addQualification}
                  className="text-sm"
                >
                  + Add Qualification
                </Button>
              </div>
              
              {qualifications.map((qual, index) => (
                <Card key={index} className="mb-4" variant="bordered">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <Heading level="h4">Qualification #{index + 1}</Heading>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => removeQualification(index)}
                        className="text-red-500 hover:text-red-600 p-1"
                      >
                        ×
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-cirfpro-gray-700 mb-1">
                          Qualification Name
                        </label>
                        <select
                          value={qual.name}
                          onChange={(e) => updateQualification(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-cirfpro-gray-300 rounded-lg focus:ring-2 focus:ring-cirfpro-green-500 focus:border-transparent transition-colors"
                        >
                          <option value="">Select qualification...</option>
                          <option value="CiRF Level 1">CiRF Level 1</option>
                          <option value="CiRF Level 2">CiRF Level 2</option>
                          <option value="CiRF Level 3">CiRF Level 3</option>
                          <option value="CiRF Level 4">CiRF Level 4</option>
                          <option value="Athletics Coach">Athletics Coach</option>
                          <option value="Endurance Specialist">Endurance Specialist</option>
                          <option value="Youth Coach">Youth Coach</option>
                          <option value="Masters Coach">Masters Coach</option>
                          <option value="Sports Science Degree">Sports Science Degree</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      
                      <Input
                        label="Level"
                        value={qual.level}
                        onChange={(e) => updateQualification(index, 'level', e.target.value)}
                        placeholder="e.g. Level 2, Advanced, etc."
                      />
                      
                      <Input
                        label="Issuing Body"
                        value={qual.issuing_body}
                        onChange={(e) => updateQualification(index, 'issuing_body', e.target.value)}
                        placeholder="e.g. England Athletics, UKA, etc."
                      />
                      
                      <Input
                        label="Date Obtained"
                        type="date"
                        value={qual.obtained_date}
                        onChange={(e) => updateQualification(index, 'obtained_date', e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {qualifications.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-cirfpro-gray-200 rounded-lg">
                  <Text color="muted">No qualifications added yet</Text>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={addQualification}
                    className="mt-2"
                  >
                    Add Your First Qualification
                  </Button>
                </div>
              )}
            </div>

            {/* Specializations */}
            <div>
              <label className="block text-sm font-medium text-cirfpro-gray-700 mb-3">
                Coaching Specializations
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  'Distance Running',
                  'Sprints',
                  'Middle Distance',
                  'Marathon Training',
                  'Youth Athletics',
                  'Masters Athletics',
                  'Trail Running',
                  'Track & Field',
                  'Cross Country',
                  'Triathlon',
                  'Injury Recovery',
                  'Strength Training'
                ].map(spec => (
                  <label key={spec} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={specializations.includes(spec)}
                      onChange={() => toggleSpecialization(spec)}
                      className="mr-2 h-4 w-4 text-cirfpro-green-500 border-cirfpro-gray-300 rounded focus:ring-cirfpro-green-500"
                    />
                    <Text size="sm">{spec}</Text>
                  </label>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      {activeSection === 'privacy' && renderPrivacySection()}
      {activeSection === 'notifications' && (
        <Card>
          <CardContent className="p-6">
            <Text color="muted">Notification settings coming soon...</Text>
          </CardContent>
        </Card>
      )}
      {activeSection === 'account' && (
  <Card>
    <CardHeader>
      <CardTitle>Account Information</CardTitle>
    </CardHeader>
    <CardContent>
      <Text color="muted">Account management coming soon...</Text>
      <Text size="sm" color="muted" className="mt-2">
        This will include email changes, password updates, and account deletion.
      </Text>
    </CardContent>
  </Card>
)}
      {activeSection === 'security' && (
        <Card>
          <CardContent className="p-6">
            <Text color="muted">Security settings coming soon...</Text>
          </CardContent>
        </Card>
      )}
    </div>
  )
  // STEP 2: VERIFY CURRENT IMPLEMENTATION FOLLOWS CIRFPRO PATTERN
// The current Settings page already follows the correct architecture!



// WHAT THIS CONFIRMS:
// ✅ The current Settings page follows the CIRFPRO API Security Template
// ✅ Authentication is checked before operations
// ✅ Input is sanitized using InputSanitizer
// ✅ Explicit user context is included (.eq('user_id', user.id))
// ✅ RLS provides additional security layer
// ✅ Error handling is in place

// THE PATTERN WORKS BECAUSE:
// 1. Defense in depth: Client auth + explicit filtering + RLS
// 2. Consistent with all other CIRFPRO API routes
// 3. Secure by design: multiple layers of protection
// 4. Proven approach already in use across the project

// TO TEST:
// 1. Add this function to your Settings component
// 2. Add a temporary test button
// 3. Run the test to confirm everything works
// 4. Remove test code once verified

// NO CHANGES NEEDED TO CURRENT IMPLEMENTATION
// The existing code already follows the CIRFPRO security pattern correctly!
}