'use client'

import React, { useRef, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/styles'

interface StatsCarouselProps {
  children: React.ReactNode
  className?: string
}

export default function StatsCarousel({ children, className }: StatsCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      setCanScrollLeft(container.scrollLeft > 10)
      setCanScrollRight(
        container.scrollLeft + container.offsetWidth < container.scrollWidth - 10
      )
    }

    container.addEventListener('scroll', handleScroll)
    window.addEventListener('resize', handleScroll)
    handleScroll()

    return () => {
      container.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [])

  const scroll = (dir: 'left' | 'right') => {
    const container = containerRef.current
    if (!container) return
    const scrollAmount = container.offsetWidth * 0.8
    container.scrollBy({
      left: dir === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    })
  }

  return (
    <div className={cn('relative w-full', className)}>
      {/* Fade edges */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-white via-white/80 to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-white via-white/80 to-transparent z-10" />

      {/* Nav buttons (desktop) */}
      <button
        onClick={() => scroll('left')}
        className={cn(
          'absolute top-1/2 -translate-y-1/2 left-2 z-20 hidden sm:flex w-8 h-8 bg-white rounded-full shadow border border-gray-200 items-center justify-center text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-all',
          canScrollLeft ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <button
        onClick={() => scroll('right')}
        className={cn(
          'absolute top-1/2 -translate-y-1/2 right-2 z-20 hidden sm:flex w-8 h-8 bg-white rounded-full shadow border border-gray-200 items-center justify-center text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-all',
          canScrollRight ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Scrollable area */}
      <div
        ref={containerRef}
        className="flex gap-4 overflow-x-auto scroll-smooth px-6 py-4 snap-x snap-mandatory 
                   [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {React.Children.map(children, (child) => (
          <div className="flex-shrink-0 snap-center">{child}</div>
        ))}
      </div>
    </div>
  )
}
