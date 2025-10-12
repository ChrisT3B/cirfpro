// src/app/auth/callback/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const token_hash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type')
  const next = requestUrl.searchParams.get('next') ?? '/dashboard'

  console.log('Auth callback triggered with:', { 
    token_hash: token_hash?.substring(0, 10), 
    type,
    origin: requestUrl.origin 
  })

  // Handle email verification callback
  if (token_hash && type) {
    const supabase = await createClient()

    try {
      console.log('Processing email verification via Supabase')
      
      // Verify the token with Supabase
      // This confirms the email and triggers your database migration
      const { error } = await supabase.auth.verifyOtp({
        token_hash,
        type: type as any,
      })

      if (error) {
        console.error('Email verification failed:', error.message)
        return NextResponse.redirect(
          `${requestUrl.origin}/auth/signin?error=verification_failed&message=${encodeURIComponent(error.message)}`
        )
      }

      console.log('✅ Email verification successful')
      
      // Database trigger has now migrated user from pending_users to users
      // Redirect to sign-in with success message
      return NextResponse.redirect(
        `${requestUrl.origin}/auth/signin?verified=true&message=${encodeURIComponent('Email verified successfully! You can now sign in.')}`
      )

    } catch (error) {
      console.error('Unexpected error in auth callback:', error)
      return NextResponse.redirect(
        `${requestUrl.origin}/auth/signin?error=unexpected_error&message=${encodeURIComponent('An unexpected error occurred during verification')}`
      )
    }
  }

  // Handle other callback types or standard auth redirects
  console.log('Standard auth callback, redirecting to:', next)
  return NextResponse.redirect(`${requestUrl.origin}${next}`)
}