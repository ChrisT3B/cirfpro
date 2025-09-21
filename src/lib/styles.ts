// src/lib/styles.ts - Renamed from utils.ts for clarity
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility function to merge Tailwind classes with proper precedence
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * CIRFPRO Brand Colors - centralized color constants
 */
export const CIRFPRO_COLORS = {
  green: {
    primary: '#29b643',
    dark: '#1f8c33',
    darker: '#166425',
  },
  gray: {
    primary: '#5a5e64',
    light: '#8b9198',
    dark: '#404449',
    darker: '#343a40',
  }
} as const

/**
 * Common gradients used throughout the app
 */
export const CIRFPRO_GRADIENTS = {
  primary: 'linear-gradient(135deg, #29b643 0%, #1f8c33 100%)',
  primaryHover: 'linear-gradient(135deg, #1f8c33 0%, #166425 100%)',
  background: 'linear-gradient(135deg, #5a5e64 0%, #404449 100%)',
  text: 'linear-gradient(135deg, #29b643, #5a5e64)',
} as const

/**
 * Typography scale following CIRFPRO design system
 */
export const CIRFPRO_TYPOGRAPHY = {
  fontFamily: 'font-open-sans',
  sizes: {
    xs: 'text-xs',
    sm: 'text-sm', 
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl',
  },
  weights: {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  }
} as const

/**
 * Common shadow styles
 */
export const CIRFPRO_SHADOWS = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  green: '0 4px 12px rgba(41, 182, 67, 0.3)',
} as const