'use client'

import React from 'react'
import { cn } from '@/lib/styles'

/* 🎨 Type definitions */
export type StatColor =
  | 'cirfpro-green'
  | 'blue'
  | 'purple'
  | 'amber'
  | 'teal'
  | 'rose'
  | 'indigo'
  | 'cyan'
  | 'emerald'
  | 'orange'

export type StatVariant = 'default' | 'dashboard'

export interface TrendData {
  value: number
  label: string
}

interface StatCardProps {
  icon?: string | React.ReactNode
  label: string
  value: string | number
  color?: StatColor
  variant?: StatVariant
  trend?: TrendData
  className?: string
}

/* 🎨 Color classes for icons and accents */
const colorClasses = {
  iconBackgrounds: {
    'cirfpro-green': 'bg-cirfpro-green-100',
    blue: 'bg-blue-100',
    purple: 'bg-purple-100',
    amber: 'bg-amber-100',
    teal: 'bg-teal-100',
    rose: 'bg-rose-100',
    indigo: 'bg-indigo-100',
    cyan: 'bg-cyan-100',
    emerald: 'bg-emerald-100',
    orange: 'bg-orange-100',
  },
  iconColors: {
    'cirfpro-green': 'text-cirfpro-green-600',
    blue: 'text-blue-600',
    purple: 'text-purple-600',
    amber: 'text-amber-600',
    teal: 'text-teal-600',
    rose: 'text-rose-600',
    indigo: 'text-indigo-600',
    cyan: 'text-cyan-600',
    emerald: 'text-emerald-600',
    orange: 'text-orange-600',
  },
}

export function StatCard({
  icon,
  label,
  value,
  color = 'cirfpro-green',
  variant = 'default',
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl shadow-sm flex flex-col items-center justify-center text-center',
        // 🔧 Uniform sizing & spacing
        'p-5 sm:p-6 w-full min-w-[160px] max-w-[200px] h-[140px]',
        'transition-all duration-300 hover:shadow-md',
        variant === 'dashboard' && 'py-4',
        className
      )}
    >
      {/* Icon */}
      {icon && (
        <div
          className={cn(
            'p-3 rounded-lg flex items-center justify-center mb-3',
            'transition-transform duration-200 group-hover:scale-105',
            colorClasses.iconBackgrounds[color]
          )}
        >
          {typeof icon === 'string' ? (
            <span className={cn('text-2xl', colorClasses.iconColors[color])}>{icon}</span>
          ) : (
            <div className={cn('w-6 h-6', colorClasses.iconColors[color])}>{icon}</div>
          )}
        </div>
      )}

      {/* Label */}
      <p className="text-sm text-gray-500 leading-tight">{label}</p>

      {/* Value */}
      <p className="text-xl font-bold text-gray-800 mt-1">{value}</p>
    </div>
  )
}



