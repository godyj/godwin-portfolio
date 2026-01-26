import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { projects } from '@/data/projects';
import { setProjectLockState, isProjectLocked } from '@/lib/auth/projects';

export async function POST(request: NextRequest) {
  // 1. Admin auth check
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Parse and validate
  const body = await request.json();
  const { projectId, locked } = body;

  if (!projectId || typeof projectId !== 'string') {
    return NextResponse.json({ error: 'Invalid projectId' }, { status: 400 });
  }

  if (typeof locked !== 'boolean') {
    return NextResponse.json({ error: 'Invalid locked value' }, { status: 400 });
  }

  // 3. Verify project exists
  const project = projects.find(p => p.id === projectId);
  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  // 4. Set lock state in Redis
  await setProjectLockState(projectId, locked);

  return NextResponse.json({ success: true, projectId, locked });
}
