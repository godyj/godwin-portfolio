import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Use verified domain for all environments
const FROM_EMAIL = 'Godwin Portfolio <noreply@designed.cloud>';

/**
 * Send a magic link email to a user
 */
export async function sendMagicLink(
  email: string,
  magicLink: string,
  type: 'viewer' | 'admin'
): Promise<void> {
  const subject =
    type === 'admin'
      ? 'Admin Login - Godwin Portfolio'
      : 'Access Your Portfolio Projects';

  const greeting = type === 'admin' ? 'Hi Godwin,' : 'Hi there,';

  console.log(`[Email] Sending magic link to ${email} from ${FROM_EMAIL}`);

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <p>${greeting}</p>
          <p>Click the button below to access the portfolio:</p>
          <p style="margin: 30px 0;">
            <a href="${magicLink}" style="display: inline-block; background-color: #f5c518; color: #1a1a1a; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 500;">
              Access Portfolio
            </a>
          </p>
          <p style="color: #666; font-size: 14px;">This link expires in 15 minutes and can only be used once.</p>
          <p style="color: #666; font-size: 14px;">If you didn't request this link, you can safely ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px;">Godwin Johnson - Product Designer</p>
        </body>
      </html>
    `,
  });

  if (error) {
    console.error('[Email] Failed to send magic link:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }

  console.log('[Email] Magic link sent successfully:', data?.id);
}

/**
 * Send notification to admin when a viewer requests access
 */
export async function sendAccessRequestNotification(
  viewerEmail: string
): Promise<void> {
  const adminEmail = process.env.SUPER_ADMIN_EMAIL!;
  const adminLink = `${process.env.NEXT_PUBLIC_SITE_URL}/admin`;

  await resend.emails.send({
    from: FROM_EMAIL,
    to: adminEmail,
    subject: `Access Request: ${viewerEmail}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <p>Hi Godwin,</p>
          <p>Someone has requested access to view your portfolio:</p>
          <p style="background: #f5f5f5; padding: 15px; border-radius: 6px; font-family: monospace;">
            ${viewerEmail}
          </p>
          <p style="margin: 30px 0;">
            <a href="${adminLink}" style="display: inline-block; background-color: #f5c518; color: #1a1a1a; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 500;">
              Review in Admin Dashboard
            </a>
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px;">Godwin Johnson Portfolio - Admin Notification</p>
        </body>
      </html>
    `,
  });
}

/**
 * Send notification to viewer when their access is approved
 */
export async function sendAccessApprovedNotification(
  viewerEmail: string,
  magicLink: string
): Promise<void> {
  await resend.emails.send({
    from: FROM_EMAIL,
    to: viewerEmail,
    subject: 'Access Approved - Godwin Portfolio',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <p>Hi there,</p>
          <p>Great news! Your request to access Godwin's portfolio has been approved.</p>
          <p>Click the button below to view the case studies:</p>
          <p style="margin: 30px 0;">
            <a href="${magicLink}" style="display: inline-block; background-color: #f5c518; color: #1a1a1a; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 500;">
              View Portfolio
            </a>
          </p>
          <p style="color: #666; font-size: 14px;">This link expires in 15 minutes. After logging in, your access will remain valid for 7 days.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px;">Godwin Johnson - Product Designer</p>
        </body>
      </html>
    `,
  });
}
