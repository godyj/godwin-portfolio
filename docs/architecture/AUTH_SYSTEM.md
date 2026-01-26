# Authentication System Architecture

> **Last Updated:** 2026-01-25

This document describes the authentication and authorization system for the portfolio site.

---

## Overview

The auth system protects NDA-covered project case studies. It uses magic link authentication (passwordless) with session-based access control.

```
User enters email → Magic link sent → Click link → Session cookie created → Access granted
```

---

## Components

### Infrastructure

| Component | Provider | Details |
|-----------|----------|---------|
| Database | Upstash Redis | 500K requests/month free tier |
| Email | Resend | 3K emails/month free, domain: designed.cloud |
| Sessions | HTTP-only cookies | Secure, SameSite=Lax |
| Tokens | crypto.randomBytes(32) | Crypto-grade random |

### Key Files

```
src/lib/auth/
├── types.ts        # TypeScript types (ViewerAccess, Session, etc.)
├── redis.ts        # Upstash Redis client
├── tokens.ts       # Magic link token generation
├── sessions.ts     # Session management (create, get, destroy)
├── email.ts        # Resend email sending
├── validation.ts   # Zod input validation
├── ratelimit.ts    # Rate limiting (Upstash)
├── projects.ts     # Project lock state helpers
└── index.ts        # Public exports
```

---

## Redis Key Structure

```
viewer:{email}      → ViewerAccess object
token:{token}       → { email, type, expiresAt }
session:{sessionId} → { email, role, createdAt, expiresAt }
sessions:{email}    → Set of session IDs (for bulk revocation)
project-lock:{id}   → boolean (Redis override for lock state)
pending_viewers     → Set of pending viewer emails
```

### ViewerAccess Schema

```typescript
interface ViewerAccess {
  email: string;
  status: 'pending' | 'approved' | 'denied' | 'archived';
  projects: string[];        // Empty = all projects
  requestedProject?: string; // Which project they requested from
  expiresAt: number | null;  // Access expiration timestamp
  createdAt: number;
  approvedAt?: number;
  archivedAt?: number;
}
```

---

## Authentication Flow

### 1. Viewer Requests Access

```
POST /api/auth/request
├── Rate limit check (5/min per IP)
├── Email validation (Zod)
├── Check existing status:
│   ├── New → Create pending record, notify admin
│   ├── Pending → Do nothing (prevent spam)
│   ├── Approved → Send magic link
│   ├── Denied → Do nothing
│   └── Expired → Update to denied, do nothing
└── Return generic success (prevent enumeration)
```

### 2. Admin Approves Viewer

```
POST /admin/api/approve
├── Admin session check
├── Email validation
├── Update status to 'approved'
├── Set expiresAt if provided
├── Remove from pending_viewers set
├── Create magic link
└── Send approval email with link
```

### 3. Viewer Clicks Magic Link

```
GET /api/auth/verify?token=xxx
├── Rate limit check (10/min per IP)
├── Token format validation
├── Verify token in Redis (exists, not expired)
├── Delete token (one-time use)
├── Create session
│   ├── Generate session ID (crypto-random)
│   ├── Store in Redis with 7-day expiry
│   ├── Set HTTP-only cookie
│   └── Add to sessions:{email} set
└── Redirect to / (viewer) or /admin (admin)
```

### 4. Access Check on Protected Page

```
Project page load
├── getSession() from cookie
├── If no session → show access request modal
├── If session exists:
│   ├── Check session valid in Redis
│   ├── Check viewer status = 'approved'
│   ├── Check not expired (expiresAt)
│   ├── Check project access (projects array)
│   └── Grant or deny access
```

---

## Access Control Logic

### Who Can Access What

| Role | Access |
|------|--------|
| Admin | All locked projects |
| Approved viewer (projects: []) | All locked projects |
| Approved viewer (projects: ['jarvis']) | Only specified projects |
| Pending/Denied/Archived | No access |

### Project Lock States

Lock state is determined by:
1. **Redis override** (`project-lock:{id}`) - if set, use this value
2. **Static fallback** (`projects.ts` → `locked: boolean`) - if no Redis override

This allows dynamic lock/unlock without redeploying.

---

## Security Properties

### Token Security
- **Generation:** `crypto.randomBytes(32).toString('hex')` (64 chars)
- **Expiration:** 15 minutes
- **One-time use:** Deleted after verification
- **Validation:** Regex check before Redis lookup

### Session Security
- **HTTP-only cookies:** JavaScript cannot read them
- **Secure flag:** Only sent over HTTPS
- **SameSite=Lax:** CSRF protection
- **7-day expiration:** Auto-cleanup
- **Bulk revocation:** All sessions invalidated when access revoked

### Rate Limiting
- **Request endpoint:** 5 requests/minute per IP
- **Verify endpoint:** 10 requests/minute per IP
- **Implementation:** Upstash rate limiter

### Input Validation
- **Emails:** Zod schema, normalized to lowercase
- **Tokens:** Regex format validation
- **Project IDs:** Validated against known projects

---

## Admin Actions

| Action | Effect |
|--------|--------|
| Approve | Set status=approved, send magic link |
| Deny | Set status=denied, invalidate sessions |
| Revoke | Set status=denied, invalidate sessions |
| Archive | Set status=archived, invalidate sessions |
| Restore | Set status=denied (must re-approve) |
| Update Access | Change projects array and/or expiration |
| Toggle Lock | Set/unset Redis override for project |

---

## Environment Variables

```env
# Required
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."
RESEND_API_KEY="re_..."
SUPER_ADMIN_EMAIL="godwinjohnson@me.com"
NEXT_PUBLIC_SITE_URL="https://designed.cloud"
```

---

## Related Documentation

- [API Reference](API_REFERENCE.md) - All endpoint details
- [Auth Security Review](../review/AUTH_SECURITY_REVIEW.md) - Security analysis
- [CLAUDE.md](../../CLAUDE.md) - Project overview
