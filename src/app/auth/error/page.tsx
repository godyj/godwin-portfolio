'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

const errorMessages: Record<string, { title: string; message: string }> = {
  invalid_token: {
    title: 'Invalid or Expired Link',
    message:
      'This magic link has expired or has already been used. Please request a new one.',
  },
  rate_limited: {
    title: 'Too Many Attempts',
    message: 'Please wait a moment before trying again.',
  },
  default: {
    title: 'Authentication Error',
    message: 'Something went wrong. Please try again.',
  },
};

function ErrorContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason') || 'default';
  const error = errorMessages[reason] || errorMessages.default;

  return (
    <div className="min-h-screen bg-white dark:bg-background-page flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-red-600 dark:text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-3">
          {error.title}
        </h1>
        <p className="text-stone-600 dark:text-stone-400 mb-8">
          {error.message}
        </p>
        <Link
          href="/"
          className="inline-block bg-brand-yellow text-brand-brown-dark px-6 py-3 font-medium hover:opacity-90 transition-opacity"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white dark:bg-background-page flex items-center justify-center">
          <div className="animate-pulse text-stone-400">Loading...</div>
        </div>
      }
    >
      <ErrorContent />
    </Suspense>
  );
}
