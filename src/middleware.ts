// src/middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from '@/types/database.types'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient<Database>({ req, res })

  const { data: { session } } = await supabase.auth.getSession()
  const url = req.nextUrl.clone()
  const pathname = url.pathname

  // Handle coach workspace routes
  if (pathname.startsWith('/coach/')) {
    const pathParts = pathname.split('/')
    const slug = pathParts[2]
    const route = pathParts[3] || 'profile'
    
    if (slug === 'directory') return res
    
    const publicRoutes = ['profile', 'methodology', 'reviews']
    if (publicRoutes.includes(route)) return res

    const privateRoutes = ['dashboard', 'athletes', 'plans', 'settings']
    if (privateRoutes.includes(route)) {
      if (!session) {
        url.pathname = '/auth/signin'
        url.searchParams.set('redirectTo', pathname)
        return NextResponse.redirect(url)
      }

      try {
        const { data: workspaceOwner } = await supabase
          .from('public_coach_directory')
          .select('email')
          .eq('workspace_slug', slug)
          .single()

        if (!workspaceOwner || session.user.email !== workspaceOwner.email) {
          const { data: userWorkspace } = await supabase
            .from('public_coach_directory')
            .select('workspace_slug')
            .eq('email', session.user.email)
            .single()

          if (userWorkspace?.workspace_slug) {
            url.pathname = `/coach/${userWorkspace.workspace_slug}/dashboard`
            return NextResponse.redirect(url)
          } else {
            url.pathname = '/dashboard'
            return NextResponse.redirect(url)
          }
        }
      } catch  {
        url.pathname = '/auth/signin'
        url.searchParams.set('redirectTo', pathname)
        return NextResponse.redirect(url)
      }
    }

    if (pathParts.length === 3 && slug !== 'directory') {
      url.pathname = `/coach/${slug}/profile`
      return NextResponse.redirect(url)
    }
  }

  // Handle general dashboard redirect for coaches
  if (pathname === '/dashboard' && session) {
    try {
      const { data: userWorkspace } = await supabase
        .from('public_coach_directory')
        .select('workspace_slug')
        .eq('email', session.user.email)
        .single()

      if (userWorkspace?.workspace_slug) {
        url.pathname = `/coach/${userWorkspace.workspace_slug}/dashboard`
        return NextResponse.redirect(url)
      }
    } catch (error) {
      // Continue to general dashboard
    }
  }

  // Protect general dashboard
  if (pathname.startsWith('/dashboard') && !session) {
    url.pathname = '/auth/signin'
    url.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(url)
  }

  return res
}

export const config = {
  matcher: ['/coach/:path*', '/dashboard/:path*', '/dashboard']
}