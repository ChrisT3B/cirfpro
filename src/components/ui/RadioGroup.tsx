// src/components/ui/RadioGroup.tsx
'use client'

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/styles'
import { Text } from './Typography'

// RadioGroup variants using CVA (following CIRFPRO design system pattern)
const radioGroupVariants = cva([
  "space-y-2"
], {
  variants: {
    variant: {
      default: "",
      cards: "grid grid-cols-1 md:grid-cols-2 gap-3 space-y-0"
    }
  },
  defaultVariants: {
    variant: "default"
  }
})

const radioItemVariants = cva([
  "flex items-start transition-colors"
], {
  variants: {
    variant: {
      default: "",
      cards: "block w-full p-4 border rounded-lg cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-cirfpro-green-500 focus-within:ring-offset-2"
    },
    selected: {
      true: "",
      false: ""
    }
  },
  compoundVariants: [
    {
      variant: "cards",
      selected: true,
      class: "border-cirfpro-green-500 bg-cirfpro-green-50 text-cirfpro-green-700"
    },
    {
      variant: "cards", 
      selected: false,
      class: "border-cirfpro-gray-300 text-cirfpro-gray-700 hover:border-cirfpro-gray-400"
    }
  ],
  defaultVariants: {
    variant: "default",
    selected: false
  }
})

const radioInputVariants = cva([
  "h-4 w-4 border-cirfpro-gray-300 focus:ring-cirfpro-green-500 transition-colors"
], {
  variants: {
    variant: {
      default: "mt-0.5 mr-3 text-cirfpro-green-500",
      cards: "sr-only"
    }
  },
  defaultVariants: {
    variant: "default"
  }
})

const labelVariants = cva([
  "block text-sm font-medium mb-2 text-cirfpro-gray-700"
])

const helperTextVariants = cva([
  "text-xs mt-1"
], {
  variants: {
    variant: {
      default: "text-cirfpro-gray-500",
      error: "text-red-600"
    }
  },
  defaultVariants: {
    variant: "default"
  }
})

// RadioGroup option interface
interface RadioOption {
  value: string
  label: string
  description?: string
  disabled?: boolean
}

// RadioGroup component props
interface RadioGroupProps extends VariantProps<typeof radioGroupVariants> {
  name: string
  value?: string
  onChange: (value: string) => void
  options: RadioOption[]
  label?: string
  error?: string
  helperText?: string
  required?: boolean
  className?: string
  disabled?: boolean
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ 
    name, 
    value, 
    onChange, 
    options, 
    label, 
    error, 
    helperText, 
    required, 
    variant, 
    className,
    disabled,
    ...props 
  }, ref) => {
    return (
      <div className={cn("space-y-2", className)} ref={ref} {...props}>
        {/* Label */}
        {label && (
          <label className={cn(labelVariants())}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        {/* Radio options */}
        <div className={cn(radioGroupVariants({ variant }))}>
          {options.map((option) => {
            const isSelected = value === option.value
            const radioId = `${name}-${option.value}`
            const isDisabled = disabled || option.disabled
            
            return (
              <div
                key={option.value}
                className={cn(radioItemVariants({ 
                  variant, 
                  selected: isSelected 
                }))}
              >
                <input
                  type="radio"
                  id={radioId}
                  name={name}
                  value={option.value}
                  checked={isSelected}
                  onChange={(e) => onChange(e.target.value)}
                  disabled={isDisabled}
                  className={cn(radioInputVariants({ variant }))}
                />
                
                <label 
                  htmlFor={radioId} 
                  className={cn(
                    "flex-1 cursor-pointer",
                    variant === "cards" ? "block" : "flex flex-col",
                    isDisabled && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <Text 
                    size="sm" 
                    weight="medium"
                    className={variant === "cards" && isSelected ? "text-cirfpro-green-700" : ""}
                  >
                    {option.label}
                  </Text>
                  {option.description && (
                    <Text 
                      size="xs" 
                      color="muted" 
                      className={cn(
                        "mt-1",
                        variant === "cards" && isSelected && "text-cirfpro-green-600"
                      )}
                    >
                      {option.description}
                    </Text>
                  )}
                </label>
              </div>
            )
          })}
        </div>
        
        {/* Helper text or error */}
        {(error || helperText) && (
          <div className={cn(helperTextVariants({ variant: error ? 'error' : 'default' }))}>
            {error || helperText}
          </div>
        )}
      </div>
    )
  }
)

RadioGroup.displayName = "RadioGroup"

export {
  RadioGroup,
  type RadioGroupProps,
  type RadioOption
}