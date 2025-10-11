'use client'

import React, { useState, useRef, useEffect } from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/styles'
import { ChevronLeft, ChevronRight, User } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/Card'
import { Heading, Text, Badge } from '@/components/ui/Typography'
import { CIRFPRO_EXTENDED_COLORS } from '@/lib/styles'

/* ---------------------------------------------
   🟢 Types
---------------------------------------------- */
export type AthleteCardColor = keyof typeof CIRFPRO_EXTENDED_COLORS.athlete

interface Athlete {
  id: string
  first_name: string
  last_name: string
  email: string
  experience_level: string
  goal_race_distance: string | null
  created_at: string
}

interface AthletesCarouselProps {
  athletes: Athlete[]
  coachSlug: string
  className?: string
}

/* ---------------------------------------------
   🟣 Helpers & Variants
---------------------------------------------- */
const athleteCardVariants = cva([
  'group cursor-pointer transform transition-all duration-300',
  'hover:shadow-lg overflow-hidden flex-shrink-0'
])

const navButtonVariants = cva(
  [
    'absolute top-1/2 -translate-y-1/2 z-20',
    'w-10 h-10 bg-white rounded-full shadow-lg border border-cirfpro-gray-200',
    'flex items-center justify-center text-cirfpro-gray-600 hover:text-cirfpro-gray-800',
    'hover:bg-cirfpro-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-cirfpro-green-500 focus:ring-offset-2'
  ],
  {
    variants: {
      position: { left: 'left-2', right: 'right-2' },
      visible: { true: '', false: 'opacity-0 pointer-events-none' }
    }
  }
)

const indicatorVariants = cva(['w-2 h-2 rounded-full transition-colors cursor-pointer'], {
  variants: {
    active: {
      true: 'bg-cirfpro-green-500',
      false: 'bg-cirfpro-gray-300 hover:bg-cirfpro-gray-400'
    }
  },
  defaultVariants: { active: false }
})

// Return color key in rotation
const getAthleteCardColor = (index: number): AthleteCardColor => {
  const colors = Object.keys(CIRFPRO_EXTENDED_COLORS.athlete) as AthleteCardColor[]
  return colors[index % colors.length]
}

// Extract gradient Tailwind class
const getGradientClass = (colorKey: AthleteCardColor) =>
  CIRFPRO_EXTENDED_COLORS.athlete[colorKey].gradient

/* ---------------------------------------------
   🟡 Component
---------------------------------------------- */
export default function AthletesCarouselPro({
  athletes,
  coachSlug,
  className
}: AthletesCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  /* Center scroll helpers */
  const scrollToIndex = (index: number) => {
    if (!scrollContainerRef.current) return
    const container = scrollContainerRef.current
    const card = container.children[index] as HTMLElement
    if (!card) return

    const cardCenter = card.offsetLeft - container.offsetWidth / 2 + card.offsetWidth / 2
    container.scrollTo({ left: cardCenter, behavior: 'smooth' })
    setCurrentIndex(index)
  }

  const scrollLeft = () => currentIndex > 0 && scrollToIndex(currentIndex - 1)
  const scrollRight = () => currentIndex < athletes.length - 1 && scrollToIndex(currentIndex + 1)

  /* Detect which card is centered */
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const handleScroll = () => {
      const containerCenter = container.scrollLeft + container.offsetWidth / 2
      let closestIndex = 0
      let minDistance = Infinity

      Array.from(container.children).forEach((child, index) => {
        const el = child as HTMLElement
        const elCenter = el.offsetLeft + el.offsetWidth / 2
        const distance = Math.abs(containerCenter - elCenter)
        if (distance < minDistance) {
          minDistance = distance
          closestIndex = index
        }
      })

      setCurrentIndex(closestIndex)
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
  }, [athletes.length])

  /* Center first card on mount */
  useEffect(() => {
    if (!scrollContainerRef.current || athletes.length === 0) return
    const container = scrollContainerRef.current

    const centerFirstCard = () => {
      const firstCard = container.children[0] as HTMLElement
      if (!firstCard) return
      const cardCenter =
        firstCard.offsetLeft - container.offsetWidth / 2 + firstCard.offsetWidth / 2
      container.scrollTo({ left: cardCenter, behavior: 'auto' })
      setCurrentIndex(0)
    }

    const timeout = setTimeout(centerFirstCard, 100)
    window.addEventListener('resize', centerFirstCard)
    return () => {
      clearTimeout(timeout)
      window.removeEventListener('resize', centerFirstCard)
    }
  }, [athletes.length])

      /* ✨ Auto-snap to nearest card after scroll ends */
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    let timeoutId: ReturnType<typeof setTimeout>

    const handleScrollEnd = () => {
      const containerCenter = container.scrollLeft + container.offsetWidth / 2
      let closestIndex = 0
      let minDistance = Infinity

      Array.from(container.children).forEach((child, index) => {
        const el = child as HTMLElement
        const elCenter = el.offsetLeft + el.offsetWidth / 2
        const distance = Math.abs(containerCenter - elCenter)
        if (distance < minDistance) {
          minDistance = distance
          closestIndex = index
        }
      })

      // Smoothly scroll to that card if not already perfectly centered
      scrollToIndex(closestIndex)
    }

    const handleScroll = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(handleScrollEnd, 150) // 150ms pause = scroll stopped
    }

    container.addEventListener('scroll', handleScroll)
    return () => {
      clearTimeout(timeoutId)
      container.removeEventListener('scroll', handleScroll)
    }
  }, [athletes.length])

  /* Empty state */
  if (athletes.length === 0) {
    return (
      <Card className="py-12">
        <CardContent className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-cirfpro-gray-100 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-cirfpro-gray-400" />
          </div>
          <Heading level="h3" color="muted" className="mb-2">
            No Athletes Yet
          </Heading>
          <Text color="muted" className="mb-4">
            Invite athletes to start building your coaching practice
          </Text>
        </CardContent>
      </Card>
    )
  }

  /* Render */
  return (
    <div className={cn('relative w-full', className)}>
      {/* Fade overlays */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white via-white/80 to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white via-white/80 to-transparent z-10" />

      {/* Nav buttons */}
      <button
        onClick={scrollLeft}
        className={cn(
          navButtonVariants({ position: 'left', visible: canScrollLeft }),
          'hidden sm:flex'
        )}
        aria-label="Scroll left"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={scrollRight}
        className={cn(
          navButtonVariants({ position: 'right', visible: canScrollRight }),
          'hidden sm:flex'
        )}
        aria-label="Scroll right"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Scrollable container */}
      <div
        ref={scrollContainerRef}
        className={cn(
          'flex gap-6 overflow-x-auto scroll-smooth py-6 px-8 justify-start',
          '[&::-webkit-scrollbar]:hidden',
          '[-ms-overflow-style:none]',
          '[scrollbar-width:none]'
        )}
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {athletes.map((athlete, index) => {
          const color = getAthleteCardColor(index)
          const gradientClass = getGradientClass(color)
          const isActive = index === currentIndex

          return (
            <div
              key={athlete.id}
              className={cn(
                athleteCardVariants(),
                'w-[85%] sm:w-[60%] md:w-[45%] lg:w-[30%] max-w-[350px]',
                'transition-transform duration-300 ease-out'
              )}
              style={{
                scrollSnapAlign: 'center',
                transform: `scale(${isActive ? 1.05 : 0.9})`,
                opacity: isActive ? 1 : 0.7
              }}
            >
              <Link href={`/coach/${coachSlug}/athletes/${athlete.id}`} className="block h-full">
                <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-300 group-hover:scale-[1.02]">
                  <div className={cn(gradientClass, 'p-6 text-white relative')}>
                    <div className="absolute inset-0 opacity-10">
                      <div className="w-full h-full bg-gradient-to-br from-white to-transparent" />
                    </div>
                    <div className="relative z-10">
                      <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-3">
                        <Text className="text-white font-bold text-lg">
                          {athlete.first_name?.charAt(0)?.toUpperCase()}
                          {athlete.last_name?.charAt(0)?.toUpperCase()}
                        </Text>
                      </div>
                      <Heading level="h3" className="text-white mb-1">
                        {athlete.first_name} {athlete.last_name}
                      </Heading>
                      <div className="inline-block px-2 py-1 bg-white bg-opacity-20 rounded-full">
                        <Text size="sm" className="text-white font-medium capitalize">
                          {athlete.experience_level}
                        </Text>
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    {athlete.goal_race_distance && (
                      <div className="mb-3">
                        <Text size="sm" color="muted" className="mb-1">
                          Goal Distance
                        </Text>
                        <Badge variant="default">{athlete.goal_race_distance}</Badge>
                      </div>
                    )}
                    <div className="mb-3">
                      <Text size="sm" color="muted" className="mb-1">
                        Joined
                      </Text>
                      <Text size="sm">
                        {new Date(athlete.created_at).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </Text>
                    </div>
                    <div className="pt-2 border-t border-cirfpro-gray-100">
                      <Text size="sm" color="brand" className="font-medium group-hover:underline">
                        View Training Zone →
                      </Text>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          )
        })}
      </div>

      {/* Scroll indicators */}
      <div className="flex justify-center gap-2 mt-4">
        {athletes.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollToIndex(index)}
            className={cn(indicatorVariants({ active: index === currentIndex }))}
            aria-label={`Go to athlete ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
