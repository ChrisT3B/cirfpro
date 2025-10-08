// src/lib/email/emailService.ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// ============================================
// Type Definitions
// ============================================

export interface InvitationEmailData {
  coachName: string
  coachEmail: string
  coachCredentials?: string[]
  invitationToken: string
  athleteEmail: string
  message?: string
  expiresAt: string
}

export interface AthleteAcceptanceNotificationData {
  coachName: string
  coachEmail: string
  athleteName: string
  athleteEmail: string
  acceptedAt: string
  athleteProfileUrl: string
  athleteExperienceLevel?: string
  athleteGoalRace?: string
}

// ============================================
// Email Service Class
// ============================================

export class EmailService {
  /**
   * Send coach invitation to athlete
   * Used when coach invites an athlete to join their coaching program
   */
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

  /**
   * Send notification to coach when athlete accepts invitation
   * Used in US037 - Athlete Acceptance Flow (Step 6)
   */
  static async sendAthleteAcceptanceNotification(data: AthleteAcceptanceNotificationData) {
    try {
      const { data: result, error } = await resend.emails.send({
        from: 'CIRFPRO <notifications@cirfpro.com>',
        to: [data.coachEmail],
        subject: `${data.athleteName} Accepted Your Coaching Invitation! 🎉`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <!-- Header -->
            <div style="background-color: #29b643; padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">CIRFPRO</h1>
              <p style="color: white; margin: 5px 0 0 0;">Professional Running Coaching Platform</p>
            </div>
            
            <!-- Main Content -->
            <div style="padding: 30px 20px;">
              <h2 style="color: #333;">Great News, ${data.coachName}!</h2>
              
              <p style="font-size: 16px; line-height: 1.6;">
                <strong>${data.athleteName}</strong> has accepted your coaching invitation and is now part of your coaching program.
              </p>
              
              <!-- Acceptance Details Box -->
              <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #29b643; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #166534;">New Athlete Details:</h3>
                <p style="margin: 8px 0;"><strong>Name:</strong> ${data.athleteName}</p>
                <p style="margin: 8px 0;"><strong>Email:</strong> ${data.athleteEmail}</p>
                ${data.athleteExperienceLevel ? `
                  <p style="margin: 8px 0;"><strong>Experience Level:</strong> ${data.athleteExperienceLevel}</p>
                ` : ''}
                ${data.athleteGoalRace ? `
                  <p style="margin: 8px 0;"><strong>Goal Race:</strong> ${data.athleteGoalRace}</p>
                ` : ''}
                <p style="margin: 8px 0;"><strong>Accepted:</strong> ${new Date(data.acceptedAt).toLocaleString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</p>
              </div>
              
              <!-- Next Steps Box -->
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #333;">Recommended Next Steps:</h3>
                <ol style="margin: 0; padding-left: 20px; line-height: 1.8;">
                  <li>Review ${data.athleteName}'s profile and training goals</li>
                  <li>Send a welcome message to establish communication</li>
                  <li>Schedule an initial consultation call</li>
                  <li>Create their first training plan</li>
                </ol>
              </div>
              
              <!-- Call to Action Button -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${data.athleteProfileUrl}" 
                   style="background-color: #29b643; color: white; padding: 15px 30px; 
                          text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                  View Athlete Profile
                </a>
              </div>
              
              <p style="font-size: 14px; color: #666; text-align: center;">
                You can access ${data.athleteName}'s profile, training history, and goals from your coach dashboard.
              </p>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666;">
              <p>© 2025 CIRFPRO. Professional Running Coaching Platform.</p>
              <p style="margin-top: 10px;">
                Need help getting started? Visit our 
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/coach/resources" style="color: #29b643; text-decoration: none;">
                  Coach Resources
                </a> 
                or reply to this email.
              </p>
            </div>
          </div>
        `,
        replyTo: data.athleteEmail
      })

      if (error) {
        console.error('Failed to send athlete acceptance notification:', error)
        return { success: false, error: error.message }
      }

      console.log('Athlete acceptance notification sent successfully:', result?.id)
      return { success: true, messageId: result?.id }
      
    } catch (error) {
      console.error('Error sending athlete acceptance notification:', error)
      return { success: false, error: 'Failed to send notification email' }
    }
  }
}