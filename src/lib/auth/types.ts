// Viewer access record
export type ViewerAccess = {
  email: string;
  status: 'pending' | 'approved' | 'denied' | 'archived';
  projects: string[]; // Project IDs they can access (empty = all locked projects)
  requestedProject?: string; // Project ID they originally requested access from
  expiresAt: number | null; // Unix timestamp or null for permanent
  createdAt: number;
  approvedAt?: number;
  archivedAt?: number;
};

// Magic link token
export type MagicLinkToken = {
  email: string;
  type: 'viewer' | 'admin';
  expiresAt: number; // 15 minutes from creation
};

// Session
export type Session = {
  email: string;
  role: 'viewer' | 'admin';
  expiresAt: number; // 7 days from login
};

// Session with ID (returned from getSession)
export type SessionWithId = Session & {
  sessionId: string;
};

// Locked project info for admin UI
export type LockedProject = {
  id: string;
  title: string;
  subtitle: string;
};

// Project with lock status for admin UI
export type ProjectWithStatus = {
  id: string;
  title: string;
  subtitle: string;
  locked: boolean;
};
