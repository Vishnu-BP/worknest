/**
 * @file email.service.ts — Email delivery via Resend
 * @module server/modules/invitation
 *
 * Sends workspace invitation emails using the Resend API.
 * Failures are logged but never block the invitation creation —
 * the invitation token is still valid even if email delivery fails.
 *
 * @dependencies resend, server/src/core/config
 * @related server/src/modules/invitation/invitation.service.ts — calls this after creating invitation
 */

import { Resend } from 'resend'

import { env } from '../../core/config'
import { createLogger } from '../../core/utils'

// ─── Logger ────────────────────────────────────────────────────

const log = createLogger('MAIL')

// ─── Resend Client ─────────────────────────────────────────────

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null

// ─── Service ───────────────────────────────────────────────────

/**
 * Sends a workspace invitation email. Gracefully handles failures —
 * if Resend is not configured or delivery fails, the invitation
 * still exists in the database and can be shared via direct link.
 */
export async function sendInvitationEmail(
  recipientEmail: string,
  inviterName: string,
  workspaceName: string,
  acceptUrl: string,
): Promise<void> {
  if (!resend) {
    log.warn('Resend not configured — skipping email delivery', { recipientEmail })
    return
  }

  try {
    await resend.emails.send({
      from: 'WorkNest <onboarding@resend.dev>',
      to: recipientEmail,
      subject: `${inviterName} invited you to ${workspaceName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #fafafa; background: #09090b; padding: 24px; border-radius: 12px 12px 0 0; margin: 0;">
            WorkNest
          </h2>
          <div style="padding: 24px; background: #18181b; color: #a1a1aa; border-radius: 0 0 12px 12px;">
            <p style="margin: 0 0 16px;">
              <strong style="color: #fafafa;">${inviterName}</strong> invited you to join
              <strong style="color: #fafafa;">${workspaceName}</strong> on WorkNest.
            </p>
            <a href="${acceptUrl}"
               style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px;
                      border-radius: 8px; text-decoration: none; font-weight: 600;">
              Accept Invitation
            </a>
            <p style="margin: 16px 0 0; font-size: 12px; color: #71717a;">
              This invitation expires in 48 hours.
            </p>
          </div>
        </div>
      `,
    })

    log.info('Invitation email sent', { to: recipientEmail })
  } catch (error) {
    // Email failure should never block the invitation flow
    log.error('Failed to send invitation email', { to: recipientEmail, error })
  }
}
