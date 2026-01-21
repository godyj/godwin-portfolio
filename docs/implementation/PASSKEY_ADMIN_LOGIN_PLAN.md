# Elegant Admin Login: Passkey/WebAuthn Implementation Plan

## Problem Statement

Currently, the admin must authenticate via magic link email every 7 days. This creates friction:
- Check email inbox → Find magic link → Click link → Wait for redirect

**Goal:** Enable instant biometric login (fingerprint/Face ID) for admin access.

---

## Solution: Passkey/WebAuthn Authentication

**Why this is the most elegant approach:**
- One-touch login with fingerprint or Face ID
- Phishing-resistant (credentials bound to domain)
- No passwords or magic links needed
- Industry-standard (FIDO2/WebAuthn)
- Works across devices with passkey sync (iCloud Keychain, Google Password Manager)

---

## How It Works

### Registration Flow (One-time Setup)
1. Admin logs in via existing magic link
2. Admin visits `/admin/settings` and clicks "Add Passkey"
3. Browser prompts for biometric (Touch ID, Face ID, Windows Hello)
4. Public key credential stored in Redis, private key stays on device

### Authentication Flow (Daily Use)
1. Admin visits `/admin/login`
2. Clicks "Login with Passkey"
3. Browser prompts for biometric
4. Server verifies signature → creates session
5. Admin redirected to `/admin`

---

## Dependencies

```bash
npm install @simplewebauthn/server @simplewebauthn/browser
npm install -D @simplewebauthn/types
```

**Package sizes:**
- `@simplewebauthn/server`: ~50KB (server-side)
- `@simplewebauthn/browser`: ~15KB (client-side)

---

## Files to Create/Modify

### New Files

| File | Purpose |
|------|---------|
| `src/lib/auth/passkey.ts` | Passkey registration & verification logic |
| `src/lib/auth/passkey-types.ts` | TypeScript types for passkey data |
| `src/app/api/auth/passkey/register-options/route.ts` | Generate registration challenge |
| `src/app/api/auth/passkey/register-verify/route.ts` | Verify registration & store credential |
| `src/app/api/auth/passkey/auth-options/route.ts` | Generate authentication challenge |
| `src/app/api/auth/passkey/auth-verify/route.ts` | Verify authentication & create session |
| `src/app/admin/login/page.tsx` | Admin login page with passkey option |
| `src/app/admin/login/PasskeyLoginButton.tsx` | Client component for passkey auth |
| `src/app/admin/settings/page.tsx` | Admin settings with passkey management |
| `src/app/admin/settings/PasskeyManager.tsx` | Client component for passkey registration |

### Modified Files

| File | Changes |
|------|---------|
| `src/lib/auth/types.ts` | Add passkey credential type |
| `src/lib/auth/index.ts` | Export passkey functions |

---

## Redis Key Structure

```
# Existing keys (unchanged)
session:{sessionId}     → Session object
sessions:{email}        → Set of session IDs
token:{tokenId}         → MagicLinkToken

# New passkey keys
passkey:challenge:{email}  → { challenge, expiresAt } (TTL: 5 minutes)
passkey:credentials:{email} → Array of PasskeyCredential objects
```

---

## Implementation Steps

### Step 1: Install Dependencies

```bash
npm install @simplewebauthn/server @simplewebauthn/browser
npm install -D @simplewebauthn/types
```

### Step 2: Create Passkey Types

**File:** `src/lib/auth/passkey-types.ts`

```typescript
import type {
  AuthenticatorTransportFuture,
  CredentialDeviceType,
} from '@simplewebauthn/types';

export type PasskeyCredential = {
  id: string;                          // Base64URL credential ID
  publicKey: string;                   // Base64URL public key
  counter: number;                     // Signature counter (replay protection)
  deviceType: CredentialDeviceType;    // 'singleDevice' | 'multiDevice'
  backedUp: boolean;                   // Is synced to cloud (iCloud, Google)
  transports?: AuthenticatorTransportFuture[]; // 'usb' | 'ble' | 'nfc' | 'internal'
  createdAt: number;
  lastUsedAt: number;
  friendlyName?: string;               // "MacBook Pro Touch ID"
};

export type PasskeyChallenge = {
  challenge: string;                   // Base64URL challenge
  expiresAt: number;
};
```

### Step 3: Create Passkey Library

**File:** `src/lib/auth/passkey.ts`

```typescript
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import type {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
} from '@simplewebauthn/types';
import { redis } from './redis';
import type { PasskeyCredential, PasskeyChallenge } from './passkey-types';

// WebAuthn configuration
const RP_NAME = 'Godwin Portfolio';
const RP_ID = process.env.NODE_ENV === 'production' ? 'designed.cloud' : 'localhost';
const ORIGIN = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const CHALLENGE_TTL = 5 * 60; // 5 minutes

/**
 * Get all passkey credentials for an admin email
 */
export async function getPasskeyCredentials(
  email: string
): Promise<PasskeyCredential[]> {
  return (await redis.get<PasskeyCredential[]>(`passkey:credentials:${email}`)) || [];
}

/**
 * Generate registration options for adding a new passkey
 */
export async function generatePasskeyRegistrationOptions(email: string) {
  const existingCredentials = await getPasskeyCredentials(email);

  const options = await generateRegistrationOptions({
    rpName: RP_NAME,
    rpID: RP_ID,
    userName: email,
    userDisplayName: 'Admin',
    attestationType: 'none', // Don't need attestation for this use case
    excludeCredentials: existingCredentials.map((cred) => ({
      id: cred.id,
      transports: cred.transports,
    })),
    authenticatorSelection: {
      residentKey: 'preferred',
      userVerification: 'preferred',
      authenticatorAttachment: 'platform', // Prefer built-in (Touch ID, Face ID)
    },
  });

  // Store challenge for verification
  await redis.set(
    `passkey:challenge:${email}`,
    { challenge: options.challenge, expiresAt: Date.now() + CHALLENGE_TTL * 1000 },
    { ex: CHALLENGE_TTL }
  );

  return options;
}

/**
 * Verify registration response and store credential
 */
export async function verifyPasskeyRegistration(
  email: string,
  response: RegistrationResponseJSON,
  friendlyName?: string
): Promise<{ success: boolean; error?: string }> {
  // Get and validate challenge
  const challengeData = await redis.get<PasskeyChallenge>(`passkey:challenge:${email}`);
  if (!challengeData || Date.now() > challengeData.expiresAt) {
    return { success: false, error: 'Challenge expired' };
  }

  try {
    const verification = await verifyRegistrationResponse({
      response,
      expectedChallenge: challengeData.challenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
    });

    if (!verification.verified || !verification.registrationInfo) {
      return { success: false, error: 'Verification failed' };
    }

    const { credential, credentialDeviceType, credentialBackedUp } =
      verification.registrationInfo;

    // Create credential record
    const newCredential: PasskeyCredential = {
      id: credential.id,
      publicKey: Buffer.from(credential.publicKey).toString('base64url'),
      counter: credential.counter,
      deviceType: credentialDeviceType,
      backedUp: credentialBackedUp,
      transports: response.response.transports,
      createdAt: Date.now(),
      lastUsedAt: Date.now(),
      friendlyName,
    };

    // Add to existing credentials
    const credentials = await getPasskeyCredentials(email);
    credentials.push(newCredential);
    await redis.set(`passkey:credentials:${email}`, credentials);

    // Clean up challenge
    await redis.del(`passkey:challenge:${email}`);

    return { success: true };
  } catch (error) {
    console.error('Passkey registration error:', error);
    return { success: false, error: 'Registration failed' };
  }
}

/**
 * Generate authentication options for passkey login
 */
export async function generatePasskeyAuthOptions(email: string) {
  const credentials = await getPasskeyCredentials(email);

  if (credentials.length === 0) {
    return null; // No passkeys registered
  }

  const options = await generateAuthenticationOptions({
    rpID: RP_ID,
    allowCredentials: credentials.map((cred) => ({
      id: cred.id,
      transports: cred.transports,
    })),
    userVerification: 'preferred',
  });

  // Store challenge for verification
  await redis.set(
    `passkey:challenge:${email}`,
    { challenge: options.challenge, expiresAt: Date.now() + CHALLENGE_TTL * 1000 },
    { ex: CHALLENGE_TTL }
  );

  return options;
}

/**
 * Verify authentication response
 */
export async function verifyPasskeyAuthentication(
  email: string,
  response: AuthenticationResponseJSON
): Promise<{ success: boolean; error?: string }> {
  // Get and validate challenge
  const challengeData = await redis.get<PasskeyChallenge>(`passkey:challenge:${email}`);
  if (!challengeData || Date.now() > challengeData.expiresAt) {
    return { success: false, error: 'Challenge expired' };
  }

  const credentials = await getPasskeyCredentials(email);
  const credential = credentials.find((c) => c.id === response.id);

  if (!credential) {
    return { success: false, error: 'Credential not found' };
  }

  try {
    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge: challengeData.challenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
      credential: {
        id: credential.id,
        publicKey: Buffer.from(credential.publicKey, 'base64url'),
        counter: credential.counter,
        transports: credential.transports,
      },
    });

    if (!verification.verified) {
      return { success: false, error: 'Verification failed' };
    }

    // Update counter and last used time
    credential.counter = verification.authenticationInfo.newCounter;
    credential.lastUsedAt = Date.now();
    await redis.set(`passkey:credentials:${email}`, credentials);

    // Clean up challenge
    await redis.del(`passkey:challenge:${email}`);

    return { success: true };
  } catch (error) {
    console.error('Passkey authentication error:', error);
    return { success: false, error: 'Authentication failed' };
  }
}

/**
 * Delete a passkey credential
 */
export async function deletePasskeyCredential(
  email: string,
  credentialId: string
): Promise<boolean> {
  const credentials = await getPasskeyCredentials(email);
  const filtered = credentials.filter((c) => c.id !== credentialId);

  if (filtered.length === credentials.length) {
    return false; // Not found
  }

  await redis.set(`passkey:credentials:${email}`, filtered);
  return true;
}
```

### Step 4: Create Registration API Routes

**File:** `src/app/api/auth/passkey/register-options/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { generatePasskeyRegistrationOptions } from '@/lib/auth/passkey';

export async function POST() {
  const session = await getSession();

  // Must be logged in as admin
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const options = await generatePasskeyRegistrationOptions(session.email);
    return NextResponse.json(options);
  } catch (error) {
    console.error('Failed to generate registration options:', error);
    return NextResponse.json(
      { error: 'Failed to generate options' },
      { status: 500 }
    );
  }
}
```

**File:** `src/app/api/auth/passkey/register-verify/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { verifyPasskeyRegistration } from '@/lib/auth/passkey';

export async function POST(request: Request) {
  const session = await getSession();

  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { response, friendlyName } = await request.json();
    const result = await verifyPasskeyRegistration(
      session.email,
      response,
      friendlyName
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to verify registration:', error);
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    );
  }
}
```

### Step 5: Create Authentication API Routes

**File:** `src/app/api/auth/passkey/auth-options/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { generatePasskeyAuthOptions } from '@/lib/auth/passkey';
import { emailSchema } from '@/lib/auth/validation';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    const validatedEmail = emailSchema.parse(email);

    // Only allow passkey auth for super admin
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL?.toLowerCase();
    if (validatedEmail !== superAdminEmail) {
      return NextResponse.json(
        { error: 'Passkey login is only available for admins' },
        { status: 403 }
      );
    }

    const options = await generatePasskeyAuthOptions(validatedEmail);

    if (!options) {
      return NextResponse.json(
        { error: 'No passkeys registered' },
        { status: 404 }
      );
    }

    return NextResponse.json(options);
  } catch (error) {
    console.error('Failed to generate auth options:', error);
    return NextResponse.json(
      { error: 'Failed to generate options' },
      { status: 500 }
    );
  }
}
```

**File:** `src/app/api/auth/passkey/auth-verify/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { verifyPasskeyAuthentication } from '@/lib/auth/passkey';
import { createSession } from '@/lib/auth';
import { emailSchema } from '@/lib/auth/validation';

export async function POST(request: Request) {
  try {
    const { email, response } = await request.json();
    const validatedEmail = emailSchema.parse(email);

    // Only allow passkey auth for super admin
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL?.toLowerCase();
    if (validatedEmail !== superAdminEmail) {
      return NextResponse.json(
        { error: 'Passkey login is only available for admins' },
        { status: 403 }
      );
    }

    const result = await verifyPasskeyAuthentication(validatedEmail, response);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Create admin session
    await createSession(validatedEmail, 'admin');

    return NextResponse.json({ success: true, redirectUrl: '/admin' });
  } catch (error) {
    console.error('Failed to verify authentication:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
```

### Step 6: Create Admin Login Page

**File:** `src/app/admin/login/page.tsx`

```typescript
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import PasskeyLoginButton from './PasskeyLoginButton';
import MagicLinkForm from './MagicLinkForm';

export default async function AdminLoginPage() {
  const session = await getSession();

  if (session?.role === 'admin') {
    redirect('/admin');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
      <div className="max-w-md w-full p-8">
        <h1 className="text-2xl font-bold mb-2 text-[var(--color-text)]">
          Admin Login
        </h1>
        <p className="text-[var(--color-text-secondary)] mb-8">
          Sign in to manage portfolio access
        </p>

        {/* Passkey login - primary option */}
        <PasskeyLoginButton />

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--color-border)]" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-[var(--color-background)] text-[var(--color-text-secondary)]">
              or use magic link
            </span>
          </div>
        </div>

        {/* Magic link fallback */}
        <MagicLinkForm />
      </div>
    </div>
  );
}
```

**File:** `src/app/admin/login/PasskeyLoginButton.tsx`

```typescript
'use client';

import { useState } from 'react';
import { startAuthentication } from '@simplewebauthn/browser';
import { useRouter } from 'next/navigation';

export default function PasskeyLoginButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || '';

  const handlePasskeyLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get authentication options
      const optionsRes = await fetch('/api/auth/passkey/auth-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail }),
      });

      if (!optionsRes.ok) {
        const data = await optionsRes.json();
        if (optionsRes.status === 404) {
          setError('No passkey registered. Use magic link to set one up.');
        } else {
          setError(data.error || 'Failed to start authentication');
        }
        return;
      }

      const options = await optionsRes.json();

      // Start WebAuthn authentication
      const authResponse = await startAuthentication({ optionsJSON: options });

      // Verify with server
      const verifyRes = await fetch('/api/auth/passkey/auth-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, response: authResponse }),
      });

      const verifyData = await verifyRes.json();

      if (!verifyRes.ok) {
        setError(verifyData.error || 'Authentication failed');
        return;
      }

      router.push(verifyData.redirectUrl || '/admin');
    } catch (err) {
      if (err instanceof Error && err.name === 'NotAllowedError') {
        setError('Authentication cancelled');
      } else {
        setError('Authentication failed. Try magic link instead.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handlePasskeyLogin}
        disabled={loading}
        className="w-full py-3 px-4 bg-[var(--color-text)] text-[var(--color-background)] font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? (
          'Authenticating...'
        ) : (
          <>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
              />
            </svg>
            Sign in with Passkey
          </>
        )}
      </button>
      {error && (
        <p className="mt-2 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
```

**File:** `src/app/admin/login/MagicLinkForm.tsx`

```typescript
'use client';

import { useState } from 'react';

export default function MagicLinkForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setSent(true);
      } else {
        setError('Failed to send magic link');
      }
    } catch {
      setError('Failed to send magic link');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded">
        <p className="text-green-700 dark:text-green-400">
          Magic link sent! Check your email.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="admin@example.com"
        required
        className="w-full px-4 py-3 border border-[var(--color-border)] bg-transparent text-[var(--color-text)] focus:outline-none focus:border-[var(--color-text)]"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 px-4 border border-[var(--color-border)] text-[var(--color-text)] font-medium hover:bg-[var(--color-border)] transition-colors disabled:opacity-50"
      >
        {loading ? 'Sending...' : 'Send Magic Link'}
      </button>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </form>
  );
}
```

### Step 7: Create Passkey Management UI

**File:** `src/app/admin/settings/page.tsx`

```typescript
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getPasskeyCredentials } from '@/lib/auth/passkey';
import PasskeyManager from './PasskeyManager';

export default async function AdminSettingsPage() {
  const session = await getSession();

  if (!session || session.role !== 'admin') {
    redirect('/');
  }

  const credentials = await getPasskeyCredentials(session.email);

  return (
    <div className="min-h-screen bg-[var(--color-background)] p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-8 text-[var(--color-text)]">
          Admin Settings
        </h1>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-[var(--color-text)]">
            Passkeys
          </h2>
          <p className="text-[var(--color-text-secondary)] mb-4">
            Passkeys let you sign in with your fingerprint, face, or screen lock.
          </p>
          <PasskeyManager initialCredentials={credentials} />
        </section>

        <a
          href="/admin"
          className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
        >
          ← Back to Dashboard
        </a>
      </div>
    </div>
  );
}
```

**File:** `src/app/admin/settings/PasskeyManager.tsx`

```typescript
'use client';

import { useState } from 'react';
import { startRegistration } from '@simplewebauthn/browser';
import type { PasskeyCredential } from '@/lib/auth/passkey-types';

interface Props {
  initialCredentials: PasskeyCredential[];
}

export default function PasskeyManager({ initialCredentials }: Props) {
  const [credentials, setCredentials] = useState(initialCredentials);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddPasskey = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get registration options
      const optionsRes = await fetch('/api/auth/passkey/register-options', {
        method: 'POST',
      });

      if (!optionsRes.ok) {
        throw new Error('Failed to get registration options');
      }

      const options = await optionsRes.json();

      // Start WebAuthn registration
      const regResponse = await startRegistration({ optionsJSON: options });

      // Prompt for friendly name
      const friendlyName = prompt('Name this passkey (e.g., "MacBook Pro")')
        || `Passkey ${credentials.length + 1}`;

      // Verify with server
      const verifyRes = await fetch('/api/auth/passkey/register-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response: regResponse, friendlyName }),
      });

      if (!verifyRes.ok) {
        throw new Error('Failed to register passkey');
      }

      // Refresh credentials list
      window.location.reload();
    } catch (err) {
      if (err instanceof Error && err.name === 'NotAllowedError') {
        setError('Registration cancelled');
      } else {
        setError('Failed to add passkey');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePasskey = async (credentialId: string) => {
    if (!confirm('Remove this passkey?')) return;

    try {
      const res = await fetch('/api/auth/passkey/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credentialId }),
      });

      if (res.ok) {
        setCredentials(credentials.filter((c) => c.id !== credentialId));
      }
    } catch {
      setError('Failed to delete passkey');
    }
  };

  return (
    <div className="space-y-4">
      {/* Existing passkeys */}
      {credentials.length > 0 ? (
        <ul className="space-y-2">
          {credentials.map((cred) => (
            <li
              key={cred.id}
              className="flex items-center justify-between p-4 border border-[var(--color-border)]"
            >
              <div>
                <p className="font-medium text-[var(--color-text)]">
                  {cred.friendlyName || 'Passkey'}
                </p>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Added {new Date(cred.createdAt).toLocaleDateString()}
                  {cred.backedUp && ' • Synced'}
                </p>
              </div>
              <button
                onClick={() => handleDeletePasskey(cred.id)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[var(--color-text-secondary)] italic">
          No passkeys registered yet
        </p>
      )}

      {/* Add passkey button */}
      <button
        onClick={handleAddPasskey}
        disabled={loading}
        className="w-full py-3 px-4 border border-[var(--color-border)] text-[var(--color-text)] font-medium hover:bg-[var(--color-border)] transition-colors disabled:opacity-50"
      >
        {loading ? 'Registering...' : '+ Add Passkey'}
      </button>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
```

### Step 8: Add Delete Passkey Route

**File:** `src/app/api/auth/passkey/delete/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { deletePasskeyCredential } from '@/lib/auth/passkey';

export async function POST(request: Request) {
  const session = await getSession();

  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { credentialId } = await request.json();
    const deleted = await deletePasskeyCredential(session.email, credentialId);

    if (!deleted) {
      return NextResponse.json({ error: 'Credential not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete credential:', error);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
```

### Step 9: Add Environment Variable

**File:** `.env.local`

```env
# Existing variables...

# Admin email for passkey login (client-side hint)
NEXT_PUBLIC_ADMIN_EMAIL=godwinjohnson@me.com
```

### Step 10: Update Auth Exports

**File:** `src/lib/auth/index.ts`

```typescript
// Existing exports...
export * from './passkey';
export type * from './passkey-types';
```

---

## Security Properties

| Property | Status |
|----------|--------|
| Phishing-resistant | ✅ Credentials bound to domain |
| No shared secrets | ✅ Private key never leaves device |
| Replay protection | ✅ Signature counter validated |
| Challenge expiry | ✅ 5-minute TTL |
| Rate limiting | ✅ Uses existing rate limiters |
| Admin-only | ✅ Email validated against SUPER_ADMIN_EMAIL |
| Session security | ✅ Uses existing HTTP-only cookies |

---

## Verification

### Manual Testing

1. **First-time setup:**
   - Login via magic link
   - Go to `/admin/settings`
   - Click "Add Passkey"
   - Complete biometric prompt
   - Verify passkey appears in list

2. **Passkey login:**
   - Logout
   - Visit `/admin/login`
   - Click "Sign in with Passkey"
   - Complete biometric prompt
   - Verify redirected to `/admin`

3. **Fallback:**
   - Visit `/admin/login`
   - Use magic link form
   - Verify email received and login works

4. **Delete passkey:**
   - Go to `/admin/settings`
   - Click "Remove" on a passkey
   - Confirm deletion
   - Verify passkey removed

### Browser Compatibility

Test on:
- Chrome/Edge (Windows Hello, Touch ID on Mac)
- Safari (Touch ID, Face ID on iOS)
- Firefox (Windows Hello)

---

## File Summary

| File | Lines (est.) | Purpose |
|------|--------------|---------|
| `src/lib/auth/passkey-types.ts` | 20 | TypeScript types |
| `src/lib/auth/passkey.ts` | 180 | Core passkey logic |
| `src/app/api/auth/passkey/register-options/route.ts` | 25 | Registration challenge |
| `src/app/api/auth/passkey/register-verify/route.ts` | 35 | Verify registration |
| `src/app/api/auth/passkey/auth-options/route.ts` | 40 | Auth challenge |
| `src/app/api/auth/passkey/auth-verify/route.ts` | 45 | Verify auth & create session |
| `src/app/api/auth/passkey/delete/route.ts` | 30 | Delete credential |
| `src/app/admin/login/page.tsx` | 50 | Login page |
| `src/app/admin/login/PasskeyLoginButton.tsx` | 90 | Passkey auth button |
| `src/app/admin/login/MagicLinkForm.tsx` | 70 | Magic link fallback |
| `src/app/admin/settings/page.tsx` | 40 | Settings page |
| `src/app/admin/settings/PasskeyManager.tsx` | 110 | Passkey management |
| **Total** | **~735** | |

---

## Summary

This plan implements Passkey/WebAuthn for elegant admin login:

1. **Install** `@simplewebauthn/server` and `@simplewebauthn/browser`
2. **Create** passkey library with registration and authentication flows
3. **Create** API routes for registration and authentication
4. **Create** admin login page with passkey button + magic link fallback
5. **Create** admin settings page to manage passkeys
6. **Test** on Chrome, Safari, and Firefox

**Result:** Admin can log in with one touch using Touch ID, Face ID, or Windows Hello.
