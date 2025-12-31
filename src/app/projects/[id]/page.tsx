import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { projects } from "@/data/projects";

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return projects.map((project) => ({
    id: project.id,
  }));
}

export async function generateMetadata({ params }: ProjectPageProps) {
  const { id } = await params;
  const project = projects.find((p) => p.id === id);

  if (!project) {
    return { title: "Project Not Found" };
  }

  const title = project.subtitle
    ? `${project.title} (${project.subtitle})`
    : project.title;

  return {
    title: `${title} | Godwin Johnson`,
    description: project.description,
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;
  const project = projects.find((p) => p.id === id);

  if (!project) {
    notFound();
  }

  const displayTitle = project.subtitle
    ? `${project.title} (${project.subtitle})`
    : project.title;

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="max-w-4xl mx-auto px-6 py-24">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-8"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Work
        </Link>

        {/* Hero Image */}
        <div className="relative aspect-video md:aspect-[16/9] overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-900 mb-12">
          <Image
            src={project.thumbnail}
            alt={displayTitle}
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Project Header */}
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {displayTitle}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
            {project.description}
          </p>

          {/* Skills */}
          <div className="flex flex-wrap gap-2 mb-6">
            {project.skills.map((skill) => (
              <span
                key={skill}
                className="text-sm text-gray-500 dark:text-gray-400"
              >
                • {skill}
              </span>
            ))}
          </div>

          {/* Confidential Notice */}
          {project.confidential && (
            <p className="text-sm text-gray-400 dark:text-gray-500 italic">
              Note: Confidential content - Do not share
            </p>
          )}
        </header>

        {/* Project Meta */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 pb-12 border-b border-gray-200 dark:border-gray-800">
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Role</h3>
            <p className="text-gray-900 dark:text-white">{project.role}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Date</h3>
            <p className="text-gray-900 dark:text-white">
              {project.month ? `${project.month} ${project.year}` : project.year}
            </p>
          </div>
          {project.results && (
            <div className="col-span-2">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Results</h3>
              <p className="text-gray-900 dark:text-white font-medium">{project.results}</p>
            </div>
          )}
        </div>

        {/* Case Study Sections */}
        <div className="space-y-12">
          {project.sections.map((section, index) => (
            <section key={index}>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {section.title}
              </h2>
              <div className="prose prose-gray dark:prose-invert max-w-none">
                {section.content.split('\n\n').map((paragraph, pIndex) => {
                  // Check if paragraph contains markdown-style bold text
                  const parts = paragraph.split(/(\*\*[^*]+\*\*)/g);

                  // Check if it's a list item
                  if (paragraph.trim().startsWith('•') || paragraph.trim().startsWith('-') || paragraph.trim().match(/^\d+\./)) {
                    const listItems = paragraph.split('\n').filter(item => item.trim());
                    return (
                      <ul key={pIndex} className="list-none space-y-2 mb-4">
                        {listItems.map((item, liIndex) => (
                          <li key={liIndex} className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            {item.split(/(\*\*[^*]+\*\*)/).map((part, partIndex) => {
                              if (part.startsWith('**') && part.endsWith('**')) {
                                return <strong key={partIndex} className="text-gray-900 dark:text-white">{part.slice(2, -2)}</strong>;
                              }
                              return part;
                            })}
                          </li>
                        ))}
                      </ul>
                    );
                  }

                  return (
                    <p key={pIndex} className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                      {parts.map((part, partIndex) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                          return <strong key={partIndex} className="text-gray-900 dark:text-white">{part.slice(2, -2)}</strong>;
                        }
                        return part;
                      })}
                    </p>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        {/* Navigation to other projects */}
        <div className="mt-16 pt-12 border-t border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
            More of my work…
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {projects
              .filter((p) => p.id !== project.id)
              .slice(0, 4)
              .map((p) => (
                <Link
                  key={p.id}
                  href={`/projects/${p.id}`}
                  className="group block"
                >
                  <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-900 mb-2">
                    <Image
                      src={p.thumbnail}
                      alt={`${p.title} ${p.subtitle || ""}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                    {p.title}
                    {p.subtitle && (
                      <span className="font-normal text-gray-500 dark:text-gray-400">
                        {" "}({p.subtitle})
                      </span>
                    )}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {p.month ? `${p.month}, ${p.year}` : p.year}
                  </p>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
