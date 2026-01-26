import { NextResponse } from 'next/server';
import { getSession, getLockedProjectIds } from '@/lib/auth';
import { projects } from '@/data/projects';

export async function GET() {
  // Check admin session
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get dynamically locked project IDs from Redis/static fallback
  const lockedIds = await getLockedProjectIds();
  const lockedProjects = projects
    .filter(p => lockedIds.includes(p.id))
    .map(p => ({ id: p.id, title: p.title, subtitle: p.subtitle || '' }));

  return NextResponse.json({ projects: lockedProjects });
}
