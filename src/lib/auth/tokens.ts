import { randomBytes } from 'crypto';
import { redis } from './redis';
import type { MagicLinkToken } from './types';

/**
 * Generate a cryptographically secure token
 * Uses Node.js crypto.randomBytes for true randomness
 */
function generateSecureToken(length = 32): string {
  return randomBytes(length).toString('base64url');
}

/**
 * Create a magic link for authentication
 * Token expires in 15 minutes and is one-time use
 */
export async function createMagicLink(
  email: string,
  type: 'viewer' | 'admin'
): Promise<string> {
  const tokenId = generateSecureToken(32); // 256 bits of entropy
  const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes

  await redis.set(
    `token:${tokenId}`,
    {
      email,
      type,
      expiresAt,
    } satisfies MagicLinkToken,
    { ex: 900 } // Auto-expire in Redis after 15 minutes
  );

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
  return `${baseUrl}/api/auth/verify?token=${tokenId}`;
}

/**
 * Verify a magic link token
 * Returns null if token is invalid, expired, or already used
 * Deletes token after verification (one-time use)
 */
export async function verifyMagicLink(
  tokenId: string
): Promise<MagicLinkToken | null> {
  const token = await redis.get<MagicLinkToken>(`token:${tokenId}`);

  if (!token) return null;
  if (Date.now() > token.expiresAt) return null;

  // Delete token immediately (one-time use)
  await redis.del(`token:${tokenId}`);

  return token;
}
