import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isProjectLocked, getLockedProjectIds, setProjectLockState } from './projects';

// Mock the redis module
vi.mock('./redis', () => ({
  redis: {
    get: vi.fn(),
    set: vi.fn(),
  },
}));

// Mock the projects data
vi.mock('@/data/projects', () => ({
  projects: [
    { id: 'project-1', locked: true },
    { id: 'project-2', locked: false },
    { id: 'project-3', locked: true },
  ],
}));

// Import the mocked redis after mocking
import { redis } from './redis';

describe('isProjectLocked', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns Redis override value when it exists (true)', async () => {
    vi.mocked(redis.get).mockResolvedValue(true);

    const result = await isProjectLocked('project-2');

    expect(redis.get).toHaveBeenCalledWith('project-lock:project-2');
    expect(result).toBe(true);
  });

  it('returns Redis override value when it exists (false)', async () => {
    vi.mocked(redis.get).mockResolvedValue(false);

    const result = await isProjectLocked('project-1');

    expect(redis.get).toHaveBeenCalledWith('project-lock:project-1');
    expect(result).toBe(false);
  });

  it('falls back to static value when Redis returns null', async () => {
    vi.mocked(redis.get).mockResolvedValue(null);

    // project-1 has locked: true in our mock data
    const result1 = await isProjectLocked('project-1');
    expect(result1).toBe(true);

    // project-2 has locked: false in our mock data
    const result2 = await isProjectLocked('project-2');
    expect(result2).toBe(false);
  });

  it('returns false for unknown project ID', async () => {
    vi.mocked(redis.get).mockResolvedValue(null);

    const result = await isProjectLocked('unknown-project');

    expect(result).toBe(false);
  });
});

describe('getLockedProjectIds', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns correct IDs based on isProjectLocked results', async () => {
    // Mock Redis to return overrides for specific projects
    vi.mocked(redis.get).mockImplementation(async (key: string) => {
      if (key === 'project-lock:project-1') return true;
      if (key === 'project-lock:project-2') return true; // Override: unlocked -> locked
      if (key === 'project-lock:project-3') return false; // Override: locked -> unlocked
      return null;
    });

    const result = await getLockedProjectIds();

    expect(result).toEqual(['project-1', 'project-2']);
  });

  it('returns empty array when no projects are locked', async () => {
    // Mock Redis to return false for all projects
    vi.mocked(redis.get).mockResolvedValue(false);

    const result = await getLockedProjectIds();

    expect(result).toEqual([]);
  });
});

describe('setProjectLockState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls redis.set with correct key and value', async () => {
    vi.mocked(redis.set).mockResolvedValue('OK');

    await setProjectLockState('project-1', true);

    expect(redis.set).toHaveBeenCalledWith('project-lock:project-1', true);
  });

  it('calls redis.set with correct key and value when unlocking', async () => {
    vi.mocked(redis.set).mockResolvedValue('OK');

    await setProjectLockState('project-2', false);

    expect(redis.set).toHaveBeenCalledWith('project-lock:project-2', false);
  });
});