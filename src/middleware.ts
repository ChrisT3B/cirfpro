// src/middleware.ts - Updated with public API route support
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/database.types'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  console.log('🔀 Middleware executing for:', pathname)
  
  // ✅ SKIP middleware for public API routes (no authentication required)
  const publicApiRoutes = [
    '/api/invitations/validate',
    '/api/auth/callback',
  ]
  
  if (publicApiRoutes.some(route => pathname.startsWith(route))) {
    console.log('🔀 Public API route, skipping authentication')
    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Use getUser() instead of getSession() for security
  const { data: { user } } = await supabase.auth.getUser()
  console.log('🔀 User found:', !!user)

  const url = request.nextUrl.clone()

  // Handle coach workspace routes
  if (pathname.startsWith('/coach/')) {
    const pathParts = pathname.split('/')
    const slug = pathParts[2]
    const route = pathParts[3] || 'profile'
    
    console.log('🔀 Coach route detected:', { slug, route })
    
    if (slug === 'directory') return supabaseResponse
    
    const publicRoutes = ['profile', 'methodology', 'reviews']
    if (publicRoutes.includes(route)) {
      console.log('🔀 Public route, allowing access')
      return supabaseResponse
    }

    const privateRoutes = ['dashboard', 'athletes', 'plans', 'settings', 'invitations']
    if (privateRoutes.includes(route)) {
      if (!user) {
        console.log('🔀 No user, redirecting to signin')
        url.pathname = '/auth/signin'
        url.searchParams.set('redirectTo', pathname)
        return NextResponse.redirect(url)
      }

      try {
        const { data: workspaceOwner } = await supabase
          .from('coach_profiles')
          .select('user_id, users!inner(email)')
          .eq('workspace_slug', slug)
          .single()

        const owner = workspaceOwner as any
        
        if (!owner || user.email !== owner.users?.email) {
          // User doesn't own this workspace, redirect to their own
          const { data: userWorkspace } = await supabase
            .from('coach_profiles')
            .select('workspace_slug, users!inner(email)')
            .eq('user_id', user.id)
            .single()

          const workspace = userWorkspace as any

          if (workspace?.workspace_slug) {
            url.pathname = `/coach/${workspace.workspace_slug}/dashboard`
            return NextResponse.redirect(url)
          } else {
            url.pathname = '/dashboard'
            return NextResponse.redirect(url)
          }
        }
      } catch (error) {
        console.error('Middleware workspace check error:', error)
      }
    }
  }

  console.log('🔀 Middleware complete, allowing request')
  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}