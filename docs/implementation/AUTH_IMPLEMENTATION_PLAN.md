# Authentication System Implementation Plan

> Created: 2026-01-03 | Status: **Security Reviewed & Approved**
> Security Review: 2026-01-03 | All HIGH/MEDIUM issues addressed

## Overview

Implement email-based magic link authentication to lock select portfolio projects behind access control. Viewers request access via email, owner approves/denies with expiration dates.

---

## Security Summary

This implementation follows the security standards defined in [CLAUDE.md](../CLAUDE.md):

| Security Requirement | Implementation |
|---------------------|----------------|
| **Crypto-grade tokens** | `crypto.randomBytes(32)` for tokens and session IDs |
| **Rate limiting** | @upstash/ratelimit on all endpoints (5-10 req/min) |
| **Input validation** | zod schemas for email and token validation |
| **HTTP-only cookies** | Session cookie with `httpOnly`, `secure`, `sameSite` |
| **One-time tokens** | Magic links deleted after single use |
| **Short token expiry** | 15-minute expiration on magic links |
| **Uniform responses** | No email enumeration possible |
| **Session invalidation** | Bulk session deletion on access revocation |
| **Test bypass gating** | `AUTH_TEST_MODE` env var required |

---

## Phase 1: Walking Skeleton (MVP)

**Goal**: End-to-end magic link flow working with minimal features.

### 1.1 Environment Setup

```bash
# Install dependencies
npm install @upstash/redis @upstash/ratelimit resend zod

# Create .env.local
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
RESEND_API_KEY=
SUPER_ADMIN_EMAIL=godwinjohnson@me.com
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Note**: We use Node.js built-in `crypto.randomBytes()` for token generation instead of nanoid, as it provides cryptographically secure random values.

**Upstash Setup:**
1. Create account at upstash.com
2. Create Redis database (select nearest region)
3. Copy REST URL and token to `.env.local`

**Resend Setup:**
1. Create account at resend.com
2. Verify domain `designed.cloud` (or use test domain initially)
3. Create API key → copy to `.env.local`

### 1.1.1 Testing Environment Variables

```bash
# Add to .env.local for local testing
# Add to .env.test for Playwright tests

# Enable test mode (bypasses real auth)
AUTH_TEST_MODE=true

# Secret token for Playwright to create test sessions
AUTH_TEST_SECRET=your-test-secret-here-change-in-production
```

**IMPORTANT**: Never set `AUTH_TEST_MODE=true` in production!

---

## Testing Strategy: Playwright Auth Bypass

### Why Bypass Auth in Tests?

1. **Speed**: No email sending/receiving delays
2. **Reliability**: No external service dependencies (Resend, email inbox)
3. **Isolation**: Tests don't pollute real viewer/session data
4. **CI/CD**: Works in headless environments without email access

### Test Bypass API (`/api/auth/test-session/route.ts`)

**SECURITY FEATURES:**
- Environment gate (AUTH_TEST_MODE)
- Secret verification
- Rate limiting (10 requests/minute)
- Input validation

```typescript
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createSession } from '@/lib/auth/sessions';
import { testSessionRatelimit } from '@/lib/auth/ratelimit';
import { validateEmail } from '@/lib/auth/validation';

export async function POST(request: Request) {
  // SECURITY: Only allow in test mode
  if (process.env.AUTH_TEST_MODE !== 'true') {
    return NextResponse.json(
      { error: 'Test mode not enabled' },
      { status: 403 }
    );
  }

  // SECURITY: Rate limiting even in test mode
  const ip = headers().get('x-forwarded-for') ?? 'anonymous';
  const { success: rateLimitOk } = await testSessionRatelimit.limit(ip);
  if (!rateLimitOk) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }

  const { secret, email, role } = await request.json();

  // SECURITY: Verify test secret
  if (secret !== process.env.AUTH_TEST_SECRET) {
    return NextResponse.json(
      { error: 'Invalid test secret' },
      { status: 401 }
    );
  }

  // SECURITY: Validate email
  const validation = validateEmail(email);
  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error },
      { status: 400 }
    );
  }

  // Validate role
  if (role !== 'viewer' && role !== 'admin') {
    return NextResponse.json(
      { error: 'Invalid role' },
      { status: 400 }
    );
  }

  // Create session directly (no magic link, no email)
  const sessionId = await createSession(validation.email, role);

  return NextResponse.json({ success: true, sessionId });
}
```

### Playwright Test Helper

```typescript
// tests/helpers/auth.ts
import { Page } from '@playwright/test';

const TEST_SECRET = process.env.AUTH_TEST_SECRET || 'test-secret';
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

/**
 * Create an authenticated session for testing
 * Bypasses magic link flow entirely
 */
export async function loginAsViewer(page: Page, email = 'test-viewer@example.com') {
  const response = await page.request.post(`${BASE_URL}/api/auth/test-session`, {
    data: {
      secret: TEST_SECRET,
      email,
      role: 'viewer',
    },
  });

  if (!response.ok()) {
    throw new Error(`Failed to create test session: ${await response.text()}`);
  }

  // Refresh page to pick up session cookie
  await page.reload();
}

export async function loginAsAdmin(page: Page) {
  const response = await page.request.post(`${BASE_URL}/api/auth/test-session`, {
    data: {
      secret: TEST_SECRET,
      email: 'admin@test.com',
      role: 'admin',
    },
  });

  if (!response.ok()) {
    throw new Error(`Failed to create test session: ${await response.text()}`);
  }

  await page.reload();
}

export async function logout(page: Page) {
  await page.request.post(`${BASE_URL}/api/auth/logout`);
  await page.reload();
}
```

### Example Playwright Tests

```typescript
// tests/auth/protected-project.spec.ts
import { test, expect } from '@playwright/test';
import { loginAsViewer, loginAsAdmin, logout } from '../helpers/auth';

test.describe('Protected Projects', () => {
  test('shows access request modal when not logged in', async ({ page }) => {
    await page.goto('/projects/humanics-calendar-sharing');

    await expect(page.getByText('This project is private')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Request Access' })).toBeVisible();
  });

  test('shows project content when logged in as approved viewer', async ({ page }) => {
    await page.goto('/projects/humanics-calendar-sharing');

    // Use test bypass to authenticate
    await loginAsViewer(page, 'approved-viewer@example.com');

    // Now should see content
    await expect(page.getByText('This project is private')).not.toBeVisible();
    await expect(page.getByRole('heading', { name: 'Humanics' })).toBeVisible();
  });

  test('admin can access admin dashboard', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin');

    await expect(page.getByRole('heading', { name: 'Admin Dashboard' })).toBeVisible();
  });

  test('logout clears session', async ({ page }) => {
    await loginAsViewer(page);
    await page.goto('/projects/humanics-calendar-sharing');

    // Should see content
    await expect(page.getByRole('heading', { name: 'Humanics' })).toBeVisible();

    // Logout
    await logout(page);

    // Should see access request modal again
    await expect(page.getByText('This project is private')).toBeVisible();
  });
});
```

### Playwright Config for Auth Testing

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: {
    baseURL: 'http://localhost:3000',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    env: {
      AUTH_TEST_MODE: 'true',
      AUTH_TEST_SECRET: 'playwright-test-secret',
    },
  },
});
```

### Security Safeguards

| Safeguard | Implementation |
|-----------|----------------|
| Test mode disabled by default | `AUTH_TEST_MODE` must be explicitly set |
| Secret required | Even in test mode, secret must match |
| No production exposure | CI/CD should never set `AUTH_TEST_MODE=true` for prod |
| Different secret per environment | Use unique `AUTH_TEST_SECRET` for each env |

### File Structure Update

```
/src
  /app
    /api
      /auth
        /test-session/route.ts  # NEW: Test bypass endpoint
        /request/route.ts
        /verify/route.ts
        /logout/route.ts
/tests
  /helpers
    /auth.ts                    # NEW: Playwright auth helpers
  /auth
    /protected-project.spec.ts  # NEW: Auth tests
```

---

### 1.2 Data Schema (Redis)

```typescript
// Viewer access record
type ViewerAccess = {
  email: string;
  status: 'pending' | 'approved' | 'denied';
  projects: string[];        // Project IDs they can access
  expiresAt: number | null;  // Unix timestamp or null for permanent
  createdAt: number;
  approvedAt?: number;
};

// Magic link token
type MagicLinkToken = {
  email: string;
  type: 'viewer' | 'admin';
  expiresAt: number;         // 15 minutes from creation
};

// Session
type Session = {
  email: string;
  role: 'viewer' | 'admin';
  expiresAt: number;         // 7 days from login
};
```

**Redis Key Structure:**
```
viewer:{email}           → ViewerAccess JSON
token:{tokenId}          → MagicLinkToken JSON
session:{sessionId}      → Session JSON
sessions:{email}         → Set of session IDs (for bulk invalidation)
pending_viewers          → Set of pending email addresses
ratelimit:*              → Rate limiting data (auto-managed)
```

### 1.3 File Structure

```
/src
  /lib
    /auth
      redis.ts           # Upstash Redis client
      ratelimit.ts       # Rate limiting configuration (SECURITY)
      tokens.ts          # Magic link generation/validation (crypto-grade)
      sessions.ts        # Session management
      email.ts           # Resend email sending
      validation.ts      # Input validation with zod (SECURITY)
      types.ts           # TypeScript types
  /app
    /api
      /auth
        /request/route.ts     # POST: Request access (viewer)
        /verify/route.ts      # GET: Verify magic link
        /logout/route.ts      # POST: Logout
        /test-session/route.ts # POST: Test bypass (dev only)
    /admin
      /page.tsx               # Admin dashboard
      /api
        /viewers/route.ts     # GET/POST: List/manage viewers
        /approve/route.ts     # POST: Approve viewer
        /revoke/route.ts      # POST: Revoke access (+ session invalidation)
  /components
    AccessRequestModal.tsx    # Email input modal
    ProtectedProject.tsx      # Wrapper for locked projects
```

### 1.4 Core Implementation Steps

#### Step 1: Redis Client (`src/lib/auth/redis.ts`)
```typescript
import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});
```

#### Step 2: Token Generation (`src/lib/auth/tokens.ts`)

**SECURITY**: Uses crypto-grade randomness instead of Math.random()-based libraries.

```typescript
import { randomBytes } from 'crypto';
import { redis } from './redis';
import { MagicLinkToken } from './types';

/**
 * Generate a cryptographically secure token
 * Uses Node.js crypto.randomBytes for true randomness
 */
function generateSecureToken(length = 32): string {
  return randomBytes(length).toString('base64url');
}

export async function createMagicLink(email: string, type: 'viewer' | 'admin') {
  const tokenId = generateSecureToken(32); // 256 bits of entropy
  const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes

  await redis.set(`token:${tokenId}`, {
    email,
    type,
    expiresAt,
  }, { ex: 900 }); // Auto-expire in Redis

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
  return `${baseUrl}/api/auth/verify?token=${tokenId}`;
}

export async function verifyMagicLink(tokenId: string) {
  const token = await redis.get<MagicLinkToken>(`token:${tokenId}`);
  if (!token) return null;
  if (Date.now() > token.expiresAt) return null;

  await redis.del(`token:${tokenId}`); // One-time use
  return token;
}
```

#### Step 3: Email Sending (`src/lib/auth/email.ts`)
```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendMagicLink(email: string, magicLink: string, type: 'viewer' | 'admin') {
  const subject = type === 'admin'
    ? 'Admin Login - Godwin Portfolio'
    : 'Access Your Portfolio Projects';

  await resend.emails.send({
    from: 'Godwin Portfolio <noreply@designed.cloud>',
    to: email,
    subject,
    html: `
      <p>Click the link below to access the portfolio:</p>
      <a href="${magicLink}">Access Portfolio</a>
      <p>This link expires in 15 minutes.</p>
    `,
  });
}

export async function sendAccessRequestNotification(viewerEmail: string) {
  const adminEmail = process.env.SUPER_ADMIN_EMAIL!;
  const adminLink = `${process.env.NEXT_PUBLIC_SITE_URL}/admin`;

  await resend.emails.send({
    from: 'Godwin Portfolio <noreply@designed.cloud>',
    to: adminEmail,
    subject: `Access Request: ${viewerEmail}`,
    html: `
      <p><strong>${viewerEmail}</strong> has requested access to your portfolio.</p>
      <a href="${adminLink}">Review in Admin Dashboard</a>
    `,
  });
}
```

#### Step 3.5: Rate Limiting (`src/lib/auth/ratelimit.ts`)

**SECURITY**: Prevents brute force attacks and email spam.

```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { redis } from './redis';

// Rate limit for access requests: 5 per minute per IP
export const requestRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 m'),
  prefix: 'ratelimit:request',
});

// Rate limit for test-session (stricter): 10 per minute
export const testSessionRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 m'),
  prefix: 'ratelimit:test',
});

// Rate limit for magic link verification: 10 per minute per IP
export const verifyRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 m'),
  prefix: 'ratelimit:verify',
});
```

#### Step 3.6: Input Validation (`src/lib/auth/validation.ts`)

**SECURITY**: Validates and sanitizes all user input.

```typescript
import { z } from 'zod';

export const emailSchema = z
  .string()
  .email('Invalid email format')
  .max(255, 'Email too long')
  .toLowerCase()
  .trim();

export const tokenSchema = z
  .string()
  .min(32, 'Invalid token')
  .max(64, 'Invalid token')
  .regex(/^[A-Za-z0-9_-]+$/, 'Invalid token format');

export function validateEmail(email: unknown): { success: true; email: string } | { success: false; error: string } {
  const result = emailSchema.safeParse(email);
  if (result.success) {
    return { success: true, email: result.data };
  }
  return { success: false, error: result.error.errors[0].message };
}

export function validateToken(token: unknown): { success: true; token: string } | { success: false; error: string } {
  const result = tokenSchema.safeParse(token);
  if (result.success) {
    return { success: true, token: result.data };
  }
  return { success: false, error: 'Invalid token' };
}
```

#### Step 4: Session Management (`src/lib/auth/sessions.ts`)

**SECURITY**: Uses crypto-grade session IDs and supports bulk session invalidation.

```typescript
import { cookies } from 'next/headers';
import { randomBytes } from 'crypto';
import { redis } from './redis';
import { Session } from './types';

const SESSION_COOKIE = 'portfolio_session';
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Generate a cryptographically secure session ID
 */
function generateSessionId(): string {
  return randomBytes(32).toString('base64url');
}

export async function createSession(email: string, role: 'viewer' | 'admin') {
  const sessionId = generateSessionId();
  const expiresAt = Date.now() + SESSION_DURATION;

  // Store session with email index for bulk invalidation
  await redis.set(`session:${sessionId}`, {
    email,
    role,
    expiresAt,
  }, { ex: 7 * 24 * 60 * 60 }); // 7 days

  // Track session ID by email (for revocation)
  await redis.sadd(`sessions:${email}`, sessionId);

  cookies().set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: new Date(expiresAt),
  });

  return sessionId;
}

export async function getSession() {
  const sessionId = cookies().get(SESSION_COOKIE)?.value;
  if (!sessionId) return null;

  const session = await redis.get<Session>(`session:${sessionId}`);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    await redis.del(`session:${sessionId}`);
    return null;
  }

  return { ...session, sessionId };
}

export async function destroySession() {
  const sessionId = cookies().get(SESSION_COOKIE)?.value;
  if (sessionId) {
    const session = await redis.get<Session>(`session:${sessionId}`);
    if (session) {
      await redis.srem(`sessions:${session.email}`, sessionId);
    }
    await redis.del(`session:${sessionId}`);
  }
  cookies().delete(SESSION_COOKIE);
}

/**
 * SECURITY: Invalidate ALL sessions for an email (used when revoking access)
 */
export async function invalidateAllSessions(email: string): Promise<number> {
  const sessionIds = await redis.smembers(`sessions:${email}`);

  if (sessionIds.length === 0) return 0;

  // Delete all session records
  const pipeline = redis.pipeline();
  for (const sessionId of sessionIds) {
    pipeline.del(`session:${sessionId}`);
  }
  pipeline.del(`sessions:${email}`);
  await pipeline.exec();

  return sessionIds.length;
}
```

#### Step 5: API Routes

**Request Access (`/api/auth/request/route.ts`):**

**SECURITY FEATURES:**
- Rate limiting (5 requests/minute per IP)
- Input validation
- Uniform response (prevents email enumeration)

```typescript
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createMagicLink } from '@/lib/auth/tokens';
import { sendMagicLink, sendAccessRequestNotification } from '@/lib/auth/email';
import { redis } from '@/lib/auth/redis';
import { requestRatelimit } from '@/lib/auth/ratelimit';
import { validateEmail } from '@/lib/auth/validation';

export async function POST(request: Request) {
  // Get IP for rate limiting
  const ip = headers().get('x-forwarded-for') ?? 'anonymous';

  // SECURITY: Rate limiting
  const { success: rateLimitOk } = await requestRatelimit.limit(ip);
  if (!rateLimitOk) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  const body = await request.json();

  // SECURITY: Input validation
  const validation = validateEmail(body.email);
  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error },
      { status: 400 }
    );
  }

  const email = validation.email;
  const isAdmin = email === process.env.SUPER_ADMIN_EMAIL?.toLowerCase();

  try {
    if (isAdmin) {
      // Admin: Send magic link directly
      const magicLink = await createMagicLink(email, 'admin');
      await sendMagicLink(email, magicLink, 'admin');
    } else {
      // Viewer: Check if already approved
      const viewer = await redis.get<{ status: string }>(`viewer:${email}`);

      if (viewer?.status === 'approved') {
        // Already approved: Send magic link
        const magicLink = await createMagicLink(email, 'viewer');
        await sendMagicLink(email, magicLink, 'viewer');
      } else if (viewer?.status === 'pending') {
        // Already pending: Do nothing (don't spam admin)
        // But still return success to prevent enumeration
      } else {
        // New request: Add to pending and notify admin
        await redis.set(`viewer:${email}`, {
          email,
          status: 'pending',
          projects: [],
          expiresAt: null,
          createdAt: Date.now(),
        });
        await redis.sadd('pending_viewers', email);
        await sendAccessRequestNotification(email);
      }
    }
  } catch (error) {
    // Log error but don't expose details
    console.error('Auth request error:', error);
  }

  // SECURITY: Always return same response to prevent email enumeration
  return NextResponse.json({
    success: true,
    message: 'If this email is approved or pending approval, you will receive further instructions.',
  });
}
```

**Verify Magic Link (`/api/auth/verify/route.ts`):**

**SECURITY FEATURES:**
- Rate limiting (10 requests/minute per IP)
- Token validation

```typescript
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { verifyMagicLink } from '@/lib/auth/tokens';
import { createSession } from '@/lib/auth/sessions';
import { verifyRatelimit } from '@/lib/auth/ratelimit';
import { validateToken } from '@/lib/auth/validation';

export async function GET(request: Request) {
  const ip = headers().get('x-forwarded-for') ?? 'anonymous';
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || '';

  // SECURITY: Rate limiting
  const { success: rateLimitOk } = await verifyRatelimit.limit(ip);
  if (!rateLimitOk) {
    return NextResponse.redirect(`${baseUrl}/auth/error?reason=rate_limited`);
  }

  const { searchParams } = new URL(request.url);
  const rawToken = searchParams.get('token');

  // SECURITY: Validate token format
  const validation = validateToken(rawToken);
  if (!validation.success) {
    return NextResponse.redirect(`${baseUrl}/auth/error?reason=invalid_token`);
  }

  const token = await verifyMagicLink(validation.token);
  if (!token) {
    return NextResponse.redirect(`${baseUrl}/auth/error?reason=invalid_token`);
  }

  await createSession(token.email, token.type);

  const redirectUrl = token.type === 'admin' ? '/admin' : '/';
  return NextResponse.redirect(`${baseUrl}${redirectUrl}`);
}
```

### 1.5 Project Lock Configuration

Update `projects.ts` to add lock status:

```typescript
export interface Project {
  // ... existing fields
  locked?: boolean;  // If true, requires authentication
}

// Example:
{
  id: 'humanics-calendar-sharing',
  locked: true,  // Requires access
  // ...
}
```

### 1.6 Protected Project Wrapper

```typescript
// src/components/ProtectedProject.tsx
'use client';

import { useState } from 'react';
import AccessRequestModal from './AccessRequestModal';

export default function ProtectedProject({
  project,
  hasAccess,
  children
}: {
  project: Project;
  hasAccess: boolean;
  children: React.ReactNode;
}) {
  const [showModal, setShowModal] = useState(false);

  if (!project.locked || hasAccess) {
    return <>{children}</>;
  }

  return (
    <>
      <div className="text-center py-20">
        <h2>This project is private</h2>
        <p>Request access to view this case study.</p>
        <button onClick={() => setShowModal(true)}>
          Request Access
        </button>
      </div>
      {showModal && (
        <AccessRequestModal
          projectTitle={project.title}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
```

---

## Phase 2: Admin Dashboard

### 2.1 Admin Page (`/admin/page.tsx`)

Features:
- List pending access requests
- Approve/deny with expiration date picker
- List approved viewers with revoke option
- Configure which projects are locked

### 2.2 Admin API Routes

- `GET /api/admin/viewers` - List all viewers
- `POST /api/admin/approve` - Approve viewer with projects and expiration
- `POST /api/admin/revoke` - Revoke viewer access
- `POST /api/admin/projects` - Update project lock status

---

## Phase 3: Polish & Edge Cases

### 3.1 Features
- [ ] Email templates with React Email
- [ ] Expiration warning emails (1 day before)
- [ ] Access granted confirmation email
- [ ] Rate limiting on request endpoint
- [ ] Audit log of access grants/revokes

### 3.2 Edge Cases
- [ ] Expired access redirects to request form
- [ ] Invalid token shows friendly error
- [ ] Handle Resend API failures gracefully
- [ ] Handle Redis connection failures

---

## Expert Security Review

> **Status**: ✅ All HIGH and MEDIUM severity issues addressed

### Security Audit Summary

| Issue | Severity | Status | Resolution |
|-------|----------|--------|------------|
| No rate limiting | HIGH | ✅ FIXED | Added @upstash/ratelimit on all endpoints |
| Email enumeration | HIGH | ✅ FIXED | Uniform responses for all email requests |
| Weak token generation | MEDIUM | ✅ FIXED | crypto.randomBytes instead of nanoid |
| No input validation | MEDIUM | ✅ FIXED | zod validation on all inputs |
| Session not invalidated on revoke | MEDIUM | ✅ FIXED | invalidateAllSessions() function |
| CSRF protection | LOW | DEFERRED | SameSite cookies provide adequate protection |

### Strengths of This Plan

1. **Security-First Design**: Rate limiting, input validation, crypto-grade tokens
2. **Minimal Dependencies**: 4 packages (@upstash/redis, @upstash/ratelimit, resend, zod)
3. **Zero Recurring Cost**: Both services have generous free tiers
4. **Defense in Depth**: HTTP-only cookies, one-time tokens, auto-expiring sessions
5. **Simplicity**: No Auth.js complexity, no OAuth providers
6. **Scalability**: Can handle growth without code changes

### Potential Concerns

| Concern | Mitigation |
|---------|------------|
| Redis data loss | Upstash has automatic backups on paid tier; for free tier, data is durable but no SLA |
| Email deliverability | Resend has excellent deliverability; verify domain properly |
| Session hijacking | HTTP-only cookies + Secure flag + SameSite=lax in production |

### Future Improvements (Phase 2+)

1. **Use React Email** for beautiful, consistent email templates
2. **Add honeypot field** to request form to catch bots
3. **Log admin actions** to Redis for audit trail
4. **Add CSRF tokens** for enhanced protection (currently using SameSite cookies)

### Walking Skeleton Scope

For the initial walking skeleton, implement ONLY:
- [ ] Redis client setup
- [ ] **Rate limiting** (SECURITY - required for skeleton)
- [ ] **Input validation with zod** (SECURITY - required for skeleton)
- [ ] Magic link generation with **crypto-grade tokens** (SECURITY)
- [ ] Email sending (plain HTML, no React Email yet)
- [ ] Session creation with **bulk invalidation support** (SECURITY)
- [ ] Single protected project page
- [ ] Basic admin page (list/approve/deny with session invalidation)
- [ ] **Test bypass API** (`/api/auth/test-session`)
- [ ] **Playwright auth helpers** (`tests/helpers/auth.ts`)

Skip for now:
- Expiration date picker
- Project selection in approval
- Email templates (React Email)
- CSRF protection (SameSite cookies provide adequate protection for API routes)
- Audit logging

---

## Implementation Order

```
Day 1: Setup
├── Create Upstash account + database
├── Create Resend account + verify domain
├── Install packages
├── Create lib/auth/* files
├── Test Redis connection
├── Create /api/auth/test-session route
└── Create tests/helpers/auth.ts

Day 2: Core Auth
├── Implement token generation
├── Implement email sending
├── Create /api/auth/request route
├── Create /api/auth/verify route
├── Create /api/auth/logout route
└── Test end-to-end flow (manual + Playwright)

Day 3: UI
├── Create AccessRequestModal component
├── Create ProtectedProject wrapper
├── Add locked flag to one project
├── Write Playwright tests for protected access
└── Create basic admin page

Day 4: Admin Features
├── List pending requests
├── Approve/deny functionality
├── List approved viewers
├── Revoke access
├── Write Playwright tests for admin flow
└── Test complete flow
```

---

## Acceptance Criteria (Walking Skeleton)

### Core Flow
- [ ] Viewer can enter email on locked project page
- [ ] Admin receives notification email
- [ ] Admin can log in via magic link
- [ ] Admin can approve viewer
- [ ] Viewer receives magic link after approval
- [ ] Viewer can access locked project after login
- [ ] Session persists for 7 days
- [ ] Admin can revoke access
- [ ] **Revoking access invalidates all active sessions for that email**

### Security Requirements
- [ ] Rate limiting blocks excessive requests (429 response)
- [ ] Invalid email format returns 400 error
- [ ] All responses are uniform (no email enumeration)
- [ ] Tokens are crypto-grade (using crypto.randomBytes)
- [ ] Session IDs are crypto-grade
- [ ] Sessions are tracked by email for bulk invalidation

### Playwright Testing
- [ ] Test bypass API returns 403 when `AUTH_TEST_MODE` is not set
- [ ] Test bypass API returns 401 when secret is wrong
- [ ] Test bypass API returns 429 when rate limited
- [ ] Test bypass API creates valid session with correct secret
- [ ] `loginAsViewer()` helper creates viewer session
- [ ] `loginAsAdmin()` helper creates admin session
- [ ] `logout()` helper clears session
- [ ] Playwright tests pass for protected project access flow
