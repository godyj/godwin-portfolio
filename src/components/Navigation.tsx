"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const navLinks = [
  { href: "/#projects", label: "Work", locked: false },
  { href: "/about", label: "About", locked: false },
  { href: "/resume", label: "Résumé", locked: true },
  { href: "/contact", label: "Contact", locked: false },
];

// Small lock icon for nav
function NavLockIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={`w-3.5 h-3.5 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      />
    </svg>
  );
}

export default function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hasProjectsHash, setHasProjectsHash] = useState(false);
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number; visible: boolean }>({ left: 0, width: 0, visible: false });
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);

  const isHomePage = pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      // Clear hash state once we've scrolled (nav is now solid due to scroll)
      if (window.scrollY > 50) {
        setHasProjectsHash(false);
      }
    };

    // Check for #projects hash to keep nav solid during transition
    const hash = window.location.hash;
    if (hash === "#projects") {
      setHasProjectsHash(true);
    }

    // When navigating to home page WITHOUT a hash, scroll to top for true welcome state
    // If there's a hash (like #projects from Work link), let the page handle the scroll
    if (pathname === "/" && !hash) {
      window.scrollTo(0, 0);
      setScrolled(false);
      setHasProjectsHash(false);
    }

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check initial scroll position

    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]); // Re-run when pathname changes to reset scroll state

  // Update indicator position based on hover or active state
  useEffect(() => {
    // Prioritize hovered link, fall back to active link
    const selector = hoveredHref
      ? `[data-nav-href="${hoveredHref}"]`
      : '[data-nav-active="true"]';
    const targetLink = document.querySelector(selector) as HTMLElement;

    if (targetLink) {
      const rect = targetLink.getBoundingClientRect();
      setIndicatorStyle({ left: rect.left, width: rect.width, visible: true });
    } else {
      // Keep position, just hide - this prevents horizontal animation
      setIndicatorStyle(prev => ({ ...prev, visible: false }));
    }
  }, [pathname, scrolled, hoveredHref]); // Re-run when scroll state or hover changes

  // Transparent on home hero, solid elsewhere or after scroll
  // Also solid when navigating to #projects (prevents flash during transition)
  const showSolidBg = !isHomePage || scrolled || mobileMenuOpen || hasProjectsHash;

  // On hero: use dark text color for better contrast on yellow
  const heroTextColor = "text-brand-brown";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        showSolidBg
          ? "bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800"
          : "bg-black/5 border-b border-transparent"
      }`}
    >
      {/* Nav indicator bar at top edge - shows on hover or active */}
      <span
        className={`absolute top-0 h-[3px] transition-all duration-200 hidden md:block ${
          showSolidBg ? "bg-brand-yellow" : "bg-brand-brown/50"
        } ${indicatorStyle.visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full"}`}
        style={{
          left: indicatorStyle.left,
          width: indicatorStyle.width,
        }}
      />
      <nav className="max-w-6xl mx-auto px-6 h-[70px] flex items-center">
        <div className="flex items-center justify-between w-full">
          <Link
            href="/"
            className="hover:opacity-80 transition-opacity"
            onClick={(e) => {
              // When already on home, scroll to top (true welcome state)
              if (pathname === "/") {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
          >
            <Image
              src="/images/logo.png"
              alt="Godwin"
              width={40}
              height={40}
              className="rounded-md"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              // Work link is only active when on home page AND scrolled past hero
              const isActive = link.href === "/#projects"
                ? pathname === "/" && scrolled
                : pathname === link.href;

              // Work link needs special scroll handling
              const isWorkLink = link.href === "/#projects";

              const isHovered = hoveredHref === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  scroll={!isWorkLink} // Allow scroll for Work link to handle anchor
                  data-nav-active={isActive ? "true" : "false"}
                  data-nav-href={link.href}
                  onMouseEnter={() => setHoveredHref(link.href)}
                  onMouseLeave={() => setHoveredHref(null)}
                  onClick={(e) => {
                    // Smooth scroll only when already on home page
                    if (isWorkLink && pathname === "/") {
                      e.preventDefault();
                      document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                  className={`text-[17.5px] font-medium transition-colors flex items-center ${
                    showSolidBg
                      ? isActive
                        ? "text-gray-900 dark:text-white"
                        : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                      : isActive
                        ? heroTextColor
                        : `${heroTextColor} opacity-70 hover:opacity-100`
                  }`}
                >
                  {link.label}
                  {/* Lock icon for locked items - always takes up space, visible on hover */}
                  {link.locked && (
                    <span className={`ml-1.5 transition-opacity duration-150 ${isHovered ? 'opacity-70' : 'opacity-0'}`}>
                      <NavLockIcon />
                    </span>
                  )}
                </Link>
              );
            })}
            <a
              href="https://www.linkedin.com/in/godwinjohnson/"
              target="_blank"
              rel="noopener noreferrer"
              className={`transition-colors ${
                showSolidBg
                  ? "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  : `${heroTextColor} opacity-70 hover:opacity-100`
              }`}
              aria-label="LinkedIn"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className={`md:hidden p-2 ${showSolidBg ? "text-gray-900 dark:text-white" : heroTextColor}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-100 dark:border-gray-800 pt-4">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => {
                // Work link is only active when on home page AND scrolled past hero
                const isActive = link.href === "/#projects"
                  ? pathname === "/" && scrolled
                  : pathname === link.href;
                const isWorkLink = link.href === "/#projects";

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    scroll={!isWorkLink}
                    onClick={(e) => {
                      setMobileMenuOpen(false);
                      if (isWorkLink && pathname === "/") {
                        e.preventDefault();
                        document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" });
                      }
                    }}
                    className={`text-[17.5px] font-medium transition-colors flex items-center ${
                      isActive
                        ? "text-gray-900 dark:text-white"
                        : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    }`}
                  >
                    {link.label}
                    {link.locked && (
                      <span className="ml-1.5 opacity-50">
                        <NavLockIcon />
                      </span>
                    )}
                  </Link>
                );
              })}
              <a
                href="https://www.linkedin.com/in/godwinjohnson/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[17.5px] font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                LinkedIn
              </a>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
