import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { projects, ContentBlock } from "@/data/projects";

// Helper to render text content with paragraphs
function renderTextContent(content: string) {
  return content.split('\n\n').map((paragraph, pIndex) => {
    const parts = paragraph.split(/(\*\*[^*]+\*\*)/g);

    // Check if it's a list item
    if (paragraph.trim().startsWith('•') || paragraph.trim().startsWith('-') || paragraph.trim().match(/^\d+\./)) {
      const listItems = paragraph.split('\n').filter(item => item.trim());
      return (
        <ul key={pIndex} className="list-none space-y-2 mb-5">
          {listItems.map((item, liIndex) => (
            <li key={liIndex} className="text-gray-600 dark:text-gray-400 leading-normal">
              {item.split(/(\*\*[^*]+\*\*)/).map((part, partIndex) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return <strong key={partIndex} className="font-bold text-gray-900 dark:text-white">{part.slice(2, -2)}</strong>;
                }
                return part;
              })}
            </li>
          ))}
        </ul>
      );
    }

    return (
      <p key={pIndex} className="text-gray-600 dark:text-gray-400 leading-normal mb-5">
        {parts.map((part, partIndex) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={partIndex} className="font-bold text-gray-900 dark:text-white">{part.slice(2, -2)}</strong>;
          }
          return part;
        })}
      </p>
    );
  });
}

// Helper to render a single image with caption
function renderImage(src: string, alt: string, key?: number, maxWidth?: number) {
  return (
    <figure
      key={key}
      className="mt-2.5 mb-5 mx-auto"
      style={maxWidth ? { maxWidth: `${maxWidth}px` } : undefined}
    >
      <div className="overflow-hidden">
        <Image
          src={src}
          alt={alt}
          width={800}
          height={600}
          className="w-full h-auto object-contain"
        />
      </div>
      <figcaption className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
        {alt}
      </figcaption>
    </figure>
  );
}

// Helper to render multiple images in a grid
function renderImageGrid(items: Array<{ src: string; alt: string }>, maxWidth?: number) {
  return (
    <div
      className={`mb-10 mx-auto grid gap-4 ${
        items.length === 2
          ? 'grid-cols-2'
          : items.length >= 5
            ? 'grid-cols-5'
            : items.length >= 3
              ? 'grid-cols-3'
              : 'grid-cols-1'
      }`}
      style={maxWidth ? { maxWidth: `${maxWidth}px` } : undefined}
    >
      {items.map((image, imgIndex) => (
        <figure key={imgIndex}>
          <div className="overflow-hidden">
            <Image
              src={image.src}
              alt={image.alt}
              width={800}
              height={600}
              className="w-full h-auto object-contain"
            />
          </div>
        </figure>
      ))}
    </div>
  );
}

// Helper to render a video with caption
function renderVideo(src: string, caption?: string, key?: number, maxWidth?: number) {
  return (
    <figure
      key={key}
      className="mt-2.5 mb-5 mx-auto"
      style={maxWidth ? { maxWidth: `${maxWidth}px` } : undefined}
    >
      <div className="overflow-hidden">
        <video
          src={src}
          controls
          playsInline
          className="w-full h-auto"
        >
          Your browser does not support the video tag.
        </video>
      </div>
      {caption && (
        <figcaption className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

// Helper to render a notice (confidential, etc.)
function renderNotice(content: string, color: 'red' | 'gray' = 'gray', key?: number) {
  const colorClass = color === 'red'
    ? 'text-[#e01414]'  // Original portfolio red
    : 'text-gray-400 dark:text-gray-500';

  return (
    <p key={key} className={`text-center text-2xl font-medium mb-5 ${colorClass}`}>
      {content}
    </p>
  );
}

// Helper to render content blocks
function renderBlocks(blocks: ContentBlock[]) {
  return blocks.map((block, blockIndex) => {
    if (block.type === 'text') {
      const textClass = block.centered ? 'text-center' : '';
      const sizeClass = block.size === 'large' ? 'text-2xl font-medium' : '';
      return (
        <div key={blockIndex} className={`${textClass} ${sizeClass}`.trim()}>
          {renderTextContent(block.content)}
        </div>
      );
    }
    if (block.type === 'image') {
      return renderImage(block.src, block.alt, blockIndex, block.maxWidth);
    }
    if (block.type === 'images') {
      return <div key={blockIndex}>{renderImageGrid(block.items, block.maxWidth)}</div>;
    }
    if (block.type === 'video') {
      return renderVideo(block.src, block.caption, blockIndex, block.maxWidth);
    }
    if (block.type === 'notice') {
      return renderNotice(block.content, block.color, blockIndex);
    }
    return null;
  });
}

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

        {/* Content-First Layout: Centered header without hero image */}
        {project.layout === 'content-first' && (
          <header className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              {project.title}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 leading-normal mb-4">
              {project.description}
            </p>
            {/* Skills - centered with bullets */}
            <div className="flex flex-wrap justify-center gap-1 text-sm text-gray-500 dark:text-gray-400">
              {project.skills.map((skill, index) => (
                <span key={skill}>
                  • {skill}{index < project.skills.length - 1 ? ' ' : ' •'}
                </span>
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
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                {displayTitle}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 leading-normal mb-6">
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
          </>
        )}

        {/* Case Study Sections */}
        <div className="space-y-12">
          {project.sections.map((section, index) => (
            <section key={index}>
              {/* Section title (optional for blocks-based sections) */}
              {section.title && (
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {section.title}
                </h2>
              )}

              {/* Render blocks if present (new format) */}
              {section.blocks ? (
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  {renderBlocks(section.blocks)}
                </div>
              ) : (
                /* Legacy format: content + images at end */
                <>
                  {section.content && (
                    <div className="prose prose-gray dark:prose-invert max-w-none">
                      {renderTextContent(section.content)}
                    </div>
                  )}
                  {section.images && section.images.length > 0 && (
                    renderImageGrid(section.images)
                  )}
                </>
              )}
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
