// src/lib/authTest.ts - Minimal auth test
import { createClient } from '@/lib/supabase'

export const testSupabaseAuth = async (email: string, password: string) => {
  const supabase = createClient()
  
  console.log('Testing basic Supabase auth with:', { email })
  console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log('Environment variables check:', {
    hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    urlLength: process.env.NEXT_PUBLIC_SUPABASE_URL?.length
  })

  try {
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    })

    console.log('Raw auth response:', { 
      user: data?.user, 
      session: data?.session,
      error: error ? {
        message: error.message,
        status: error.status,
        name: error.name,
        stack: error.stack
      } : null
    })

    return { data, error }
  } catch (err) {
    console.error('Caught exception during auth test:', err)
    return { data: null, error: err }
  }
}