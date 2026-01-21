import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { projects } from '@/data/projects';

export async function GET() {
  // Check admin session
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Filter locked projects and return only id, title, subtitle
  const lockedProjects = projects
    .filter((project) => project.locked === true)
    .map((project) => ({
      id: project.id,
      title: project.title,
      subtitle: project.subtitle || '',
    }));

  return NextResponse.json({ projects: lockedProjects });
}
