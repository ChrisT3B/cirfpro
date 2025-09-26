// src/components/ui/Card.tsx - Universal Card Component
import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/styles'

const cardVariants = cva(
  [
    // Base card styles - replaces all your bg-white rounded-lg patterns
    "bg-white rounded-lg transition-all duration-200"
  ],
  {
    variants: {
      variant: {
        // Basic card (most common in your codebase)
        default: "shadow-sm",
        // Elevated cards (for important content)
        elevated: "shadow-lg",
        // Interactive cards (clickable)
        interactive: "shadow-sm hover:shadow-md cursor-pointer hover:scale-[1.01]",
        // Bordered cards (alternative to shadow)
        bordered: "border border-cirfpro-gray-200 shadow-none",
        // Accent cards (with left border - for stats)
        accent: "shadow-sm border-l-4",
        // Flat cards (no shadow)
        flat: "shadow-none",
      },
      padding: {
        none: "",
        sm: "p-4",      // For compact cards (invitation stats)
        default: "p-6", // Most dashboard cards use this
        lg: "p-8",      // For hero/feature cards
      },
      radius: {
        default: "rounded-lg", // Your standard
        sm: "rounded",
        lg: "rounded-xl", 
        none: "rounded-none",
      }
    },
    defaultVariants: {
      variant: "default",
      padding: "default",
      radius: "default",
    },
  }
)

// Type for accent colors (for border-l-4 variant)
type AccentColor = 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray' | 'cirfpro-green'

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  children: React.ReactNode
  accentColor?: AccentColor
  asChild?: boolean
}

// Helper function for accent border colors
const getAccentColorClass = (color: AccentColor): string => {
  const colorMap: Record<AccentColor, string> = {
    blue: 'border-l-blue-500',
    green: 'border-l-green-500',
    'cirfpro-green': 'border-l-cirfpro-green-500',
    red: 'border-l-red-500',
    yellow: 'border-l-yellow-500',
    purple: 'border-l-purple-500',
    gray: 'border-l-cirfpro-gray-400',
  }
  return colorMap[color] || ''
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, radius, accentColor, children, ...props }, ref) => {
    // Build the accent color class for border-l-4 variant
    const accentClass = variant === 'accent' && accentColor ? getAccentColorClass(accentColor) : ''
    
    return (
      <div
        ref={ref}
        className={cn(
          cardVariants({ variant, padding, radius }),
          accentClass,
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = "Card"

// Additional compound components for common patterns
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 pb-4", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-lg font-semibold text-cirfpro-gray-900", className)}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-cirfpro-gray-600", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center pt-4", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter,
  cardVariants,
  type AccentColor
}