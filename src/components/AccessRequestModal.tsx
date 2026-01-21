'use client';

import { useState } from 'react';

interface AccessRequestModalProps {
  projectId: string;
  projectTitle: string;
  onClose: () => void;
}

export default function AccessRequestModal({
  projectId,
  projectTitle,
  onClose,
}: AccessRequestModalProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>(
    'idle'
  );
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/auth/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, projectId }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || 'Something went wrong');
        setStatus('error');
        return;
      }

      setStatus('success');
    } catch {
      setErrorMessage('Failed to send request. Please try again.');
      setStatus('error');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-stone-900 rounded-lg shadow-xl max-w-md w-full p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {status === 'success' ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-green-600 dark:text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-2">
              Request Sent
            </h3>
            <p className="text-stone-600 dark:text-stone-400 mb-6">
              If your email is approved, you&apos;ll receive a link to access the portfolio.
            </p>
            <button
              onClick={onClose}
              className="bg-stone-200 dark:bg-stone-700 text-stone-900 dark:text-stone-100 px-6 py-2 font-medium hover:opacity-80 transition-opacity"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-2">
              Request Access
            </h2>
            <p className="text-stone-600 dark:text-stone-400 mb-6">
              Enter your email to request access to <strong>{projectTitle}</strong>.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2"
                >
                  Email address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-transparent"
                />
              </div>

              {status === 'error' && (
                <p className="text-red-600 dark:text-red-400 text-sm mb-4">
                  {errorMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-brand-yellow text-brand-brown-dark px-6 py-3 font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? 'Sending...' : 'Request Access'}
              </button>
            </form>

            <p className="text-xs text-stone-500 dark:text-stone-500 mt-4 text-center">
              Your request will be reviewed by the portfolio owner.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
