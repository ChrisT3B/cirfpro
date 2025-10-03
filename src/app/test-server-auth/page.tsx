// src/app/test-server-auth/page.tsx
import { createClient } from '@/lib/supabase/server'

export default async function TestServerAuth() {
  console.log('🧪 Test page rendering...')
  
  const supabase = await createClient()
  
  console.log('🧪 About to call getSession()...')
  const { data: { session }, error } = await supabase.auth.getSession()
  
  console.log('🧪 getSession() response:', {
    hasSession: !!session,
    hasError: !!error,
    errorMessage: error?.message,
    userId: session?.user?.id,
    userEmail: session?.user?.email
  })
  
  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600">❌ Error</h1>
        <p className="text-red-500">{error.message}</p>
        <details className="mt-4">
          <summary className="cursor-pointer text-sm">Full error details</summary>
          <pre className="mt-2 p-2 bg-gray-100 text-xs">{JSON.stringify(error, null, 2)}</pre>
        </details>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-yellow-600">⚠️ No Session</h1>
        <p>Server client is working, but no user is logged in.</p>
        <p className="mt-4 text-sm text-gray-600">
          This could mean:
        </p>
        <ul className="list-disc ml-6 mt-2 text-sm text-gray-600">
          <li>Session cookie exists but is invalid/expired</li>
          <li>Session verification with Supabase failed</li>
          <li>Cookie value is not being decoded correctly</li>
        </ul>
        <p className="mt-4">
          <a href="/auth/signin" className="text-blue-600 underline">
            Log in to test authentication
          </a>
        </p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-green-600">✅ Server Client Working!</h1>
      <div className="mt-4 space-y-2">
        <p><strong>Email:</strong> {session.user.email}</p>
        <p><strong>User ID:</strong> {session.user.id}</p>
        <p><strong>Session expires:</strong> {new Date(session.expires_at! * 1000).toLocaleString()}</p>
      </div>
      <div className="mt-6 p-4 bg-green-50 rounded">
        <p className="text-sm text-green-800">
          ✅ If you can see this with your email, the server client is working correctly!
        </p>
      </div>
      
      <details className="mt-6">
        <summary className="cursor-pointer text-sm text-gray-500">Debug: Session data</summary>
        <pre className="mt-2 p-2 bg-gray-100 text-xs overflow-auto">{JSON.stringify(session, null, 2)}</pre>
      </details>
    </div>
  )
}