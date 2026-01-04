"use client";

import { useEffect, useState } from "react";

export default function HomeHero() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle hash navigation (e.g., from /#projects link on other pages)
  // Use instant scroll (no animation) when coming from another page
  useEffect(() => {
    if (window.location.hash === "#projects") {
      // Instant scroll - skip animation when navigating from other pages
      document.getElementById("projects")?.scrollIntoView({ behavior: "instant" });
    }
  }, []);

  // Calculate opacity based on scroll (fade out over first 400px of scroll)
  const heroOpacity = Math.max(0, 1 - scrollY / 400);

  return (
    <section className="fixed inset-0 h-screen bg-brand-yellow flex flex-col items-center justify-center text-center px-6 z-0">
      <div style={{ opacity: heroOpacity }} className="transition-opacity duration-100">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-brand-brown mb-6">
          Hello, I&apos;m Godwin
        </h1>
        <p className="text-xl md:text-2xl text-brand-brown max-w-xl">
          Product Designer crafting thoughtful digital experiences
        </p>
      </div>

      {/* Scroll indicator */}
      <button
        style={{ opacity: heroOpacity }}
        onClick={() => document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })}
        className="absolute bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer"
      >
        <span className="text-base md:text-lg text-brand-brown uppercase px-5 py-2 rounded-full transition-all duration-200 hover:bg-brand-brown/10">
          Scroll
        </span>
        <svg
          className="w-6 h-6 text-brand-brown animate-bounce"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </section>
  );
}
