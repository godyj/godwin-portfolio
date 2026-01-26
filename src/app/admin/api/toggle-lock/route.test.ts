import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';

// Mock auth module
vi.mock('@/lib/auth', () => ({
  getSession: vi.fn(),
}));

// Mock projects helper
vi.mock('@/lib/auth/projects', () => ({
  setProjectLockState: vi.fn(),
  isProjectLocked: vi.fn(),
}));

// Mock projects data
vi.mock('@/data/projects', () => ({
  projects: [
    { id: 'jarvis', title: 'Jarvis', locked: true },
    { id: 'xcode-touch-bar', title: 'Xcode Touch Bar', locked: true },
  ],
}));

import { getSession } from '@/lib/auth';
import { setProjectLockState } from '@/lib/auth/projects';

function createRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost:3000/admin/api/toggle-lock', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('POST /admin/api/toggle-lock', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('authentication', () => {
    it('returns 401 when not authenticated', async () => {
      vi.mocked(getSession).mockResolvedValue(null);

      const response = await POST(createRequest({ projectId: 'jarvis', locked: true }));
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

      const response = await POST(createRequest({ projectId: 'jarvis', locked: true }));
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });
  });

  describe('validation', () => {
    beforeEach(() => {
      vi.mocked(getSession).mockResolvedValue({
        email: 'admin@example.com',
        role: 'admin',
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
        sessionId: 'test-session-id',
      });
    });

    it('returns 400 when projectId is missing', async () => {
      const response = await POST(createRequest({ locked: true }));
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid projectId');
    });

    it('returns 400 when projectId is not a string', async () => {
      const response = await POST(createRequest({ projectId: 123, locked: true }));
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid projectId');
    });

    it('returns 400 when locked is missing', async () => {
      const response = await POST(createRequest({ projectId: 'jarvis' }));
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid locked value');
    });

    it('returns 400 when locked is not a boolean', async () => {
      const response = await POST(createRequest({ projectId: 'jarvis', locked: 'true' }));
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid locked value');
    });

    it('returns 404 when project does not exist', async () => {
      const response = await POST(createRequest({ projectId: 'nonexistent', locked: true }));
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Project not found');
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
      vi.mocked(setProjectLockState).mockResolvedValue(undefined);
    });

    it('locks a project successfully', async () => {
      const response = await POST(createRequest({ projectId: 'jarvis', locked: true }));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.projectId).toBe('jarvis');
      expect(data.locked).toBe(true);
      expect(setProjectLockState).toHaveBeenCalledWith('jarvis', true);
    });

    it('unlocks a project successfully', async () => {
      const response = await POST(createRequest({ projectId: 'xcode-touch-bar', locked: false }));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.projectId).toBe('xcode-touch-bar');
      expect(data.locked).toBe(false);
      expect(setProjectLockState).toHaveBeenCalledWith('xcode-touch-bar', false);
    });
  });
});