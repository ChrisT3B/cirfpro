// src/app/coach/[slug]/invitations/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Search, Mail, Calendar, Clock, Filter, ChevronLeft, ChevronRight } from 'lucide-react'
import InvitationModal from '@/components/InvitationModal'
import ConfirmationModal from '@/components/ui/ConfirmationModal'

interface Invitation {
  id: string
  email: string
  status: string
  message: string | null
  expires_at: string
  sent_at: string
  accepted_at: string | null
  created_at: string
  updated_at: string
  is_expired: boolean
  days_until_expiry: number
}

interface InvitationStats {
  total: number
  pending: number
  accepted: number
  expired: number
  declined: number
  cancelled: number
  email_failed: number
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export default function InvitationsPage() {
  const params = useParams()
  const router = useRouter()
  const { user, coachProfile, loading: authLoading } = useAuth()
  const slug = params.slug as string

  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [stats, setStats] = useState<InvitationStats>({
    total: 0,
    pending: 0,
    accepted: 0,
    expired: 0,
    declined: 0,
    cancelled: 0,
    email_failed: 0
  })
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  })
  const [loading, setLoading] = useState(true)
  const [unauthorized, setUnauthorized] = useState(false)
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [resendingIds, setResendingIds] = useState<Set<string>>(new Set())
  const [cancelingIds, setCancelingIds] = useState<Set<string>>(new Set())
  
  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    title: string
    message: string
    confirmText: string
    variant: 'danger' | 'warning' | 'info' | 'success'
    onConfirm: () => void
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '',
    variant: 'info',
    onConfirm: () => {}
  })

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const fetchInvitations = async (page = 1, status = statusFilter, search = searchQuery) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      })

      if (status !== 'all') {
        params.append('status', status)
      }

      if (search.trim()) {
        params.append('search', search.trim())
      }

      const response = await fetch(`/api/invitations?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setInvitations(data.data.invitations)
        setStats(data.data.stats)
        setPagination(data.data.pagination)
      }
    } catch (err) {
      console.error('Failed to fetch invitations:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading && coachProfile && coachProfile.workspace_slug !== slug) {
      setUnauthorized(true)
      setLoading(false)
      return
    }

    if (!authLoading && !unauthorized && coachProfile && user) {
      fetchInvitations()
    }
  }, [coachProfile, authLoading, unauthorized, slug, user, fetchInvitations])

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status)
    fetchInvitations(1, status, searchQuery)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchInvitations(1, statusFilter, searchQuery)
  }

  const handlePageChange = (newPage: number) => {
    fetchInvitations(newPage, statusFilter, searchQuery)
  }

  const handleInvitationSuccess = () => {
    fetchInvitations(pagination.page, statusFilter, searchQuery)
  }

  const handleResendInvitation = async (invitationId: string) => {
    setResendingIds(prev => new Set(prev).add(invitationId))
    
    try {
      const response = await fetch(`/api/invitations/${invitationId}/resend`, {
        method: 'PATCH',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend invitation')
      }

      if (data.success) {
        // Refresh the invitations list to show updated status
        fetchInvitations(pagination.page, statusFilter, searchQuery)
        
        // Show success message (you could add a toast notification here)
        console.log('Invitation resent successfully')
      } else {
        throw new Error(data.error || 'Unknown error occurred')
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to resend invitation'
      console.error('Resend error:', errorMessage)
      
      // Show error modal instead of alert
      setConfirmModal({
        isOpen: true,
        title: 'Error Resending Invitation',
        message: errorMessage,
        confirmText: 'OK',
        variant: 'danger',
        onConfirm: () => setConfirmModal(prev => ({ ...prev, isOpen: false }))
      })
    } finally {
      setResendingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(invitationId)
        return newSet
      })
    }
  }

  const handleCancelInvitation = async (invitationId: string, email: string) => {
    // Show professional confirmation modal instead of browser confirm
    setConfirmModal({
      isOpen: true,
      title: 'Cancel Invitation',
      message: `Are you sure you want to cancel the invitation to ${email}?\n\nThis action cannot be undone.`,
      confirmText: 'Cancel Invitation',
      variant: 'danger',
      onConfirm: () => performCancelInvitation(invitationId)
    })
  }

  const performCancelInvitation = async (invitationId: string) => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }))
    setCancelingIds(prev => new Set(prev).add(invitationId))
    
    try {
      const response = await fetch(`/api/invitations/${invitationId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel invitation')
      }

      if (data.success) {
        // Refresh the invitations list to show updated status
        fetchInvitations(pagination.page, statusFilter, searchQuery)
        
        // Show success message
        console.log('Invitation canceled successfully')
      } else {
        throw new Error(data.error || 'Unknown error occurred')
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel invitation'
      console.error('Cancel error:', errorMessage)
      
      // Show error modal instead of alert
      setConfirmModal({
        isOpen: true,
        title: 'Error Canceling Invitation',
        message: errorMessage,
        confirmText: 'OK',
        variant: 'danger',
        onConfirm: () => setConfirmModal(prev => ({ ...prev, isOpen: false }))
      })
    } finally {
      setCancelingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(invitationId)
        return newSet
      })
    }
  }

  if (authLoading || loading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
            <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
          </div>
          <div className="h-12 bg-gray-200 rounded w-40 animate-pulse"></div>
        </div>

        {/* Stats skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-4 animate-pulse">
              <div className="h-3 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-12"></div>
            </div>
          ))}
        </div>

        {/* Filters skeleton */}
        <div className="bg-white rounded-lg shadow p-4 animate-pulse">
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>

        {/* Table skeleton */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="animate-pulse p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (unauthorized) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-4">
          You don&apos;t have permission to view this coach&apos;s workspace.
        </p>
        <button
          onClick={() => router.push('/dashboard')}
          className="text-blue-600 hover:text-blue-800 underline"
        >
          Go to your dashboard
        </button>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  {/*const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } */}

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-blue-100 text-blue-800'
      case 'accepted': return 'bg-green-100 text-green-800'
      case 'expired': return 'bg-red-100 text-red-800'
      case 'declined': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-gray-100 text-gray-800'
      case 'email_failed': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusBadgeText = (status: string) => {
    switch (status) {
      case 'email_failed': return 'Email Failed'
      default: return status.charAt(0).toUpperCase() + status.slice(1)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <Link href={`/coach/${slug}/dashboard`} className="hover:text-gray-900">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-gray-900">Invitations</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Invitations</h1>
        </div>
        <button 
          onClick={() => setIsInviteModalOpen(true)}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
        >
          <Mail className="w-5 h-5" />
          Send Invitation
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-gray-400">
          <div className="text-xs font-medium text-gray-600 uppercase">Total</div>
          <div className="mt-1 text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <div className="text-xs font-medium text-gray-600 uppercase">Pending</div>
          <div className="mt-1 text-2xl font-bold text-blue-600">{stats.pending}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <div className="text-xs font-medium text-gray-600 uppercase">Accepted</div>
          <div className="mt-1 text-2xl font-bold text-green-600">{stats.accepted}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
          <div className="text-xs font-medium text-gray-600 uppercase">Expired</div>
          <div className="mt-1 text-2xl font-bold text-red-600">{stats.expired}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-gray-500">
          <div className="text-xs font-medium text-gray-600 uppercase">Declined</div>
          <div className="mt-1 text-2xl font-bold text-gray-600">{stats.declined}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-gray-500">
          <div className="text-xs font-medium text-gray-600 uppercase">Cancelled</div>
          <div className="mt-1 text-2xl font-bold text-gray-600">{stats.cancelled}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500">
          <div className="text-xs font-medium text-gray-600 uppercase">Failed</div>
          <div className="mt-1 text-2xl font-bold text-orange-600">{stats.email_failed}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="expired">Expired</option>
              <option value="declined">Declined</option>
              <option value="cancelled">Cancelled</option>
              <option value="email_failed">Email Failed</option>
            </select>
          </div>

          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search by email..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </form>
        </div>
      </div>

      {/* Invitations Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {invitations.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">
              {searchQuery || statusFilter !== 'all' 
                ? 'No invitations found matching your filters.' 
                : 'You haven\'t sent any invitations yet.'}
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <button 
                onClick={() => setIsInviteModalOpen(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                Send Your First Invitation
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sent</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expires</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Message</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invitations.map((invitation) => (
                    <tr key={invitation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {invitation.status === 'pending' && (
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleResendInvitation(invitation.id)}
                              disabled={resendingIds.has(invitation.id)}
                              className="text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {resendingIds.has(invitation.id) ? 'Sending...' : 'Resend'}
                            </button>
                            <span className="text-gray-300">|</span>
                            <button 
                              onClick={() => handleCancelInvitation(invitation.id, invitation.email)}
                              disabled={cancelingIds.has(invitation.id)}
                              className="text-red-600 hover:text-red-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {cancelingIds.has(invitation.id) ? 'Canceling...' : 'Cancel'}
                            </button>
                          </div>
                        )}
                        {invitation.status === 'expired' && (
                          <button 
                            onClick={() => handleResendInvitation(invitation.id)}
                            disabled={resendingIds.has(invitation.id)}
                            className="text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {resendingIds.has(invitation.id) ? 'Sending...' : 'Resend'}
                          </button>
                        )}
                        {invitation.status === 'email_failed' && (
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleResendInvitation(invitation.id)}
                              disabled={resendingIds.has(invitation.id)}
                              className="text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {resendingIds.has(invitation.id) ? 'Resending...' : 'Retry'}
                            </button>
                            <span className="text-gray-300">|</span>
                            <button 
                              onClick={() => handleCancelInvitation(invitation.id, invitation.email)}
                              disabled={cancelingIds.has(invitation.id)}
                              className="text-red-600 hover:text-red-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {cancelingIds.has(invitation.id) ? 'Canceling...' : 'Cancel'}
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">{invitation.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invitation.status)}`}>
                          {getStatusBadgeText(invitation.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(invitation.sent_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm">
                          <Clock className="w-4 h-4 mr-1" />
                          {invitation.is_expired ? (
                            <span className="text-red-600">Expired</span>
                          ) : (
                            <span className="text-gray-500">{invitation.days_until_expiry} days</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {invitation.message ? (
                          <div className="text-sm text-gray-600 max-w-xs truncate" title={invitation.message}>
                            {invitation.message}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400 italic">No message</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span> of{' '}
                  <span className="font-medium">{pagination.total}</span> invitations
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={!pagination.hasPrev}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                  <span className="px-4 py-2 text-sm text-gray-700">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={!pagination.hasNext}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        variant={confirmModal.variant}
      />

      {/* Invitation Modal */}
      <InvitationModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSuccess={handleInvitationSuccess}
      />
    </div>
  )
}