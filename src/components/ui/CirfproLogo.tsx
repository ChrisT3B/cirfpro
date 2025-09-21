// src/components/ui/CirfproLogo.tsx
import React from 'react'
import Image from 'next/image'

interface CirfproLogoProps {
  size?: 'small' | 'medium' | 'large' | 'xlarge' | 'xxlarge' | 'xxxlarge' | 'xxxxlarge'
  variant?: 'icon' | 'full' | 'text-only'
  className?: string
  showText?: boolean
}

const sizeClasses = {
  small: { container: 'w-8 h-8', text: 'text-lg', pixels: 32 },
  medium: { container: 'w-12 h-12', text: 'text-xl', pixels: 48 },
  large: { container: 'w-16 h-16', text: 'text-2xl', pixels: 64 },
  xlarge: { container: 'w-24 h-24', text: 'text-4xl', pixels: 96 },
  xxlarge: { container: 'w-32 h-32', text: 'text-5xl', pixels: 128 },
  xxxlarge: { container: 'w-40 h-40', text: 'text-6xl', pixels: 160 },
  xxxxlarge: { container: 'w-48 h-48', text: 'text-7xl', pixels: 192 }
}

export const CirfproLogo: React.FC<CirfproLogoProps> = ({ 
  size = 'medium', 
  variant = 'full', 
  className = '',
  showText = true 
}) => {
  const sizes = sizeClasses[size]

  // Use your SVG file from Inkscape
  const LogoIcon = () => (
    <div className={`${sizes.container} relative mx-auto ${className}`}>
      <Image
        src="/images/cirfpro-logo2.svg"
        alt="CIRFPRO Logo"
        width={sizes.pixels}
        height={sizes.pixels}
        priority
      />
    </div>
  )

  const LogoText = () => (
    <h1 className={`font-bold font-open-sans ${sizes.text} ${className}`}>
      Cirfpro
    </h1>
  )

  if (variant === 'icon') {
    return <LogoIcon />
  }

  if (variant === 'text-only') {
    return <LogoText />
  }

  // Full variant with icon and text
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <LogoIcon />
      {showText && (
        <div className="mt-2">
          <LogoText />
          {size === 'xlarge' && (
            <p className="text-sm font-open-sans text-center opacity-80 mt-1">
              Professional Running Coaching Platform
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default CirfproLogo