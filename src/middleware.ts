// src/middleware.ts - Detailed debug to find exact issue
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

  console.log('=== MIDDLEWARE DEBUG ===')
  console.log('Path:', pathname)
  console.log('Session exists:', !!session)
  console.log('User email:', session?.user?.email)

  // Handle coach workspace routes
  if (pathname.startsWith('/coach/')) {
    const pathParts = pathname.split('/')
    const slug = pathParts[2]
    const route = pathParts[3] || 'profile'
    
    console.log('Coach route - Slug:', slug, 'Route:', route)
    
    if (slug === 'directory') return res
    
    const publicRoutes = ['profile', 'methodology', 'reviews']
    if (publicRoutes.includes(route)) return res

    const privateRoutes = ['dashboard', 'athletes', 'plans', 'settings']
    if (privateRoutes.includes(route)) {
      if (!session) {
        console.log('No session - redirecting to signin')
        url.pathname = '/auth/signin'
        url.searchParams.set('redirectTo', pathname)
        return NextResponse.redirect(url)
      }

      if (!session.user.email) {
        console.log('No user email - redirecting to signin')
        url.pathname = '/auth/signin'
        url.searchParams.set('redirectTo', pathname)
        return NextResponse.redirect(url)
      }

      console.log('Checking workspace ownership...')
      console.log('Looking for workspace_slug:', slug)
      console.log('User email:', session.user.email)

      try {
        // First query - check workspace ownership
        console.log('Query 1: Checking workspace owner for slug:', slug)
        const workspaceQuery = await supabase
          .from('public_coach_directory')
          .select('email')
          .eq('workspace_slug', slug)
        
        console.log('Workspace query result:', workspaceQuery)
        
        if (workspaceQuery.error) {
          console.log('Workspace query error:', workspaceQuery.error)
          throw workspaceQuery.error
        }

        const workspaceOwner = workspaceQuery.data?.[0]
        console.log('Workspace owner found:', workspaceOwner)

        if (!workspaceOwner || session.user.email !== workspaceOwner.email) {
          console.log('User does not own workspace. Checking user workspace...')
          
          // Second query - find user's workspace
          console.log('Query 2: Finding user workspace for email:', session.user.email)
          const userQuery = await supabase
            .from('public_coach_directory')
            .select('workspace_slug')
            .eq('email', session.user.email)
          
          console.log('User workspace query result:', userQuery)
          
          if (userQuery.error) {
            console.log('User workspace query error:', userQuery.error)
            throw userQuery.error
          }

          const userWorkspace = userQuery.data?.[0]
          console.log('User workspace found:', userWorkspace)

          if (userWorkspace?.workspace_slug) {
            console.log('Redirecting to user workspace:', `/coach/${userWorkspace.workspace_slug}/dashboard`)
            url.pathname = `/coach/${userWorkspace.workspace_slug}/dashboard`
            return NextResponse.redirect(url)
          } else {
            console.log('No user workspace found - allowing request to continue')
            return res
          }
        } else {
          console.log('User owns workspace - allowing access')
        }
      } catch (error) {
        console.log('Database error occurred:', error)
        console.log('Redirecting to signin due to error')
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

  console.log('Allowing request to continue')
  return res
}

export const config = {
  matcher: ['/coach/:path*', '/dashboard/:path*', '/dashboard']
}