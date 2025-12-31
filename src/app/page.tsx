import Link from "next/link";
import Image from "next/image";
import { projects } from "@/data/projects";

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Hero Section - Yellow background like original */}
      <div className="bg-[#F5B800] dark:bg-[#F5B800] min-h-[70vh] flex flex-col items-center justify-center text-center px-6 pt-16">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
          Hello, I&apos;m GODWIN
        </h1>
        <p className="text-lg text-gray-700 mb-8">
          Scroll down to see my work
        </p>
        <svg
          className="w-8 h-8 text-gray-700 animate-bounce"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>

      {/* Projects Grid */}
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
  );
}
