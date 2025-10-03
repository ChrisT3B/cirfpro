// src/lib/supabase/server.ts - DIAGNOSTIC VERSION
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database.types'

export async function createClient() {
  console.log('🔧 createClient() called in server.ts')
  
  try {
    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()
    
    console.log('🍪 Total cookies found:', allCookies.length)
    console.log('🍪 Cookie names:', allCookies.map(c => c.name))
    
    // Check for Supabase auth cookie
    const authCookie = allCookies.find(c => c.name.includes('auth-token'))
    console.log('🔑 Auth cookie found?', !!authCookie)
    if (authCookie) {
      console.log('🔑 Auth cookie name:', authCookie.name)
    }

    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            const cookies = cookieStore.getAll()
            console.log('🍪 getAll() called, returning', cookies.length, 'cookies')
            return cookies
          },
          setAll(cookiesToSet) {
            console.log('🍪 setAll() called with', cookiesToSet.length, 'cookies')
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                console.log('🍪 Setting cookie:', name)
                cookieStore.set(name, value, options)
              })
            } catch (error) {
              console.log('⚠️ setAll() failed (expected in Server Components):', error)
            }
          },
        },
      }
    )

    console.log('✅ Supabase client created successfully')
    return supabase
  } catch (error) {
    console.error('❌ Error creating Supabase client:', error)
    throw error
  }
}