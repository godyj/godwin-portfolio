import { NextResponse } from 'next/server';
import {
  getSession,
  redis,
  validateEmail,
  createMagicLink,
  sendAccessApprovedNotification,
} from '@/lib/auth';
import type { ViewerAccess } from '@/lib/auth';

export async function POST(request: Request) {
  // Check admin session
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { email?: unknown; expiresAt?: unknown };
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

  // Validate expiresAt if provided (must be a number or null)
  let expiresAt: number | null = null;
  if (body.expiresAt !== undefined && body.expiresAt !== null) {
    if (typeof body.expiresAt !== 'number') {
      return NextResponse.json({ error: 'expiresAt must be a number or null' }, { status: 400 });
    }
    expiresAt = body.expiresAt;
  }

  try {
    // Get existing viewer record
    const viewer = await redis.get<ViewerAccess>(`viewer:${email}`);
    if (!viewer) {
      return NextResponse.json({ error: 'Viewer not found' }, { status: 404 });
    }

    // Update to approved
    const updatedViewer: ViewerAccess = {
      ...viewer,
      status: 'approved',
      approvedAt: Date.now(),
      expiresAt,
    };
    await redis.set(`viewer:${email}`, updatedViewer);

    // Remove from pending set
    await redis.srem('pending_viewers', email);

    // Create magic link and send approval email
    const magicLink = await createMagicLink(email, 'viewer');
    await sendAccessApprovedNotification(email, magicLink);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to approve viewer:', error);
    return NextResponse.json(
      { error: 'Failed to approve viewer' },
      { status: 500 }
    );
  }
}
