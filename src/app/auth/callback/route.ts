// src/app/auth/callback/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/authService'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const token = requestUrl.searchParams.get('token')
  const type = requestUrl.searchParams.get('type')

  console.log('Auth callback triggered with:', { token: token?.substring(0, 10), type })

  if (token && type === 'signup') {
    try {
      console.log('Processing email verification with AuthService')
      
      // Use your proven verification method
      const result = await AuthService.verifyEmail(token)
      
      if (result.success) {
        console.log('Email verification successful')
        return NextResponse.redirect(
          `${requestUrl.origin}/auth/signin?verified=true&message=${encodeURIComponent(result.message)}`
        )
      } else {
        console.error('Email verification failed:', result.message)
        return NextResponse.redirect(
          `${requestUrl.origin}/auth/signin?error=verification_failed&message=${encodeURIComponent(result.message)}`
        )
      }
    } catch (error) {
      console.error('Unexpected error in auth callback:', error)
      return NextResponse.redirect(
        `${requestUrl.origin}/auth/signin?error=unexpected_error&message=${encodeURIComponent('An unexpected error occurred during verification')}`
      )
    }
  }

  // Handle other callback types or missing parameters
  console.log('Invalid callback parameters, redirecting to signin')
  return NextResponse.redirect(`${requestUrl.origin}/auth/signin`)
}