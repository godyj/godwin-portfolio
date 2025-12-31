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

  // Handle hash navigation (e.g., from /#projects link on other pages)
  useEffect(() => {
    if (window.location.hash === "#projects") {
      // Small delay to ensure DOM is ready after navigation
      setTimeout(() => {
        document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, []);

  // Calculate opacity based on scroll (fade out over first 400px of scroll)
  const heroOpacity = Math.max(0, 1 - scrollY / 400);

  return (
    <div className="bg-white dark:bg-background-page">
      {/* Hero Section - Fixed background */}
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
          <span className="text-base md:text-lg text-brand-brown uppercase px-5 py-2 rounded-full transition-all duration-200 hover:bg-brand-brown/10">Scroll</span>
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

      {/* Spacer for fixed hero */}
      <div className="h-screen" />

      {/* Projects Grid - Slides over hero */}
      <div id="projects" className="relative z-10 bg-white dark:bg-background-page rounded-t-3xl -mt-8 shadow-2xl scroll-mt-20">
        <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="group block"
            >
              <article>
                {/* Thumbnail with hover overlay */}
                <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100 dark:bg-background-card">
                  <div className="absolute inset-0 transition-transform duration-700 ease-in-out group-hover:scale-110">
                    <Image
                      src={project.thumbnail}
                      alt={`${project.title} ${project.subtitle || ""}`}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Half overlay - slides up from bottom on hover */}
                  <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/70 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
                    <div className="absolute bottom-0 inset-x-0 p-6 text-white">
                      <h2 className="text-lg font-bold mb-1">
                        {project.title}
                        {project.subtitle && (
                          <span className="font-normal text-white/80">
                            {" "}({project.subtitle})
                          </span>
                        )}
                      </h2>
                      <p className="text-sm text-white/60 mb-3">
                        {project.month && `${project.month}, `}{project.year}
                      </p>
                      <p className="text-sm text-white/80 mb-3 line-clamp-3">
                        {project.description}
                      </p>
                      <div className="text-sm text-white/60">
                        {project.skills.map((skill, i) => (
                          <span key={skill}>
                            {skill}{i < project.skills.length - 1 ? " • " : ""}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
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
