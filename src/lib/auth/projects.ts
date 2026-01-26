import { redis } from './redis';
import { projects } from '@/data/projects';

/**
 * Check if a project is locked (Redis override → static fallback)
 */
export async function isProjectLocked(projectId: string): Promise<boolean> {
  const override = await redis.get<boolean>(`project-lock:${projectId}`);
  if (override !== null) return override;
  const project = projects.find(p => p.id === projectId);
  return project?.locked === true;
}

/**
 * Get all currently locked project IDs
 */
export async function getLockedProjectIds(): Promise<string[]> {
  const results = await Promise.all(
    projects.map(async (p) => ({ id: p.id, locked: await isProjectLocked(p.id) }))
  );
  return results.filter(r => r.locked).map(r => r.id);
}

/**
 * Set project lock state in Redis (admin only)
 */
export async function setProjectLockState(projectId: string, locked: boolean): Promise<void> {
  await redis.set(`project-lock:${projectId}`, locked);
}

/**
 * Check if a viewer has access to a specific project
 * Consolidates expiration + project-specific checks
 */
export function hasAccessToProject(
  viewer: { status: string; expiresAt?: number | null; projects: string[] } | null,
  projectId: string
): boolean {
  if (!viewer) return false;
  if (viewer.status !== 'approved') return false;
  if (viewer.expiresAt && viewer.expiresAt < Date.now()) return false;
  if (viewer.projects.length === 0) return true; // All projects
  return viewer.projects.includes(projectId);
}
