import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { hasAccessToProject } from './projects';

describe('hasAccessToProject', () => {
  beforeEach(() => {
    // Mock Date.now() to return a fixed timestamp for predictable testing
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-01T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('viewer validation', () => {
    it('returns false when viewer is null', () => {
      const result = hasAccessToProject(null, 'jarvis');
      expect(result).toBe(false);
    });

    it('returns false when viewer.status is "pending"', () => {
      const viewer = {
        status: 'pending',
        expiresAt: Date.now() + 86400000, // 1 day in the future
        projects: [],
      };
      const result = hasAccessToProject(viewer, 'jarvis');
      expect(result).toBe(false);
    });

    it('returns false when viewer.status is "denied"', () => {
      const viewer = {
        status: 'denied',
        expiresAt: Date.now() + 86400000,
        projects: [],
      };
      const result = hasAccessToProject(viewer, 'jarvis');
      expect(result).toBe(false);
    });
  });

  describe('expiration validation', () => {
    it('returns false when viewer.expiresAt is in the past', () => {
      const viewer = {
        status: 'approved',
        expiresAt: Date.now() - 86400000, // 1 day in the past
        projects: [],
      };
      const result = hasAccessToProject(viewer, 'jarvis');
      expect(result).toBe(false);
    });

    it('returns true when viewer.expiresAt is in the future', () => {
      const viewer = {
        status: 'approved',
        expiresAt: Date.now() + 86400000, // 1 day in the future
        projects: [],
      };
      const result = hasAccessToProject(viewer, 'jarvis');
      expect(result).toBe(true);
    });

    it('returns true when viewer.expiresAt is undefined', () => {
      const viewer = {
        status: 'approved',
        expiresAt: undefined,
        projects: [],
      };
      const result = hasAccessToProject(viewer, 'jarvis');
      expect(result).toBe(true);
    });

    it('returns true when viewer.expiresAt is null', () => {
      const viewer = {
        status: 'approved',
        expiresAt: null,
        projects: [],
      };
      const result = hasAccessToProject(viewer, 'jarvis');
      expect(result).toBe(true);
    });
  });

  describe('project access validation', () => {
    it('returns true when viewer.projects is empty array (grants access to ALL projects)', () => {
      const viewer = {
        status: 'approved',
        expiresAt: Date.now() + 86400000,
        projects: [],
      };

      // Should have access to any project
      expect(hasAccessToProject(viewer, 'jarvis')).toBe(true);
      expect(hasAccessToProject(viewer, 'xcode-touch-bar')).toBe(true);
      expect(hasAccessToProject(viewer, 'roblox-nux')).toBe(true);
    });

    it('returns true when projectId is in viewer.projects array', () => {
      const viewer = {
        status: 'approved',
        expiresAt: Date.now() + 86400000,
        projects: ['jarvis', 'xcode-touch-bar'],
      };

      expect(hasAccessToProject(viewer, 'jarvis')).toBe(true);
      expect(hasAccessToProject(viewer, 'xcode-touch-bar')).toBe(true);
    });

    it('returns false when projectId is NOT in viewer.projects array', () => {
      const viewer = {
        status: 'approved',
        expiresAt: Date.now() + 86400000,
        projects: ['jarvis', 'xcode-touch-bar'],
      };

      expect(hasAccessToProject(viewer, 'roblox-nux')).toBe(false);
      expect(hasAccessToProject(viewer, 'humanics-calendar-sharing')).toBe(false);
    });
  });
});