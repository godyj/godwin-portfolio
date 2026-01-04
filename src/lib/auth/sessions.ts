import { cookies } from 'next/headers';
import { randomBytes } from 'crypto';
import { redis } from './redis';
import type { Session, SessionWithId } from './types';

const SESSION_COOKIE = 'portfolio_session';
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
const SESSION_DURATION_SECONDS = 7 * 24 * 60 * 60; // 7 days in seconds

/**
 * Generate a cryptographically secure session ID
 */
function generateSessionId(): string {
  return randomBytes(32).toString('base64url');
}

/**
 * Create a new session for a user
 * Sets HTTP-only cookie and stores session in Redis
 */
export async function createSession(
  email: string,
  role: 'viewer' | 'admin'
): Promise<string> {
  const sessionId = generateSessionId();
  const expiresAt = Date.now() + SESSION_DURATION;

  // Store session in Redis
  await redis.set(
    `session:${sessionId}`,
    {
      email,
      role,
      expiresAt,
    } satisfies Session,
    { ex: SESSION_DURATION_SECONDS }
  );

  // Track session ID by email (for bulk invalidation on revoke)
  await redis.sadd(`sessions:${email}`, sessionId);

  // Set HTTP-only cookie
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: new Date(expiresAt),
    path: '/',
  });

  return sessionId;
}

/**
 * Get the current session from the request cookie
 * Returns null if no valid session exists
 */
export async function getSession(): Promise<SessionWithId | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;

  if (!sessionId) return null;

  const session = await redis.get<Session>(`session:${sessionId}`);

  if (!session) return null;

  // Check if session has expired
  if (Date.now() > session.expiresAt) {
    await redis.del(`session:${sessionId}`);
    return null;
  }

  return { ...session, sessionId };
}

/**
 * Destroy the current session
 * Removes cookie and deletes session from Redis
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;

  if (sessionId) {
    const session = await redis.get<Session>(`session:${sessionId}`);
    if (session) {
      // Remove from email's session set
      await redis.srem(`sessions:${session.email}`, sessionId);
    }
    await redis.del(`session:${sessionId}`);
  }

  cookieStore.delete(SESSION_COOKIE);
}

/**
 * Invalidate ALL sessions for an email
 * Used when revoking access to ensure user is logged out everywhere
 */
export async function invalidateAllSessions(email: string): Promise<number> {
  const sessionIds = await redis.smembers(`sessions:${email}`);

  if (sessionIds.length === 0) return 0;

  // Delete all session records using pipeline for efficiency
  const pipeline = redis.pipeline();
  for (const sessionId of sessionIds) {
    pipeline.del(`session:${sessionId}`);
  }
  pipeline.del(`sessions:${email}`);
  await pipeline.exec();

  return sessionIds.length;
}
