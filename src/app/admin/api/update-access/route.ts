import { NextRequest, NextResponse } from 'next/server';
import { getSession, redis, getLockedProjectIds } from '@/lib/auth';
import type { ViewerAccess } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { email, projects } = body;

  if (!email || !Array.isArray(projects)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  // Check if expiresAt was explicitly provided in the request body
  const hasExpiresAt = 'expiresAt' in body;
  const expiresAt: number | null | undefined = hasExpiresAt ? body.expiresAt : undefined;

  // Get valid locked project IDs from Redis/static fallback
  const validLockedProjectIds = await getLockedProjectIds();

  // Validate that all requested project IDs exist in locked projects
  const invalidIds = projects.filter(
    (id: string) => !validLockedProjectIds.includes(id)
  );

  if (invalidIds.length > 0) {
    return NextResponse.json(
      { error: 'Invalid project IDs', invalid: invalidIds },
      { status: 400 }
    );
  }

  const viewer = await redis.get<ViewerAccess>(`viewer:${email}`);
  if (!viewer) {
    return NextResponse.json({ error: 'Viewer not found' }, { status: 404 });
  }

  // Verify the viewer is approved before updating access
  if (viewer.status !== 'approved') {
    return NextResponse.json(
      { error: 'Viewer must be approved to update access' },
      { status: 400 }
    );
  }

  // Update the projects array and optionally expiresAt
  const updated: ViewerAccess = {
    ...viewer,
    projects,
    // Only update expiresAt if it was explicitly provided in the request
    ...(hasExpiresAt && { expiresAt }),
  };

  await redis.set(`viewer:${email}`, updated);

  return NextResponse.json({ success: true, viewer: updated });
}
