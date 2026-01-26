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

  let body: { email?: unknown; restore?: boolean };
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
  const isRestore = body.restore === true;

  try {
    // Get existing viewer record
    const viewer = await redis.get<ViewerAccess>(`viewer:${email}`);
    if (!viewer) {
      return NextResponse.json({ error: 'Viewer not found' }, { status: 404 });
    }

    if (isRestore) {
      // Unarchive: set status to 'denied' (safe default, admin can re-approve)
      if (viewer.status !== 'archived') {
        return NextResponse.json(
          { error: 'Viewer is not archived' },
          { status: 400 }
        );
      }

      const updatedViewer: ViewerAccess = {
        ...viewer,
        status: 'denied',
        archivedAt: undefined,
      };
      await redis.set(`viewer:${email}`, updatedViewer);

      return NextResponse.json({
        success: true,
        action: 'restored',
        newStatus: 'denied',
      });
    } else {
      // Archive: set status to 'archived' and add timestamp
      if (viewer.status === 'archived') {
        return NextResponse.json(
          { error: 'Viewer is already archived' },
          { status: 400 }
        );
      }

      const updatedViewer: ViewerAccess = {
        ...viewer,
        status: 'archived',
        archivedAt: Date.now(),
      };
      await redis.set(`viewer:${email}`, updatedViewer);

      // Remove from pending set if was pending
      await redis.srem('pending_viewers', email);

      // SECURITY: Invalidate all active sessions for this email
      const invalidatedCount = await invalidateAllSessions(email);

      return NextResponse.json({
        success: true,
        action: 'archived',
        sessionsInvalidated: invalidatedCount,
      });
    }
  } catch (error) {
    console.error('Failed to archive/restore viewer:', error);
    return NextResponse.json(
      { error: 'Failed to archive/restore viewer' },
      { status: 500 }
    );
  }
}
