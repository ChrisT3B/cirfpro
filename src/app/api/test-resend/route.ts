// src/app/api/test-resend/route.ts
import { Resend } from 'resend'
import { NextRequest, NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  const { email } = await request.json()
  
  try {
    const { data, error } = await resend.emails.send({
      from: 'Test <onboarding@resend.dev>',
      to: email,
      subject: 'CIRFPRO Test Email',
      html: '<h1>Test email from CIRFPRO!</h1><p>If you see this, Resend is working.</p>'
    })

    if (error) {
      return NextResponse.json({ error, success: false })
    }

    return NextResponse.json({ data, success: true })
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: errorMessage, success: false })
  }
}