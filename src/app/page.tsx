"use client";

import Link from "next/link";
import Image from "next/image";
import { projects } from "@/data/projects";
import { useEffect, useState } from "react";

export default function Home() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Calculate opacity based on scroll (fade out over first 400px of scroll)
  const heroOpacity = Math.max(0, 1 - scrollY / 400);

  return (
    <div className="bg-white dark:bg-black">
      {/* Hero Section - Fixed background */}
      <section className="fixed inset-0 h-screen bg-[#F5B800] flex flex-col items-center justify-center text-center px-6 z-0">
        <div style={{ opacity: heroOpacity }} className="transition-opacity duration-100">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-gray-900 mb-6">
            Hello, I&apos;m Godwin
          </h1>
          <p className="text-xl md:text-2xl text-gray-800 max-w-xl">
            Product Designer crafting thoughtful digital experiences
          </p>
        </div>

        {/* Scroll indicator */}
        <div
          style={{ opacity: heroOpacity }}
          className="absolute bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 transition-opacity duration-100"
        >
          <span className="text-sm text-gray-700 uppercase tracking-widest">Scroll</span>
          <svg
            className="w-6 h-6 text-gray-800 animate-bounce"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Spacer for fixed hero */}
      <div className="h-screen" />

      {/* Projects Grid - Slides over hero */}
      <div className="relative z-10 bg-white dark:bg-black rounded-t-3xl -mt-8 shadow-2xl">
        <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="group block"
            >
              <article className="space-y-4">
                {/* Thumbnail */}
                <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-900">
                  <Image
                    src={project.thumbnail}
                    alt={`${project.title} ${project.subtitle || ""}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                </div>

                {/* Project Info */}
                <div className="text-center space-y-1">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                    {project.title}
                    {project.subtitle && (
                      <span className="text-gray-500 dark:text-gray-400">
                        {" "}({project.subtitle})
                      </span>
                    )}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {project.month && `${project.month}, `}{project.year}
                  </p>
                </div>
              </article>
            </Link>
          ))}
        </div>
        </div>
      </div>
    </div>
  );
}
