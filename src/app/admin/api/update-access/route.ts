import { NextRequest, NextResponse } from 'next/server';
import { getSession, redis } from '@/lib/auth';
import type { ViewerAccess } from '@/lib/auth';
import { projects as allProjects } from '@/data/projects';

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { email, projects } = await request.json();

  if (!email || !Array.isArray(projects)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  // Get valid locked project IDs
  const validLockedProjectIds = allProjects
    .filter((project) => project.locked === true)
    .map((project) => project.id);

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

  // Update the projects array
  const updated: ViewerAccess = {
    ...viewer,
    projects,
  };

  await redis.set(`viewer:${email}`, updated);

  return NextResponse.json({ success: true, viewer: updated });
}
