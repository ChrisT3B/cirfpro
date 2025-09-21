// src/components/ui/Button.tsx
import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/styles'

const buttonVariants = cva(
  // Base styles for all buttons
  "inline-flex items-center justify-center rounded-lg font-semibold font-open-sans transition-all duration-200 focus:outline-none disabled:cursor-not-allowed transform active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary: [
          "text-white shadow-lg hover:shadow-xl hover:scale-[1.02]",
          // Using CSS-in-JS for gradient since Tailwind doesn't support it directly
        ],
        secondary: [
          "bg-white text-gray-700 border-2 shadow-sm hover:shadow-md",
          "hover:bg-gray-50 hover:scale-[1.02]",
        ],
        outline: [
          "bg-transparent border-2 shadow-sm hover:shadow-md",
          "hover:scale-[1.02]",
        ],
        ghost: [
          "bg-transparent shadow-none hover:bg-gray-100",
          "hover:scale-[1.02]",
        ],
        destructive: [
          "bg-red-600 text-white shadow-lg hover:shadow-xl",
          "hover:bg-red-700 hover:scale-[1.02]",
        ],
      },
      size: {
        sm: "h-9 px-3 text-sm",
        default: "h-11 px-6 py-3",
        lg: "h-12 px-8 py-3 text-lg",
        xl: "h-14 px-10 py-4 text-xl",
      },
      width: {
        auto: "w-auto",
        full: "w-full",
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
      width: "auto",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
  children: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, width, loading, disabled, children, style, ...props }, ref) => {
    // Dynamic styles for primary variant (gradients)
    const getPrimaryStyles = () => {
      if (variant === 'primary') {
        return {
          background: loading || disabled 
            ? '#9ca3af' 
            : 'linear-gradient(135deg, #29b643 0%, #1f8c33 100%)',
          ...style
        }
      }
      if (variant === 'outline') {
        return {
          borderColor: '#29b643',
          color: '#29b643',
          ...style
        }
      }
      return style
    }

    const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (variant === 'primary' && !loading && !disabled) {
        e.currentTarget.style.background = 'linear-gradient(135deg, #1f8c33 0%, #166425 100%)'
      }
      if (variant === 'outline' && !disabled) {
        e.currentTarget.style.backgroundColor = '#29b643'
        e.currentTarget.style.color = 'white'
      }
    }

    const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (variant === 'primary' && !loading && !disabled) {
        e.currentTarget.style.background = 'linear-gradient(135deg, #29b643 0%, #1f8c33 100%)'
      }
      if (variant === 'outline' && !disabled) {
        e.currentTarget.style.backgroundColor = 'transparent'
        e.currentTarget.style.color = '#29b643'
      }
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, width, className }))}
        style={getPrimaryStyles()}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        disabled={disabled || loading}
        ref={ref}
        {...props}
      >
        {loading ? (
          <>
            <svg 
              className="animate-spin -ml-1 mr-3 h-5 w-5" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Loading...
          </>
        ) : (
          children
        )}
      </button>
    )
  }
)

Button.displayName = "Button"

export { Button, buttonVariants }
export default Button