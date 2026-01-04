import { NextResponse } from 'next/server';
import { destroySession } from '@/lib/auth';

export async function POST() {
  await destroySession();

  return NextResponse.json({ success: true });
}

// Also support GET for convenience (clicking a logout link)
export async function GET() {
  await destroySession();

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
  return NextResponse.redirect(`${baseUrl}/`);
}
