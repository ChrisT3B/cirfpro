// src/components/ui/ConfirmationModal.tsx
'use client'

import BaseModal from './BaseModal'
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react'

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info' | 'success'
  loading?: boolean
}

const variantConfig = {
  danger: {
    icon: <XCircle className="w-5 h-5 text-red-600" />,
    iconBg: 'bg-red-100',
    confirmButton: 'bg-red-600 hover:bg-red-700 text-white'
  },
  warning: {
    icon: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
    iconBg: 'bg-yellow-100',
    confirmButton: 'bg-yellow-600 hover:bg-yellow-700 text-white'
  },
  info: {
    icon: <Info className="w-5 h-5 text-blue-600" />,
    iconBg: 'bg-blue-100',
    confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white'
  },
  success: {
    icon: <CheckCircle className="w-5 h-5 text-green-600" />,
    iconBg: 'bg-green-100',
    confirmButton: 'bg-green-600 hover:bg-green-700 text-white'
  }
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'info',
  loading = false
}: ConfirmationModalProps) {
  const config = variantConfig[variant]

  const handleConfirm = () => {
    if (!loading) {
      onConfirm()
    }
  }

  const footer = (
    <div className="flex items-center justify-end space-x-3">
      <button
        type="button"
        onClick={onClose}
        disabled={loading}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
      >
        {cancelText}
      </button>
      <button
        type="button"
        onClick={handleConfirm}
        disabled={loading}
        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 ${config.confirmButton}`}
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Processing...</span>
          </>
        ) : (
          <span>{confirmText}</span>
        )}
      </button>
    </div>
  )

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      icon={config.icon}
      size="sm"
      footer={footer}
      preventClose={loading}
    >
      <div className="text-sm text-gray-600">
        {message}
      </div>
    </BaseModal>
  )
}