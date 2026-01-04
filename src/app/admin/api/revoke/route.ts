import { NextResponse } from 'next/server';
import {
  getSession,
  redis,
  validateEmail,
  invalidateAllSessions,
} from '@/lib/auth';
import type { ViewerAccess } from '@/lib/auth';

export async function POST(request: Request) {
  // Check admin session
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { email?: unknown; deny?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  // Validate email
  const validation = validateEmail(body.email);
  if (!validation.success) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const email = validation.email;
  const isDeny = body.deny === true;

  try {
    // Get existing viewer record
    const viewer = await redis.get<ViewerAccess>(`viewer:${email}`);
    if (!viewer) {
      return NextResponse.json({ error: 'Viewer not found' }, { status: 404 });
    }

    // Update to denied
    const updatedViewer: ViewerAccess = {
      ...viewer,
      status: 'denied',
    };
    await redis.set(`viewer:${email}`, updatedViewer);

    // Remove from pending set if was pending
    await redis.srem('pending_viewers', email);

    // SECURITY: Invalidate all active sessions for this email
    const invalidatedCount = await invalidateAllSessions(email);

    return NextResponse.json({
      success: true,
      action: isDeny ? 'denied' : 'revoked',
      sessionsInvalidated: invalidatedCount,
    });
  } catch (error) {
    console.error('Failed to revoke viewer:', error);
    return NextResponse.json(
      { error: 'Failed to revoke viewer' },
      { status: 500 }
    );
  }
}
