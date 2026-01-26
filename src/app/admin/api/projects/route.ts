import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { projects } from '@/data/projects';
import { isProjectLocked } from '@/lib/auth/projects';

export async function GET() {
  // Admin auth check
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Return all projects with their computed lock status
  const projectsWithStatus = await Promise.all(
    projects.map(async (project) => ({
      id: project.id,
      title: project.title,
      subtitle: project.subtitle || '',
      locked: await isProjectLocked(project.id),
    }))
  );

  return NextResponse.json({ projects: projectsWithStatus });
}
