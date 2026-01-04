'use client';

import { useState } from 'react';
import AccessRequestModal from './AccessRequestModal';

interface ProtectedProjectProps {
  projectTitle: string;
  projectSubtitle?: string;
  hasAccess: boolean;
  children: React.ReactNode;
}

export default function ProtectedProject({
  projectTitle,
  projectSubtitle,
  hasAccess,
  children,
}: ProtectedProjectProps) {
  const [showModal, setShowModal] = useState(false);

  // If user has access, show the content
  if (hasAccess) {
    return <>{children}</>;
  }

  // Otherwise show the access request UI
  return (
    <>
      <div className="min-h-screen bg-white dark:bg-background-page pt-[70px]">
        <div className="max-w-3xl mx-auto px-6 py-16">
          <div className="text-center py-20">
            {/* Lock icon */}
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
              <svg
                className="w-10 h-10 text-stone-400 dark:text-stone-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-stone-900 dark:text-stone-100 mb-2">
              {projectTitle}
            </h1>
            {projectSubtitle && (
              <p className="text-lg text-stone-500 dark:text-stone-400 mb-6">
                {projectSubtitle}
              </p>
            )}

            <p className="text-stone-600 dark:text-stone-400 mb-8 max-w-md mx-auto">
              This case study contains confidential work. Request access to view the full project details.
            </p>

            <button
              onClick={() => setShowModal(true)}
              className="bg-brand-yellow text-brand-brown-dark px-8 py-3 font-medium hover:opacity-90 transition-opacity"
            >
              Request Access
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <AccessRequestModal
          projectTitle={projectTitle}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
