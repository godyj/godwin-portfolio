import { NextResponse } from 'next/server';
import { getSession, redis } from '@/lib/auth';
import type { ViewerAccess } from '@/lib/auth';

export async function GET() {
  // Check admin session
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get all pending viewer emails
    const pendingEmails = await redis.smembers('pending_viewers');

    // Get all viewer records (we need to scan for viewer:* keys)
    // For simplicity, we'll get pending + any others we find
    const viewers: ViewerAccess[] = [];

    // First, get all pending viewers
    for (const email of pendingEmails) {
      const viewer = await redis.get<ViewerAccess>(`viewer:${email}`);
      if (viewer) {
        viewers.push(viewer);
      }
    }

    // Use SCAN to find other viewer records (approved/denied)
    // Note: This is a simplified approach - in production you might want
    // to maintain separate sets for each status
    let cursor = 0;
    do {
      const [nextCursor, keys] = await redis.scan(cursor, {
        match: 'viewer:*',
        count: 100,
      });
      cursor = Number(nextCursor);

      for (const key of keys) {
        const email = key.replace('viewer:', '');
        // Skip if already added from pending list
        if (!viewers.find((v) => v.email === email)) {
          const viewer = await redis.get<ViewerAccess>(key);
          if (viewer) {
            viewers.push(viewer);
          }
        }
      }
    } while (cursor !== 0);

    // Sort by status (pending first), then by createdAt (newest first)
    viewers.sort((a, b) => {
      const statusOrder = { pending: 0, approved: 1, denied: 2 };
      const statusDiff = statusOrder[a.status] - statusOrder[b.status];
      if (statusDiff !== 0) return statusDiff;
      return b.createdAt - a.createdAt;
    });

    return NextResponse.json({ viewers });
  } catch (error) {
    console.error('Failed to fetch viewers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch viewers' },
      { status: 500 }
    );
  }
}
