import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/styles'
import { Eye, EyeOff, AlertCircle, CheckCircle, Search } from 'lucide-react'

// Input variants using CVA (following your established pattern)
const inputVariants = cva([
  "w-full rounded-lg border px-3 py-2 transition-all duration-200",
  "focus:outline-none focus:ring-2 focus:border-transparent",
  "disabled:cursor-not-allowed disabled:opacity-50",
  "placeholder:text-cirfpro-gray-400"
], {
  variants: {
    variant: {
      default: [
        "border-cirfpro-gray-300 bg-white",
        "focus:ring-cirfpro-green-500 focus:ring-opacity-20",
        "hover:border-cirfpro-gray-400"
      ],
      error: [
        "border-red-300 bg-red-50",
        "focus:ring-red-500 focus:ring-opacity-20",
        "text-red-900"
      ],
      success: [
        "border-green-300 bg-green-50", 
        "focus:ring-green-500 focus:ring-opacity-20",
        "text-green-900"
      ],
      search: [
        "border-cirfpro-gray-300 bg-cirfpro-gray-50",
        "focus:ring-cirfpro-green-500 focus:ring-opacity-20",
        "focus:bg-white"
      ]
    },
    size: {
      sm: "px-2 py-1.5 text-sm",
      md: "px-3 py-2", 
      lg: "px-4 py-3 text-lg"
    }
  },
  defaultVariants: {
    variant: "default",
    size: "md"
  }
})

// Label component variants (updated to match Input variants)
const labelVariants = cva([
  "block text-sm font-medium mb-1"
], {
  variants: {
    variant: {
      default: "text-cirfpro-gray-700",
      error: "text-red-700",
      success: "text-green-700",
      search: "text-cirfpro-gray-700"
    },
    required: {
      true: "after:content-['*'] after:text-red-500 after:ml-1",
      false: ""
    }
  },
  defaultVariants: {
    variant: "default",
    required: false
  }
})

// Helper text component for errors, hints, etc.
const helperTextVariants = cva([
  "text-xs mt-1 flex items-center gap-1"
], {
  variants: {
    variant: {
      default: "text-cirfpro-gray-500",
      error: "text-red-600",
      success: "text-green-600",
      hint: "text-cirfpro-gray-400"
    }
  },
  defaultVariants: {
    variant: "default"
  }
})

// Input wrapper for consistent spacing and layout
const InputWrapper = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { spacing?: 'sm' | 'md' | 'lg' }
>(({ className, spacing = 'md', children, ...props }, ref) => {
  const spacingClasses = {
    sm: 'mb-3',
    md: 'mb-4', 
    lg: 'mb-6'
  }
  
  return (
    <div 
      ref={ref}
      className={cn(spacingClasses[spacing], className)}
      {...props}
    >
      {children}
    </div>
  )
})
InputWrapper.displayName = "InputWrapper"

// Label component
interface LabelProps extends 
  React.LabelHTMLAttributes<HTMLLabelElement>,
  VariantProps<typeof labelVariants> {
  children: React.ReactNode
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, variant, required, children, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(labelVariants({ variant, required }), className)}
        {...props}
      >
        {children}
      </label>
    )
  }
)
Label.displayName = "Label"

// Helper text component
interface HelperTextProps extends 
  React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof helperTextVariants> {
  children: React.ReactNode
  icon?: boolean
}

const HelperText = React.forwardRef<HTMLDivElement, HelperTextProps>(
  ({ className, variant, icon = true, children, ...props }, ref) => {
    const getIcon = () => {
      if (!icon) return null
      
      switch (variant) {
        case 'error':
          return <AlertCircle className="w-3 h-3 flex-shrink-0" />
        case 'success':
          return <CheckCircle className="w-3 h-3 flex-shrink-0" />
        default:
          return null
      }
    }
    
    return (
      <div
        ref={ref}
        className={cn(helperTextVariants({ variant }), className)}
        {...props}
      >
        {getIcon()}
        <span>{children}</span>
      </div>
    )
  }
)
HelperText.displayName = "HelperText"

// Main Input component
interface InputProps extends 
  Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
  VariantProps<typeof inputVariants> {
  label?: string
  helperText?: string
  error?: string
  success?: string
  required?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  loading?: boolean
  wrapperClassName?: string
  labelClassName?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    variant, 
    size,
    label,
    helperText,
    error,
    success,
    required,
    leftIcon,
    rightIcon,
    loading,
    wrapperClassName,
    labelClassName,
    disabled,
    type,
    ...props 
  }, ref) => {
    // Determine the actual variant based on error/success states
    const actualVariant = error ? 'error' : success ? 'success' : variant
    
    const inputElement = (
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className="text-cirfpro-gray-400">
              {leftIcon}
            </div>
          </div>
        )}
        
        <input
          ref={ref}
          type={type}
          disabled={disabled || loading}
          className={cn(
            inputVariants({ variant: actualVariant, size }),
            leftIcon && "pl-10",
            (rightIcon || loading) && "pr-10",
            className
          )}
          {...props}
        />
        
        {(rightIcon || loading) && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-cirfpro-green-500 border-t-transparent" />
            ) : (
              <div className="text-cirfpro-gray-400">
                {rightIcon}
              </div>
            )}
          </div>
        )}
      </div>
    )
    
    // If no label or helper text, return just the input
    if (!label && !helperText && !error && !success) {
      return inputElement
    }
    
    // Return wrapped input with label and helper text
    return (
      <InputWrapper className={wrapperClassName}>
        {label && (
          <Label 
            htmlFor={props.id}
            variant={actualVariant}
            required={required}
            className={labelClassName}
          >
            {label}
          </Label>
        )}
        
        {inputElement}
        
        {(error || success || helperText) && (
          <HelperText 
            variant={error ? 'error' : success ? 'success' : 'hint'}
          >
            {error || success || helperText}
          </HelperText>
        )}
      </InputWrapper>
    )
  }
)
Input.displayName = "Input"

// Password Input component (extends Input with show/hide functionality)
interface PasswordInputProps extends Omit<InputProps, 'type' | 'rightIcon'> {
  showPasswordText?: string
  hidePasswordText?: string
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ 
    showPasswordText = "Show password",
    hidePasswordText = "Hide password",
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = React.useState<boolean>(false)
    
    return (
      <Input
        ref={ref}
        type={showPassword ? "text" : "password"}
        rightIcon={
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="hover:text-cirfpro-gray-600 transition-colors"
            title={showPassword ? hidePasswordText : showPasswordText}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        }
        {...props}
      />
    )
  }
)
PasswordInput.displayName = "PasswordInput"

// Search Input component (extends Input with search styling and functionality)
interface SearchInputProps extends Omit<InputProps, 'leftIcon' | 'variant'> {
  onSearch?: (value: string) => void
  searchDelay?: number
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ 
    onSearch,
    searchDelay = 300,
    placeholder = "Search...",
    value,
    onChange,
    ...props 
  }, ref) => {
    const [searchValue, setSearchValue] = React.useState<string>(
      (value as string) || ''
    )
    const timeoutRef = React.useRef<NodeJS.Timeout | undefined>(undefined)
    
    React.useEffect(() => {
      if (onSearch && typeof searchValue === 'string') {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
        
        timeoutRef.current = setTimeout(() => {
          onSearch(searchValue)
        }, searchDelay)
      }
      
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
      }
    }, [searchValue, onSearch, searchDelay])
    
    return (
      <Input
        ref={ref}
        variant="search"
        leftIcon={<Search className="w-4 h-4" />}
        placeholder={placeholder}
        value={searchValue}
        onChange={(e) => {
          setSearchValue(e.target.value)
          onChange?.(e)
        }}
        {...props}
      />
    )
  }
)
SearchInput.displayName = "SearchInput"

// Export all components
export {
  Input,
  PasswordInput, 
  SearchInput,
  InputWrapper,
  Label,
  HelperText,
  type InputProps,
  type PasswordInputProps,
  type SearchInputProps
}