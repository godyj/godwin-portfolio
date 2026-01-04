import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import {
  verifyRatelimit,
  validateToken,
  verifyMagicLink,
  createSession,
} from '@/lib/auth';

export async function GET(request: Request) {
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for') ?? 'anonymous';
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || '';

  // SECURITY: Rate limiting - 10 requests per minute per IP
  const { success: rateLimitOk } = await verifyRatelimit.limit(ip);
  if (!rateLimitOk) {
    return NextResponse.redirect(`${baseUrl}/auth/error?reason=rate_limited`);
  }

  const { searchParams } = new URL(request.url);
  const rawToken = searchParams.get('token');

  // SECURITY: Validate token format before checking Redis
  const validation = validateToken(rawToken);
  if (!validation.success) {
    return NextResponse.redirect(`${baseUrl}/auth/error?reason=invalid_token`);
  }

  // Verify token exists and is valid
  const token = await verifyMagicLink(validation.token);
  if (!token) {
    return NextResponse.redirect(`${baseUrl}/auth/error?reason=invalid_token`);
  }

  // Create session
  await createSession(token.email, token.type);

  // Redirect based on role
  const redirectUrl = token.type === 'admin' ? '/admin' : '/';
  return NextResponse.redirect(`${baseUrl}${redirectUrl}`);
}
