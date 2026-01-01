import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { projects } from "@/data/projects";
import ProjectContent from "@/components/ProjectContent";

// Common style classes (single source of truth)
// Dark theme uses warm brown tones (stone palette) instead of gray
const styles = {
  heading: "text-gray-900 dark:text-stone-100",
  body: "text-gray-600 dark:text-stone-400",
  muted: "text-gray-500 dark:text-stone-500",
  caption: "text-sm text-gray-500 dark:text-stone-500 text-center",
} as const;


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
    <div className="min-h-screen bg-white dark:bg-background-page pt-[70px]">
      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Content-First Layout */}
        {project.layout === 'content-first' && (
          <header className={`text-center text-lg ${styles.body} mb-16`}>
            <h1 className={`text-5xl md:text-6xl font-bold ${styles.heading} mb-6`}>
              {project.title}
            </h1>
            <p className="leading-normal mb-3">{project.description}</p>
            <div className={`flex flex-wrap justify-center gap-1 ${styles.muted}`}>
              {project.skills.map((skill, index) => (
                <span key={skill}>• {skill}{index < project.skills.length - 1 ? ' ' : ' •'}</span>
              ))}
            </div>
          </header>
        )}

        {/* Default Layout: Hero + Header + Meta */}
        {project.layout !== 'content-first' && (
          <>
            {/* Hero Image */}
            <div className="relative aspect-video md:aspect-[16/9] overflow-hidden mb-12">
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
              <h1 className={`text-4xl md:text-5xl font-bold ${styles.heading} mb-4`}>
                {displayTitle}
              </h1>
              <p className={`text-lg ${styles.body} leading-normal mb-6`}>
                {project.description}
              </p>
              <div className={`flex flex-wrap gap-2 mb-6 text-sm ${styles.muted}`}>
                {project.skills.map((skill) => (
                  <span key={skill}>• {skill}</span>
                ))}
              </div>
              {project.confidential && (
                <p className={`text-sm ${styles.muted} italic`}>
                  Note: Confidential content - Do not share
                </p>
              )}
            </header>

            {/* Project Meta */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 pb-12 border-b border-gray-200 dark:border-stone-800">
              <div>
                <h3 className={`text-sm font-medium ${styles.muted} mb-1`}>Role</h3>
                <p className={styles.heading}>{project.role}</p>
              </div>
              <div>
                <h3 className={`text-sm font-medium ${styles.muted} mb-1`}>Date</h3>
                <p className={styles.heading}>
                  {project.month ? `${project.month} ${project.year}` : project.year}
                </p>
              </div>
              {project.results && (
                <div className="col-span-2">
                  <h3 className={`text-sm font-medium ${styles.muted} mb-1`}>Results</h3>
                  <p className={`${styles.heading} font-medium`}>{project.results}</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Case Study Sections */}
        <ProjectContent sections={project.sections} />

        {/* Navigation to other projects */}
        <div className="mt-16 pt-12 border-t border-gray-200 dark:border-stone-800">
          <h3 className={`text-lg font-medium ${styles.heading} mb-6`}>More of my work…</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {projects
              .filter((p) => p.id !== project.id)
              .slice(0, 4)
              .map((p) => (
                <Link key={p.id} href={`/projects/${p.id}`} className="group block">
                  <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100 dark:bg-stone-900 mb-2">
                    <Image
                      src={p.thumbnail}
                      alt={`${p.title} ${p.subtitle || ""}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h4 className={`text-sm font-medium ${styles.heading} group-hover:text-gray-600 dark:group-hover:text-stone-300 transition-colors`}>
                    {p.title}
                    {p.subtitle && <span className={`font-normal ${styles.muted}`}> ({p.subtitle})</span>}
                  </h4>
                  <p className={`text-xs ${styles.muted}`}>{p.month ? `${p.month}, ${p.year}` : p.year}</p>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
