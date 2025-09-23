// src/components/InvitationModal.tsx
'use client'

import { useState } from 'react'
import { Mail, MessageSquare, Send, CheckCircle, AlertCircle } from 'lucide-react'
import BaseModal from './ui/BaseModal'

interface InvitationModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface FormData {
  email: string
  message: string
}

interface ApiResponse {
  success: boolean
  invitation?: {
    id: string
    email: string
    status: string
    expires_at: string
    sent_at: string
  }
  emailSent?: boolean
  error?: string
}

export default function InvitationModal({ isOpen, onClose, onSuccess }: InvitationModalProps) {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/invitations/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          message: formData.message.trim() || undefined
        }),
      })

      const data: ApiResponse = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send invitation')
      }

      if (data.success) {
        setSuccess(true)
        // Close modal after 2 seconds and reset form
        setTimeout(() => {
          handleClose()
          onSuccess() // Trigger parent component to refresh data
        }, 2000)
      } else {
        throw new Error(data.error || 'Unknown error occurred')
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send invitation'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (loading) return // Prevent closing while sending
    
    setFormData({ email: '', message: '' })
    setError(null)
    setSuccess(false)
    onClose()
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, email: e.target.value }))
    if (error) setError(null) // Clear error when user types
  }

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, message: e.target.value }))
  }

  // Success state content
  const successContent = (
    <div className="text-center py-4">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle className="w-8 h-8 text-green-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Invitation Sent Successfully!
      </h3>
      <p className="text-gray-600 text-sm">
        The athlete will receive an email invitation to join your coaching program.
      </p>
    </div>
  )

  // Form content
  const formContent = (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Input */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Athlete Email Address *
          </label>
          <input
            type="email"
            id="email"
            required
            value={formData.email}
            onChange={handleEmailChange}
            disabled={loading}
            placeholder="athlete@example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-50 disabled:text-gray-500"
          />
        </div>

        {/* Message Input */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
            Personal Message (Optional)
          </label>
          <div className="relative">
            <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <textarea
              id="message"
              value={formData.message}
              onChange={handleMessageChange}
              disabled={loading}
              placeholder="Add a personal message to make your invitation more welcoming..."
              rows={3}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-50 disabled:text-gray-500 resize-none"
              maxLength={500}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {formData.message.length}/500 characters
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center space-x-2 p-3 bg-red-50 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Info Text */}
        <div className="bg-blue-50 rounded-lg p-3">
          <p className="text-sm text-blue-700">
            <strong>What happens next?</strong> The athlete will receive a professional email invitation 
            with your coaching credentials and a secure link to join your program.
          </p>
        </div>
      </form>
    </>
  )

  // Footer with action buttons
  const footer = !success ? (
    <div className="flex items-center justify-end space-x-3">
      <button
        type="button"
        onClick={handleClose}
        disabled={loading}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading || !formData.email.trim()}
        className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Sending...</span>
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            <span>Send Invitation</span>
          </>
        )}
      </button>
    </div>
  ) : undefined

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Invite New Athlete"
      description={success ? undefined : "Send a professional invitation to join your coaching program"}
      icon={<Mail className="w-4 h-4 text-green-600" />}
      footer={footer}
      preventClose={loading}
      size="md"
    >
      {success ? successContent : formContent}
    </BaseModal>
  )
}