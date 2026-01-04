import { NextRequest, NextResponse } from 'next/server';
import { getSession, redis } from '@/lib/auth';
import type { ViewerAccess } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { email, projects } = await request.json();

  if (!email || !Array.isArray(projects)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const viewer = await redis.get<ViewerAccess>(`viewer:${email}`);
  if (!viewer) {
    return NextResponse.json({ error: 'Viewer not found' }, { status: 404 });
  }

  // Update the projects array
  const updated: ViewerAccess = {
    ...viewer,
    projects,
  };

  await redis.set(`viewer:${email}`, updated);

  return NextResponse.json({ success: true, viewer: updated });
}
