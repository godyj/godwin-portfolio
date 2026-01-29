"use client";

import { useEffect, useState, useRef, useCallback } from "react";

interface ProjectsSectionProps {
  children: React.ReactNode;
}

export default function ProjectsSection({ children }: ProjectsSectionProps) {
  const [mounted, setMounted] = useState(false);
  const [hiddenCount, setHiddenCount] = useState(0);
  const [displayCount, setDisplayCount] = useState(0); // Keeps last non-zero count for fade-out
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Small delay to ensure smooth animation after navigation
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Calculate how many cards are 90%+ hidden below the viewport
  const calculateHiddenCards = useCallback(() => {
    if (!containerRef.current) return;

    const cards = containerRef.current.querySelectorAll('[data-project-card]');
    const viewportHeight = window.innerHeight;
    const cardsArray = Array.from(cards);

    // Check if we're meaningfully within the projects section (not just peeking)
    const containerRect = containerRef.current.getBoundingClientRect();
    const inProjectsSection = containerRect.bottom > 0 && containerRect.top < viewportHeight * 0.8;

    // Only show indicator when in projects section
    if (!inProjectsSection) {
      setHiddenCount(0);
      return;
    }

    let hidden = 0;
    cardsArray.forEach((card) => {
      const rect = card.getBoundingClientRect();
      // Card is "below" if its top is near the bottom of viewport or beyond
      if (rect.top > viewportHeight * 0.85) {
        hidden++;
      }
    });

    setHiddenCount(hidden);
  }, []);

  useEffect(() => {
    calculateHiddenCards();
    window.addEventListener('scroll', calculateHiddenCards);
    window.addEventListener('resize', calculateHiddenCards);

    return () => {
      window.removeEventListener('scroll', calculateHiddenCards);
      window.removeEventListener('resize', calculateHiddenCards);
    };
  }, [calculateHiddenCards]);

  // Update display count only when hiddenCount is positive
  // This prevents showing "0 more below" during fade-out
  useEffect(() => {
    if (hiddenCount > 0) {
      setDisplayCount(hiddenCount);
    }
  }, [hiddenCount]);

  return (
    <div
      id="projects"
      ref={containerRef}
      className="relative z-10 bg-white dark:bg-background-page rounded-t-3xl -mt-[42px] shadow-2xl scroll-mt-20"
    >
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div
          className={`transition-all duration-500 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          {children}
        </div>
      </div>

      {/* "X more below" indicator */}
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-opacity duration-300 ease-in ${
          hiddenCount > 0 ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <button
          onClick={() => {
            // Scroll to reveal all cards - scroll to bottom of the projects section
            if (containerRef.current) {
              const sectionBottom = containerRef.current.getBoundingClientRect().bottom + window.scrollY;
              window.scrollTo({ top: sectionBottom - window.innerHeight + 100, behavior: "smooth" });
            }
          }}
          className="bg-white dark:bg-background-page text-gray-500 dark:text-gray-400 text-sm font-medium px-4 py-2 rounded-full shadow-lg ring-1 ring-brand-yellow/20 cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
        >
          {displayCount} more below
        </button>
      </div>
    </div>
  );
}
