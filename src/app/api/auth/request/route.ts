import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import {
  redis,
  requestRatelimit,
  validateEmail,
  createMagicLink,
  sendMagicLink,
  sendAccessRequestNotification,
} from '@/lib/auth';
import type { ViewerAccess } from '@/lib/auth';

export async function POST(request: Request) {
  // Get IP for rate limiting
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for') ?? 'anonymous';

  // SECURITY: Rate limiting - 5 requests per minute per IP
  const { success: rateLimitOk } = await requestRatelimit.limit(ip);
  if (!rateLimitOk) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  let body: { email?: unknown; projectId?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  // Extract projectId (optional, used to track which project viewer requested from)
  const projectId = typeof body.projectId === 'string' ? body.projectId : undefined;

  // SECURITY: Input validation
  const validation = validateEmail(body.email);
  if (!validation.success) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const email = validation.email;
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL?.toLowerCase();
  const isAdmin = email === superAdminEmail;

  try {
    if (isAdmin) {
      // Admin: Send magic link directly
      const magicLink = await createMagicLink(email, 'admin');
      await sendMagicLink(email, magicLink, 'admin');
    } else {
      // Viewer: Check if already approved
      const viewer = await redis.get<ViewerAccess>(`viewer:${email}`);

      if (viewer?.status === 'approved') {
        // Check if access has expired
        if (viewer.expiresAt && Date.now() > viewer.expiresAt) {
          // Access expired - update status
          await redis.set(`viewer:${email}`, {
            ...viewer,
            status: 'denied',
          });
          // Don't send magic link, but don't reveal this to prevent enumeration
        } else {
          // Already approved and not expired: Send magic link
          const magicLink = await createMagicLink(email, 'viewer');
          await sendMagicLink(email, magicLink, 'viewer');
        }
      } else if (viewer?.status === 'pending') {
        // Already pending: Do nothing (don't spam admin)
        // But still return success to prevent enumeration
      } else if (viewer?.status === 'denied') {
        // Previously denied: Do nothing
        // Could optionally allow re-request, but for now just ignore
      } else {
        // New request: Add to pending and notify admin
        const newViewer: ViewerAccess = {
          email,
          status: 'pending',
          projects: [],
          requestedProject: projectId,
          expiresAt: null,
          createdAt: Date.now(),
        };
        await redis.set(`viewer:${email}`, newViewer);
        await redis.sadd('pending_viewers', email);
        await sendAccessRequestNotification(email);
      }
    }
  } catch (error) {
    // Log error but don't expose details to user
    console.error('Auth request error:', error);
    // Still return success to prevent enumeration
  }

  // SECURITY: Always return same response to prevent email enumeration
  return NextResponse.json({
    success: true,
    message:
      'If this email is approved or pending approval, you will receive further instructions.',
  });
}
