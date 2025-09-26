// src/lib/typography.ts - Typography utilities for CIRFPRO Design System
import { cn } from '@/lib/styles'

/**
 * TYPOGRAPHY UTILITY FUNCTIONS
 * Helper functions to build consistent typography classes
 */

// Typography scale mapping for consistent sizing
export const TYPOGRAPHY_SCALE = {
  display: {
    fontSize: 'text-4xl md:text-5xl lg:text-6xl',
    fontWeight: 'font-bold',
    lineHeight: 'leading-tight',
  },
  h1: {
    fontSize: 'text-3xl md:text-4xl',
    fontWeight: 'font-bold', 
    lineHeight: 'leading-tight',
  },
  h2: {
    fontSize: 'text-2xl md:text-3xl',
    fontWeight: 'font-semibold',
    lineHeight: 'leading-tight',
  },
  h3: {
    fontSize: 'text-xl md:text-2xl',
    fontWeight: 'font-semibold',
    lineHeight: 'leading-tight',
  },
  h4: {
    fontSize: 'text-lg md:text-xl',
    fontWeight: 'font-semibold',
    lineHeight: 'leading-snug',
  },
  h5: {
    fontSize: 'text-base md:text-lg',
    fontWeight: 'font-medium',
    lineHeight: 'leading-snug',
  },
  h6: {
    fontSize: 'text-sm md:text-base',
    fontWeight: 'font-medium',
    lineHeight: 'leading-normal',
  },
  body: {
    fontSize: 'text-base',
    fontWeight: 'font-normal',
    lineHeight: 'leading-relaxed',
  },
  small: {
    fontSize: 'text-sm',
    fontWeight: 'font-normal', 
    lineHeight: 'leading-normal',
  },
  caption: {
    fontSize: 'text-xs',
    fontWeight: 'font-medium',
    lineHeight: 'leading-normal',
  }
} as const

/**
 * SEMANTIC COLOR MAPPINGS
 * Consistent color usage across typography
 */
export const TYPOGRAPHY_COLORS = {
  // Primary text colors
  primary: 'text-cirfpro-gray-900',
  secondary: 'text-cirfpro-gray-700',
  muted: 'text-cirfpro-gray-600',
  subtle: 'text-cirfpro-gray-500',
  
  // Brand colors
  brand: 'text-cirfpro-green-600',
  brandLight: 'text-cirfpro-green-500',
  brandDark: 'text-cirfpro-green-700',
  
  // Status colors
  success: 'text-green-600',
  warning: 'text-yellow-600',
  error: 'text-red-600',
  info: 'text-blue-600',
  
  // Special contexts
  white: 'text-white',
  inverse: 'text-cirfpro-gray-100',
  
  // Interactive states (for links, buttons)
  link: 'text-cirfpro-green-600 hover:text-cirfpro-green-700',
  linkMuted: 'text-cirfpro-gray-600 hover:text-cirfpro-gray-900',
} as const

/**
 * RESPONSIVE TYPOGRAPHY UTILITIES
 * Mobile-first responsive text classes
 */
export const RESPONSIVE_TEXT = {
  // Mobile-first heading sizes
  displayResponsive: 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl',
  h1Responsive: 'text-2xl sm:text-3xl md:text-4xl',
  h2Responsive: 'text-xl sm:text-2xl md:text-3xl',
  h3Responsive: 'text-lg sm:text-xl md:text-2xl',
  h4Responsive: 'text-base sm:text-lg md:text-xl',
  
  // Body text responsive sizing
  bodyLarge: 'text-base sm:text-lg',
  bodyBase: 'text-sm sm:text-base',
  bodySmall: 'text-xs sm:text-sm',
} as const

/**
 * UTILITY FUNCTION: BUILD TYPOGRAPHY CLASSES
 * Helper to combine typography properties consistently
 */
export function buildTypographyClasses(
  type: 'heading' | 'text' | 'label' | 'caption',
  size: string,
  options?: {
    color?: keyof typeof TYPOGRAPHY_COLORS
    weight?: 'normal' | 'medium' | 'semibold' | 'bold'
    align?: 'left' | 'center' | 'right'
    className?: string
  }
): string {
  const { color = 'primary', weight, align = 'left', className = '' } = options || {}
  
  const baseClasses = [
    'font-open-sans',
    TYPOGRAPHY_COLORS[color],
    `text-${align}`,
  ]
  
  // Add type-specific classes
  if (type === 'heading') {
    baseClasses.push('font-semibold', 'leading-tight', 'tracking-tight')
  } else if (type === 'text') {
    baseClasses.push('leading-relaxed')
  } else if (type === 'label') {
    baseClasses.push('font-medium', 'leading-none')
  } else if (type === 'caption') {
    baseClasses.push('font-medium', 'leading-normal')
  }
  
  // Add weight if specified
  if (weight) {
    baseClasses.push(`font-${weight}`)
  }
  
  return cn(...baseClasses, className)
}

/**
 * MIGRATION HELPERS
 * Functions to help migrate existing hardcoded classes
 */

// Map your current heading classes to design system
export const HEADING_MIGRATION_MAP = {
  // Current usage -> New component props
  'text-3xl font-bold text-gray-900': { level: 'h1', color: 'default' },
  'text-2xl font-semibold text-gray-900': { level: 'h2', color: 'default' },
  'text-xl font-semibold text-gray-900': { level: 'h3', color: 'default' },
  'text-lg font-semibold text-gray-900': { level: 'h4', color: 'default' },
  'text-base font-medium text-gray-900': { level: 'h5', color: 'default' },
  'text-sm font-medium text-gray-900': { level: 'h6', color: 'default' },
  
  // Brand colored headings
  'text-2xl font-bold text-green-600': { level: 'h2', color: 'brand' },
  'text-xl font-semibold text-green-600': { level: 'h3', color: 'brand' },
} as const

// Map your current text classes to design system
export const TEXT_MIGRATION_MAP = {
  // Current usage -> New component props
  'text-base text-gray-700': { size: 'base', color: 'secondary' },
  'text-sm text-gray-600': { size: 'sm', color: 'muted' },
  'text-xs text-gray-500': { size: 'xs', color: 'subtle' },
  'text-lg text-gray-900': { size: 'lg', color: 'primary' },
  
  // Status text
  'text-sm text-green-600': { size: 'sm', color: 'success' },
  'text-sm text-red-600': { size: 'sm', color: 'error' },
  'text-sm text-yellow-600': { size: 'sm', color: 'warning' },
  
  // Brand text
  'text-green-600': { color: 'brand' },
  'text-green-700': { color: 'brandDark' },
} as const

/**
 * SPECIALIZED COMBINATIONS
 * Pre-built combinations for common use cases
 */
export const STAT_LABEL_CLASSES = cn(
  TYPOGRAPHY_SCALE.caption.fontSize,
  TYPOGRAPHY_SCALE.caption.fontWeight,
  TYPOGRAPHY_COLORS.muted,
  'uppercase tracking-wide'
)

export const STAT_VALUE_CLASSES = cn(
  TYPOGRAPHY_SCALE.h2.fontSize,
  TYPOGRAPHY_SCALE.h2.fontWeight,
  TYPOGRAPHY_COLORS.primary,
  TYPOGRAPHY_SCALE.h2.lineHeight
)

export const CARD_TITLE_CLASSES = cn(
  TYPOGRAPHY_SCALE.h4.fontSize,
  TYPOGRAPHY_SCALE.h4.fontWeight,
  TYPOGRAPHY_COLORS.primary,
  TYPOGRAPHY_SCALE.h4.lineHeight
)

export const FORM_LABEL_CLASSES = cn(
  TYPOGRAPHY_SCALE.small.fontSize,
  'font-medium',
  TYPOGRAPHY_COLORS.secondary,
  'leading-none'
)

export const BUTTON_TEXT_CLASSES = cn(
  'font-semibold',
  'leading-none',
  'tracking-wide'
)

/**
 * USAGE EXAMPLES FOR MIGRATION:
 * 
 * // Before (hardcoded classes):
 * <div className="text-xs font-medium text-gray-600 uppercase">Total</div>
 * <div className="text-2xl font-bold text-gray-900">{value}</div>
 * 
 * // After (using utilities):
 * <div className={STAT_LABEL_CLASSES}>Total</div>
 * <div className={STAT_VALUE_CLASSES}>{value}</div>
 * 
 * // Or with components:
 * <Caption uppercase>Total</Caption>
 * <Heading level="2xl">{value}</Heading>
 */

export default {
  TYPOGRAPHY_SCALE,
  TYPOGRAPHY_COLORS,
  RESPONSIVE_TEXT,
  buildTypographyClasses,
  HEADING_MIGRATION_MAP,
  TEXT_MIGRATION_MAP,
}