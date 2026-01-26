import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';

// Mock auth module
vi.mock('@/lib/auth', () => ({
  getSession: vi.fn(),
}));

// Mock projects helper
vi.mock('@/lib/auth/projects', () => ({
  isProjectLocked: vi.fn(),
}));

// Mock projects data
vi.mock('@/data/projects', () => ({
  projects: [
    { id: 'jarvis', title: 'Jarvis', subtitle: 'Connected Car App' },
    { id: 'xcode-touch-bar', title: 'Apple Xcode (Touch Bar)', subtitle: '' },
    { id: 'roblox-nux', title: 'Roblox (NUX)', subtitle: '' },
  ],
}));

import { getSession } from '@/lib/auth';
import { isProjectLocked } from '@/lib/auth/projects';

describe('GET /admin/api/projects', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('authentication', () => {
    it('returns 401 when not authenticated', async () => {
      vi.mocked(getSession).mockResolvedValue(null);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('returns 401 when authenticated but not admin', async () => {
      vi.mocked(getSession).mockResolvedValue({
        email: 'viewer@example.com',
        role: 'viewer',
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
        sessionId: 'test-session-id',
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });
  });

  describe('success cases', () => {
    beforeEach(() => {
      vi.mocked(getSession).mockResolvedValue({
        email: 'admin@example.com',
        role: 'admin',
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
        sessionId: 'test-session-id',
      });
    });

    it('returns all projects with lock status when admin', async () => {
      vi.mocked(isProjectLocked)
        .mockResolvedValueOnce(true)  // jarvis - locked
        .mockResolvedValueOnce(true)  // xcode-touch-bar - locked
        .mockResolvedValueOnce(false); // roblox-nux - unlocked

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.projects).toHaveLength(3);
      expect(data.projects).toEqual([
        { id: 'jarvis', title: 'Jarvis', subtitle: 'Connected Car App', locked: true },
        { id: 'xcode-touch-bar', title: 'Apple Xcode (Touch Bar)', subtitle: '', locked: true },
        { id: 'roblox-nux', title: 'Roblox (NUX)', subtitle: '', locked: false },
      ]);
      expect(isProjectLocked).toHaveBeenCalledTimes(3);
      expect(isProjectLocked).toHaveBeenCalledWith('jarvis');
      expect(isProjectLocked).toHaveBeenCalledWith('xcode-touch-bar');
      expect(isProjectLocked).toHaveBeenCalledWith('roblox-nux');
    });

    it('returns all projects as unlocked when none are locked', async () => {
      vi.mocked(isProjectLocked).mockResolvedValue(false);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.projects).toHaveLength(3);
      expect(data.projects.every((p: { locked: boolean }) => p.locked === false)).toBe(true);
    });

    it('returns all projects as locked when all are locked', async () => {
      vi.mocked(isProjectLocked).mockResolvedValue(true);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.projects).toHaveLength(3);
      expect(data.projects.every((p: { locked: boolean }) => p.locked === true)).toBe(true);
    });
  });
});
