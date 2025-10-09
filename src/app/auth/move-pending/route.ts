import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  console.log('🔧 Manual migration triggered for user:', user.id)

  // Get pending user
  const { data: pendingUser, error: pendingError } = await supabase
    .from('pending_users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (pendingError || !pendingUser) {
    console.log('❌ No pending user found')
    return NextResponse.json({ error: 'No pending user found' }, { status: 404 })
  }

  console.log('✅ Found pending user:', pendingUser.email)

  // Move to users
  const { error: userError } = await supabase.from('users').insert({
    id: pendingUser.id,
    email: pendingUser.email,
    role: pendingUser.role,
    first_name: pendingUser.first_name,
    last_name: pendingUser.last_name
  })

  if (userError) {
    console.log('❌ Failed to create user:', userError)
    return NextResponse.json({ error: userError.message }, { status: 500 })
  }

  console.log('✅ User created')

  // Create profile
  if (pendingUser.role === 'athlete') {
    await supabase.from('athlete_profiles').insert({
      user_id: pendingUser.id,
      experience_level: pendingUser.experience_level
    })
    console.log('✅ Athlete profile created')
  }

  // Delete pending
  await supabase.from('pending_users').delete().eq('id', pendingUser.id)
  console.log('✅ Pending user deleted')

  return NextResponse.json({ success: true })
}