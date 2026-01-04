import { Suspense } from "react";
import ProjectGrid from "@/components/ProjectGrid";
import HomeHero from "@/components/HomeHero";
import ProjectsSection from "@/components/ProjectsSection";

// Loading skeleton for project grid
function ProjectGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="aspect-square rounded-lg bg-gray-200 dark:bg-stone-800 animate-pulse" />
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <div className="bg-white dark:bg-background-page">
      {/* Hero Section - Fixed background (client component) */}
      <HomeHero />

      {/* Spacer for fixed hero */}
      <div className="h-screen" />

      {/* Projects Grid - Slides over hero with fade-in animation */}
      <ProjectsSection>
        <Suspense fallback={<ProjectGridSkeleton />}>
          <ProjectGrid />
        </Suspense>
      </ProjectsSection>
    </div>
  );
}
