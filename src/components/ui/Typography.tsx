// src/components/ui/Typography.tsx - Complete Typography System for CIRFPRO
import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/styles'

/**
 * HEADING COMPONENT SYSTEM
 * Replaces all h1, h2, h3, h4, h5, h6 elements with consistent styling
 */
const headingVariants = cva(
  [
    // Base heading styles - Open Sans font family
    "font-open-sans font-semibold text-cirfpro-gray-900 leading-tight tracking-tight"
  ],
  {
    variants: {
      level: {
        // Display headings (hero sections, landing pages)
        display: "text-4xl md:text-5xl lg:text-6xl font-bold",
        
        // Standard heading hierarchy
        h1: "text-3xl md:text-4xl font-bold",     // Page titles
        h2: "text-2xl md:text-3xl",              // Section headings
        h3: "text-xl md:text-2xl",               // Subsection headings
        h4: "text-lg md:text-xl",                // Card titles
        h5: "text-base md:text-lg",              // Small headings
        h6: "text-sm md:text-base",              // Caption headings
        
        // Utility sizes (for specific use cases)
        "2xl": "text-2xl font-bold",             // Large numbers/stats
        xl: "text-xl",                           // Prominent text
        lg: "text-lg",                           // Emphasized text
      },
      color: {
        default: "text-cirfpro-gray-900",
        muted: "text-cirfpro-gray-600",
        brand: "text-cirfpro-green-600",
        light: "text-cirfpro-gray-500",
        white: "text-white",
      },
      align: {
        left: "text-left",
        center: "text-center", 
        right: "text-right",
      }
    },
    defaultVariants: {
      level: "h2",
      color: "default",
      align: "left",
    },
  }
)

/**
 * TEXT/BODY COMPONENT SYSTEM  
 * Replaces all p, span elements with consistent styling
 */
const textVariants = cva(
  [
    // Base text styles - Open Sans font family
    "font-open-sans text-cirfpro-gray-700 leading-relaxed"
  ],
  {
    variants: {
      size: {
        xs: "text-xs",           // Fine print, captions
        sm: "text-sm",           // Small text, labels
        base: "text-base",       // Body text (default)
        lg: "text-lg",           // Large body text
        xl: "text-xl",           // Prominent text
      },
      weight: {
        normal: "font-normal",
        medium: "font-medium",
        semibold: "font-semibold",
        bold: "font-bold",
      },
      color: {
        default: "text-cirfpro-gray-700",
        muted: "text-cirfpro-gray-600",
        light: "text-cirfpro-gray-500",
        dark: "text-cirfpro-gray-900",
        brand: "text-cirfpro-green-600",
        white: "text-white",
        // Status colors
        success: "text-green-600",
        warning: "text-yellow-600", 
        error: "text-red-600",
        info: "text-blue-600",
      },
      align: {
        left: "text-left",
        center: "text-center",
        right: "text-right",
      }
    },
    defaultVariants: {
      size: "base",
      weight: "normal", 
      color: "default",
      align: "left",
    },
  }
)

/**
 * LABEL COMPONENT SYSTEM
 * For form labels, input labels, etc.
 */
const labelVariants = cva(
  [
    "font-open-sans font-medium text-cirfpro-gray-700 leading-none"
  ],
  {
    variants: {
      size: {
        xs: "text-xs",
        sm: "text-sm", 
        base: "text-sm",
        lg: "text-base",
      },
      required: {
        true: "after:content-['*'] after:text-red-500 after:ml-1",
        false: "",
      }
    },
    defaultVariants: {
      size: "base",
      required: false,
    },
  }
)

// TYPE DEFINITIONS
export interface HeadingProps
  extends Omit<React.HTMLAttributes<HTMLHeadingElement>, 'color'>,
    VariantProps<typeof headingVariants> {
  children: React.ReactNode
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div'
}

export interface TextProps
  extends Omit<React.HTMLAttributes<HTMLParagraphElement>, 'color'>,
    VariantProps<typeof textVariants> {
  children: React.ReactNode
  as?: 'p' | 'span' | 'div'
}

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement>,
    VariantProps<typeof labelVariants> {
  children: React.ReactNode
}

/**
 * HEADING COMPONENT
 * Usage: <Heading level="h1" color="brand">Page Title</Heading>
 */
const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, level = "h2", color, align, as, children, ...props }, ref) => {
    // Determine the HTML element to render
    const Component = as || (level === 'display' ? 'h1' : level?.startsWith('h') ? level as 'h1' : 'h2')
    
    return (
      <Component
        className={cn(headingVariants({ level, color, align }), className)}
        ref={ref}
        {...props}
      >
        {children}
      </Component>
    )
  }
)
Heading.displayName = "Heading"

/**
 * TEXT COMPONENT  
 * Usage: <Text size="lg" weight="medium">Body content here</Text>
 */
const Text = React.forwardRef<HTMLParagraphElement, TextProps>(
  ({ className, size, weight, color, align, as = 'p', children, ...props }, ref) => {
    const Component = as
    
    return (
      <Component
        className={cn(textVariants({ size, weight, color, align }), className)}
        ref={ref}
        {...props}
      >
        {children}
      </Component>
    )
  }
)
Text.displayName = "Text"

/**
 * LABEL COMPONENT
 * Usage: <Label required>Email Address</Label>
 */
const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, size, required, children, ...props }, ref) => {
    return (
      <label
        className={cn(labelVariants({ size, required }), className)}
        ref={ref}
        {...props}
      >
        {children}
      </label>
    )
  }
)
Label.displayName = "Label"

/**
 * SPECIALIZED TYPOGRAPHY UTILITIES
 * Common patterns used throughout your app
 */

// Badge/Tag component for status indicators
interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'brand'
  size?: 'sm' | 'base' | 'lg'
  children: React.ReactNode
}

const badgeVariants = cva(
  [
    "inline-flex items-center font-medium rounded-full font-open-sans"
  ],
  {
    variants: {
      variant: {
        default: "bg-cirfpro-gray-100 text-cirfpro-gray-700",
        success: "bg-green-100 text-green-700",
        warning: "bg-yellow-100 text-yellow-700", 
        error: "bg-red-100 text-red-700",
        info: "bg-blue-100 text-blue-700",
        brand: "bg-cirfpro-green-100 text-cirfpro-green-700",
      },
      size: {
        sm: "px-2 py-1 text-xs",
        base: "px-3 py-1 text-sm",
        lg: "px-4 py-2 text-base",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "base",
    },
  }
)

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, children, ...props }, ref) => {
    return (
      <span
        className={cn(badgeVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      >
        {children}
      </span>
    )
  }
)
Badge.displayName = "Badge"

// Caption component for small descriptive text
interface CaptionProps extends TextProps {
  uppercase?: boolean
}

const Caption = React.forwardRef<HTMLParagraphElement, CaptionProps>(
  ({ className, uppercase = false, children, ...props }, ref) => {
    return (
      <Text
        size="xs"
        weight="medium"
        color="muted"
        className={cn(uppercase && "uppercase tracking-wide", className)}
        ref={ref}
        {...props}
      >
        {children}
      </Text>
    )
  }
)
Caption.displayName = "Caption"

/**
 * EXPORT ALL COMPONENTS AND VARIANTS
 */
export {
  Heading,
  Text,
  Label,
  Badge,
  Caption,
  headingVariants,
  textVariants,
  labelVariants,
  badgeVariants,
}

/**
 * USAGE EXAMPLES FOR YOUR MIGRATION:
 * 
 * // Replace this:
 * <h2 className="text-2xl font-semibold text-gray-900 mb-4">Dashboard</h2>
 * 
 * // With this:
 * <Heading level="h2" className="mb-4">Dashboard</Heading>
 * 
 * // Replace this:
 * <p className="text-sm text-gray-600">Total Athletes</p>
 * 
 * // With this:
 * <Text size="sm" color="muted">Total Athletes</Text>
 * 
 * // Replace this:
 * <span className="text-xs font-medium text-gray-600 uppercase">Status</span>
 * 
 * // With this:
 * <Caption uppercase>Status</Caption>
 */