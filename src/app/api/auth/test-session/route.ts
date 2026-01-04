import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import {
  testSessionRatelimit,
  validateEmail,
  createSession,
  redis,
} from '@/lib/auth';
import type { ViewerAccess } from '@/lib/auth';

/**
 * Test-only endpoint for creating sessions without magic links
 * SECURITY: Only available when AUTH_TEST_MODE=true
 */
export async function POST(request: Request) {
  // SECURITY: Only allow in test mode
  if (process.env.AUTH_TEST_MODE !== 'true') {
    return NextResponse.json(
      { error: 'Test mode not enabled' },
      { status: 403 }
    );
  }

  // SECURITY: Rate limiting even in test mode
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for') ?? 'anonymous';
  const { success: rateLimitOk } = await testSessionRatelimit.limit(ip);
  if (!rateLimitOk) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  let body: { secret?: string; email?: unknown; role?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { secret, email, role } = body;

  // SECURITY: Verify test secret
  if (secret !== process.env.AUTH_TEST_SECRET) {
    return NextResponse.json({ error: 'Invalid test secret' }, { status: 401 });
  }

  // SECURITY: Validate email
  const validation = validateEmail(email);
  if (!validation.success) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  // Validate role
  if (role !== 'viewer' && role !== 'admin') {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
  }

  // For viewer role, ensure they have an approved record
  if (role === 'viewer') {
    const viewer = await redis.get<ViewerAccess>(`viewer:${validation.email}`);
    if (!viewer || viewer.status !== 'approved') {
      // Auto-create approved viewer for testing
      await redis.set(`viewer:${validation.email}`, {
        email: validation.email,
        status: 'approved',
        projects: [],
        expiresAt: null,
        createdAt: Date.now(),
        approvedAt: Date.now(),
      } satisfies ViewerAccess);
    }
  }

  // Create session directly (no magic link, no email)
  const sessionId = await createSession(validation.email, role);

  return NextResponse.json({ success: true, sessionId });
}
