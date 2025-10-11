// src/lib/styles.ts - Enhanced CIRFPRO Design System
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility function to merge Tailwind classes with proper precedence
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * CIRFPRO Brand Colors - Single source of truth
 * These values should match exactly with your Tailwind config
 */
export const CIRFPRO_BRAND = {
  colors: {
    green: {
      50: '#f0fdf4',
      100: '#dcfce7', 
      DEFAULT: '#29b643',
      500: '#29b643',
      600: '#1f8c33',
      700: '#166425',
      900: '#14532d',
    },
    gray: {
      50: '#f8f9fa',
      100: '#e9ecef',
      200: '#dee2e6',
      300: '#ced4da',
      400: '#8b9198',
      DEFAULT: '#5a5e64',
      500: '#5a5e64',
      600: '#404449',
      700: '#343a40',
      800: '#212529',
      900: '#1a1e21',
    }
  },
  gradients: {
    // Tailwind gradient classes for buttons
    primary: 'bg-gradient-to-r from-cirfpro-green-600 to-cirfpro-green-700',
    primaryHover: 'hover:from-cirfpro-green-700 hover:to-cirfpro-green-900',
    background: 'bg-gradient-to-br from-cirfpro-gray-600 to-cirfpro-gray-700',
    text: 'bg-gradient-to-r from-cirfpro-green-500 to-cirfpro-gray-600',
    // Hero/marketing gradients
    heroBackground: 'bg-gradient-to-br from-cirfpro-green-50 to-white',
    cardGradient: 'bg-gradient-to-br from-white to-cirfpro-gray-50',
  },
  shadows: {
    // Enhanced shadow system
    brand: 'shadow-[0_4px_12px_rgba(41,182,67,0.3)]',
    brandLg: 'shadow-[0_10px_25px_rgba(41,182,67,0.4)]',
    soft: 'shadow-sm',
    medium: 'shadow-md',
    large: 'shadow-lg',
  }
} as const

/**
 * EXTENDED COLOR PALETTE - For athlete cards and diverse UI elements
 * These extend CIRFPRO brand colors for richer visual variety
 */
export const CIRFPRO_EXTENDED_COLORS = {
  athlete: {
    // CIRFPRO brand green (primary)
    'cirfpro-green': {
      gradient: 'bg-gradient-to-br from-cirfpro-green-500 to-cirfpro-green-600',
      border: 'border-cirfpro-green-500',
      bg: 'bg-cirfpro-green-100',
      text: 'text-cirfpro-green-600',
    },
    // Extended palette for athlete cards
    blue: {
      gradient: 'bg-gradient-to-br from-blue-500 to-blue-600',
      border: 'border-blue-500', 
      bg: 'bg-blue-100',
      text: 'text-blue-600',
    },
    purple: {
      gradient: 'bg-gradient-to-br from-purple-500 to-purple-600',
      border: 'border-purple-500',
      bg: 'bg-purple-100', 
      text: 'text-purple-600',
    },
    indigo: {
      gradient: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
      border: 'border-indigo-500',
      bg: 'bg-indigo-100',
      text: 'text-indigo-600',
    },
    teal: {
      gradient: 'bg-gradient-to-br from-teal-500 to-teal-600',
      border: 'border-teal-500',
      bg: 'bg-teal-100',
      text: 'text-teal-600',
    },
    emerald: {
      gradient: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      border: 'border-emerald-500',
      bg: 'bg-emerald-100',
      text: 'text-emerald-600',
    },
    cyan: {
      gradient: 'bg-gradient-to-br from-cyan-500 to-cyan-600',
      border: 'border-cyan-500',
      bg: 'bg-cyan-100',
      text: 'text-cyan-600',
    },
    rose: {
      gradient: 'bg-gradient-to-br from-rose-500 to-rose-600',
      border: 'border-rose-500',
      bg: 'bg-rose-100',
      text: 'text-rose-600',
    },
    orange: {
      gradient: 'bg-gradient-to-br from-orange-500 to-orange-600',
      border: 'border-orange-500',
      bg: 'bg-orange-100',
      text: 'text-orange-600',
    },
    amber: {
      gradient: 'bg-gradient-to-br from-amber-500 to-amber-600',
      border: 'border-amber-500',
      bg: 'bg-amber-100',
      text: 'text-amber-600',
    },
  }
} as const

/**
 * ATHLETE CARD COLOR TYPES - For type safety
 */
export type AthleteCardColor = keyof typeof CIRFPRO_EXTENDED_COLORS.athlete

/**
 * LEGACY SUPPORT - Keep your existing constants
 * We'll migrate these gradually to the new system above
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

export const CIRFPRO_GRADIENTS = {
  primary: 'linear-gradient(135deg, #29b643 0%, #1f8c33 100%)',
  primaryHover: 'linear-gradient(135deg, #1f8c33 0%, #166425 100%)',
  background: 'linear-gradient(135deg, #5a5e64 0%, #404449 100%)',
  text: 'linear-gradient(135deg, #29b643, #5a5e64)',
} as const

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

export const CIRFPRO_SHADOWS = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  green: '0 4px 12px rgba(41, 182, 67, 0.3)',
} as const

/**
 * NEW DESIGN SYSTEM - Component base classes
 */
export const CIRFPRO_COMPONENTS = {
  // Card variants
  card: {
    base: 'bg-white rounded-lg border border-cirfpro-gray-200 shadow-sm',
    elevated: 'bg-white rounded-lg shadow-lg',
    interactive: 'bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer',
    brand: 'bg-white rounded-lg border-l-4 border-cirfpro-green shadow-sm',
  },
  
  // Button base classes (to be used with CVA)
  button: {
    base: 'inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cirfpro-green focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
    sizes: {
      sm: 'h-9 px-3 text-sm',
      md: 'h-11 px-6 py-3 text-base',
      lg: 'h-12 px-8 py-3 text-lg',
      xl: 'h-14 px-10 py-4 text-xl',
    }
  },

  // Carousel base classes (new for athlete carousel)
  carousel: {
    container: 'relative w-full',
    scrollArea: 'flex gap-4 overflow-x-auto scroll-smooth',
    navButton: 'absolute top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white rounded-full shadow-lg border border-cirfpro-gray-200 flex items-center justify-center text-cirfpro-gray-600 hover:text-cirfpro-gray-800 hover:bg-cirfpro-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-cirfpro-green-500 focus:ring-offset-2',
    indicators: 'flex justify-center gap-2 mt-4',
    indicator: 'w-2 h-2 rounded-full transition-colors cursor-pointer',
  }
} as const
