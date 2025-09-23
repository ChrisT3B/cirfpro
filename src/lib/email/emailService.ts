// src/lib/email/emailService.ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export interface InvitationEmailData {
  coachName: string
  coachEmail: string
  coachCredentials?: string[]
  invitationToken: string
  athleteEmail: string
  message?: string
  expiresAt: string
}

export class EmailService {
  static async sendCoachInvitation(data: InvitationEmailData) {
    const invitationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${data.invitationToken}`
    
    try {
      const { data: result, error } = await resend.emails.send({
        from: 'CIRFPRO <send@cirfpro.com>',
        to: [data.athleteEmail],
        subject: `Coach Invitation from ${data.coachName} - CIRFPRO`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #29b643; padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">CIRFPRO</h1>
              <p style="color: white; margin: 5px 0 0 0;">Professional Running Coaching Platform</p>
            </div>
            
            <div style="padding: 30px 20px;">
              <h2 style="color: #333;">You've been invited to join a coaching program!</h2>
              
              <p><strong>${data.coachName}</strong> has invited you to join their professional running coaching program on CIRFPRO.</p>
              
              ${data.message ? `
                <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #29b643; margin: 20px 0;">
                  <p style="margin: 0; font-style: italic;">"${data.message}"</p>
                </div>
              ` : ''}
              
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">About Your Coach:</h3>
                <p><strong>Name:</strong> ${data.coachName}</p>
                <p><strong>Email:</strong> ${data.coachEmail}</p>
                ${data.coachCredentials && data.coachCredentials.length > 0 ? `
                  <p><strong>Qualifications:</strong> ${data.coachCredentials.join(', ')}</p>
                ` : ''}
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${invitationUrl}" 
                   style="background-color: #29b643; color: white; padding: 15px 30px; 
                          text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                  Accept Invitation
                </a>
              </div>
              
              <p style="font-size: 14px; color: #666;">
                This invitation expires on ${new Date(data.expiresAt).toLocaleDateString()}.
              </p>
              
              <p style="font-size: 14px; color: #666;">
                If you didn't expect this invitation, you can safely ignore this email.
              </p>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666;">
              <p>© 2025 CIRFPRO. Professional Running Coaching Platform.</p>
              <p>If you have questions, reply to this email or contact ${data.coachEmail}</p>
            </div>
          </div>
        `,
        replyTo: data.coachEmail
      })

      if (error) {
        console.error('Failed to send invitation email:', error)
        return { success: false, error: error.message }
      }

      console.log('Invitation email sent successfully:', result?.id)
      return { success: true, messageId: result?.id }
      
    } catch (error) {
      console.error('Error sending invitation email:', error)
      return { success: false, error: 'Failed to send email' }
    }
  }
}