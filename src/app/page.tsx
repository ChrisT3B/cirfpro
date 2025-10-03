'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Heading, Text } from '@/components/ui/Typography'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { 
  Activity, 
  Users, 
  TrendingUp, 
  Target,
  CheckCircle,
  ArrowRight
} from 'lucide-react'

export default function HomePage() {
  const { user, isCoach, isAthlete } = useAuth()

  // If user is authenticated, show relevant CTA
  const renderAuthenticatedCTA = () => {
    if (!user) return null

    return (
      <div className="bg-cirfpro-green-50 border border-cirfpro-green-200 rounded-lg p-6 mb-12">
        <div className="flex items-center justify-between">
          <div>
            <Heading level="h3" className="text-cirfpro-green-900 mb-2">
              Welcome back! 👋
            </Heading>
            <Text className="text-cirfpro-green-700">
              {isCoach ? 'Access your coaching workspace' : 'View your training dashboard'}
            </Text>
          </div>
          <Link href={isCoach ? '/coach' : '/athlete/dashboard'}>
            <Button variant="primary" size="lg">
              Go to Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-cirfpro-gray-50">
      {/* Hero Section */}
      <header className="bg-white border-b border-cirfpro-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-cirfpro-green-500 rounded-full flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <Heading level="h2" className="text-cirfpro-gray-900">
                CIRFPRO
              </Heading>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              {!user ? (
                <>
                  <Link href="/auth/signin">
                    <Button variant="outline">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button variant="primary">
                      Get Started
                    </Button>
                  </Link>
                </>
              ) : (
                <Link href={isCoach ? '/coach' : '/athlete/dashboard'}>
                  <Button variant="primary">
                    Dashboard
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Authenticated User CTA */}
        {renderAuthenticatedCTA()}

        {/* Hero Content */}
        <div className="text-center mb-16">
          <Heading level="h1" className="text-5xl font-bold text-cirfpro-gray-900 mb-6">
            Professional Running Coach Platform
          </Heading>
          <Text size="xl" color="muted" className="max-w-3xl mx-auto mb-8">
            Evidence-based training planning and athlete management for qualified running coaches. 
            Built on proven periodization principles.
          </Text>
          
          {!user && (
            <div className="flex items-center justify-center space-x-4">
              <Link href="/auth/signup?role=coach">
                <Button variant="primary" size="lg" className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>I'm a Coach</span>
                </Button>
              </Link>
              <Link href="/auth/signup?role=athlete">
                <Button variant="secondary" size="lg" className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>I'm an Athlete</span>
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Features for Coaches */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <Heading level="h2" className="text-3xl font-bold text-cirfpro-gray-900 mb-4">
              For Coaches
            </Heading>
            <Text size="lg" color="muted">
              Professional tools to manage your athletes and create evidence-based training plans
            </Text>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-2 border-cirfpro-gray-200 hover:border-cirfpro-green-500 transition-colors">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-cirfpro-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-cirfpro-green-600" />
                </div>
                <Heading level="h3" className="text-xl mb-3">
                  Periodization Planning
                </Heading>
                <Text color="muted">
                  Create macrocycles, mesocycles, and microcycles based on proven training principles. 
                  Plan from goal race backwards.
                </Text>
              </CardContent>
            </Card>

            <Card className="border-2 border-cirfpro-gray-200 hover:border-cirfpro-green-500 transition-colors">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <Heading level="h3" className="text-xl mb-3">
                  Athlete Management
                </Heading>
                <Text color="muted">
                  Dedicated workspace for each coach. Invite athletes, track progress, 
                  and communicate effectively.
                </Text>
              </CardContent>
            </Card>

            <Card className="border-2 border-cirfpro-gray-200 hover:border-cirfpro-green-500 transition-colors">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <Heading level="h3" className="text-xl mb-3">
                  Progress Tracking
                </Heading>
                <Text color="muted">
                  Monitor athlete compliance, performance trends, and training adaptations. 
                  Make data-driven decisions.
                </Text>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features for Athletes */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <Heading level="h2" className="text-3xl font-bold text-cirfpro-gray-900 mb-4">
              For Athletes
            </Heading>
            <Text size="lg" color="muted">
              Access professional coaching and structured training plans
            </Text>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="border-2 border-cirfpro-gray-200">
              <CardContent className="p-6">
                <CheckCircle className="w-8 h-8 text-cirfpro-green-500 mb-4" />
                <Heading level="h3" className="text-xl mb-3">
                  Professional Guidance
                </Heading>
                <Text color="muted">
                  Connect with qualified coaches who create personalized training plans 
                  based on your goals and experience.
                </Text>
              </CardContent>
            </Card>

            <Card className="border-2 border-cirfpro-gray-200">
              <CardContent className="p-6">
                <CheckCircle className="w-8 h-8 text-cirfpro-green-500 mb-4" />
                <Heading level="h3" className="text-xl mb-3">
                  Structured Training
                </Heading>
                <Text color="muted">
                  Follow evidence-based training plans designed to help you reach your 
                  running goals safely and effectively.
                </Text>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        {!user && (
          <div className="bg-cirfpro-green-500 rounded-2xl p-12 text-center">
            <Heading level="h2" className="text-3xl font-bold text-white mb-4">
              Ready to Get Started?
            </Heading>
            <Text size="lg" className="text-cirfpro-green-50 mb-8 max-w-2xl mx-auto">
              Join CIRFPRO today and experience professional running coaching built on 
              evidence-based training principles.
            </Text>
            <div className="flex items-center justify-center space-x-4">
              <Link href="/auth/signup">
                <Button 
                  variant="secondary" 
                  size="lg"
                  className="bg-white text-cirfpro-green-600 hover:bg-cirfpro-gray-50"
                >
                  Create Free Account
                </Button>
              </Link>
              <Link href="/coach/directory">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-white text-white hover:bg-cirfpro-green-600"
                >
                  Browse Coaches
                </Button>
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-cirfpro-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <Heading level="h3" className="text-sm font-semibold text-cirfpro-gray-900 mb-4">
                CIRFPRO
              </Heading>
              <Text size="sm" color="muted">
                Professional running coach platform built on evidence-based training principles.
              </Text>
            </div>
            <div>
              <Heading level="h3" className="text-sm font-semibold text-cirfpro-gray-900 mb-4">
                For Coaches
              </Heading>
              <ul className="space-y-2">
                <li>
                  <Link href="/auth/signup?role=coach" className="text-sm text-cirfpro-gray-600 hover:text-cirfpro-green-600">
                    Get Started
                  </Link>
                </li>
                <li>
                  <Link href="/features" className="text-sm text-cirfpro-gray-600 hover:text-cirfpro-green-600">
                    Features
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <Heading level="h3" className="text-sm font-semibold text-cirfpro-gray-900 mb-4">
                For Athletes
              </Heading>
              <ul className="space-y-2">
                <li>
                  <Link href="/auth/signup?role=athlete" className="text-sm text-cirfpro-gray-600 hover:text-cirfpro-green-600">
                    Get Started
                  </Link>
                </li>
                <li>
                  <Link href="/coach/directory" className="text-sm text-cirfpro-gray-600 hover:text-cirfpro-green-600">
                    Find a Coach
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <Heading level="h3" className="text-sm font-semibold text-cirfpro-gray-900 mb-4">
                Support
              </Heading>
              <ul className="space-y-2">
                <li>
                  <Link href="/support" className="text-sm text-cirfpro-gray-600 hover:text-cirfpro-green-600">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-sm text-cirfpro-gray-600 hover:text-cirfpro-green-600">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-cirfpro-gray-200">
            <Text size="sm" color="muted" className="text-center">
              © 2025 CIRFPRO. All rights reserved.
            </Text>
          </div>
        </div>
      </footer>
    </div>
  )
}