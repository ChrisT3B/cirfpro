// src/components/ui/StatCard.tsx - Specialized component for dashboard metrics
import React from 'react'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/styles'

// Supported color variants (matches your current usage)
type StatColor = 'blue' | 'green' | 'cirfpro-green' | 'red' | 'yellow' | 'purple' | 'gray'

// Two main layouts found in your codebase
type StatVariant = 'dashboard' | 'invitation'

// Optional trend indicator
interface TrendData {
  value: number
  direction: 'up' | 'down'
  period?: string // e.g., "vs last month"
}

export interface StatCardProps {
  // Core data
  label: string
  value: string | number
  
  // Visual styling
  color?: StatColor
  variant?: StatVariant
  
  // Icon (can be emoji string or React element)
  icon?: React.ReactNode | string
  
  // Optional enhancements
  trend?: TrendData
  subtitle?: string
  loading?: boolean
  
  // Standard div props
  className?: string
  onClick?: () => void
}

// Color mappings for consistent styling
const colorClasses = {
  // Icon background colors (for dashboard variant)
  iconBackgrounds: {
    blue: 'bg-blue-100',
    green: 'bg-green-100', 
    'cirfpro-green': 'bg-cirfpro-green-100',
    red: 'bg-red-100',
    yellow: 'bg-yellow-100',
    purple: 'bg-purple-100',
    gray: 'bg-cirfpro-gray-100',
  },
  
  // Icon text colors (for dashboard variant)
  iconColors: {
    blue: 'text-blue-600',
    green: 'text-green-600',
    'cirfpro-green': 'text-cirfpro-green-600', 
    red: 'text-red-600',
    yellow: 'text-yellow-600',
    purple: 'text-purple-600',
    gray: 'text-cirfpro-gray-600',
  },
  
  // Value text colors (for invitation variant)
  valueColors: {
    blue: 'text-blue-600',
    green: 'text-green-600',
    'cirfpro-green': 'text-cirfpro-green-600',
    red: 'text-red-600', 
    yellow: 'text-yellow-600',
    purple: 'text-purple-600',
    gray: 'text-cirfpro-gray-600',
  },
  
  // Accent border colors (for invitation variant)
  accentColors: {
    blue: 'blue' as const,
    green: 'green' as const,
    'cirfpro-green': 'cirfpro-green' as const,
    red: 'red' as const,
    yellow: 'yellow' as const,
    purple: 'purple' as const,
    gray: 'gray' as const,
  }
}

// Trend indicator component
const TrendIndicator: React.FC<{ trend: TrendData }> = ({ trend }) => {
  const isPositive = trend.direction === 'up'
  const trendColor = isPositive ? 'text-green-600' : 'text-red-600'
  const trendIcon = isPositive ? '↗️' : '↘️'
  
  return (
    <div className={cn('flex items-center text-xs font-medium', trendColor)}>
      <span className="mr-1">{trendIcon}</span>
      <span>{Math.abs(trend.value)}%</span>
      {trend.period && (
        <span className="ml-1 text-cirfpro-gray-500">{trend.period}</span>
      )}
    </div>
  )
}

// Loading skeleton for stat cards
const StatCardSkeleton: React.FC<{ variant: StatVariant }> = ({ variant }) => {
  if (variant === 'dashboard') {
    return (
      <Card>
        <div className="flex items-center animate-pulse">
          <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
          <div className="ml-4 flex-1">
            <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
            <div className="h-6 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
      </Card>
    )
  }
  
  return (
    <Card variant="accent" padding="sm">
      <div className="animate-pulse">
        <div className="h-3 bg-gray-200 rounded w-16 mb-2"></div>
        <div className="h-6 bg-gray-200 rounded w-12"></div>
      </div>
    </Card>
  )
}

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ 
    label, 
    value, 
    color = 'gray', 
    variant = 'dashboard', 
    icon, 
    trend, 
    subtitle,
    loading = false,
    className,
    onClick,
    ...props 
  }, ref) => {
    
    // Show skeleton while loading
    if (loading) {
      return <StatCardSkeleton variant={variant} />
    }
    
    // Dashboard variant (your current dashboard stat cards)
    if (variant === 'dashboard') {
      return (
        <Card 
          ref={ref}
          className={cn(onClick && 'cursor-pointer', className)}
          onClick={onClick}
          {...props}
        >
          <div className="flex items-center">
            {/* Icon section */}
            {icon && (
              <div className={cn(
                'p-2 rounded-lg flex items-center justify-center',
                colorClasses.iconBackgrounds[color]
              )}>
                {typeof icon === 'string' ? (
                  <span className={cn('text-xl', colorClasses.iconColors[color])}>
                    {icon}
                  </span>
                ) : (
                  <div className={cn('w-6 h-6', colorClasses.iconColors[color])}>
                    {icon}
                  </div>
                )}
              </div>
            )}
            
            {/* Content section */}
            <div className={cn('flex-1', icon && 'ml-4')}>
              <p className="text-sm font-medium text-cirfpro-gray-600">
                {label}
              </p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-semibold text-cirfpro-gray-900">
                  {typeof value === 'number' ? value.toLocaleString() : value}
                </p>
                {trend && <TrendIndicator trend={trend} />}
              </div>
              {subtitle && (
                <p className="text-xs text-cirfpro-gray-500 mt-1">{subtitle}</p>
              )}
            </div>
          </div>
        </Card>
      )
    }
    
    // Invitation variant (your current invitation stat cards)
    return (
      <Card 
        ref={ref}
        variant="accent"
        accentColor={colorClasses.accentColors[color]}
        padding="sm"
        className={cn(onClick && 'cursor-pointer', className)}
        onClick={onClick}
        {...props}
      >
        <div className="text-xs font-medium text-cirfpro-gray-600 uppercase mb-1">
          {label}
        </div>
        <div className="flex items-center gap-2">
          <div className={cn('text-2xl font-bold', colorClasses.valueColors[color])}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
          {trend && <TrendIndicator trend={trend} />}
        </div>
        {subtitle && (
          <div className="text-xs text-cirfpro-gray-500 mt-1">{subtitle}</div>
        )}
      </Card>
    )
  }
)

StatCard.displayName = "StatCard"

export { StatCard, type StatColor, type StatVariant, type TrendData }