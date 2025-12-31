import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { projects, ContentBlock } from "@/data/projects";

// Common style classes (single source of truth)
// Dark theme uses warm brown tones (stone palette) instead of gray
const styles = {
  heading: "text-gray-900 dark:text-stone-100",
  body: "text-gray-600 dark:text-stone-400",
  muted: "text-gray-500 dark:text-stone-500",
  caption: "text-sm text-gray-500 dark:text-stone-500 text-center",
} as const;

// Get grid columns based on item count
const getGridCols = (count: number) => {
  if (count === 2) return 'grid-cols-2';
  if (count >= 5) return 'grid-cols-5';
  if (count >= 3) return 'grid-cols-3';
  return 'grid-cols-1';
};

// Helper to render inline formatting (bold **text** and underline _text_)
function renderInlineFormatting(text: string, keyPrefix: string = '') {
  const parts = text.split(/(\*\*[^*]+\*\*|_[^_]+_)/g);
  return parts.map((part, partIndex) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={`${keyPrefix}-${partIndex}`} className={`font-bold ${styles.heading}`}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('_') && part.endsWith('_') && part.length > 2) {
      return <span key={`${keyPrefix}-${partIndex}`} className="underline">{part.slice(1, -1)}</span>;
    }
    return part;
  });
}

// Helper to render text content with paragraphs (inherits text-lg from parent)
function renderTextContent(content: string) {
  return content.split('\n\n').map((paragraph, pIndex) => {
    // Check if it's a list item
    if (paragraph.trim().startsWith('•') || paragraph.trim().startsWith('-') || paragraph.trim().match(/^\d+\./)) {
      const listItems = paragraph.split('\n').filter(item => item.trim());
      return (
        <ul key={pIndex} className="list-none space-y-2 mb-5">
          {listItems.map((item, liIndex) => (
            <li key={liIndex}>
              {renderInlineFormatting(item, `${pIndex}-${liIndex}`)}
            </li>
          ))}
        </ul>
      );
    }

    return (
      <p key={pIndex} className="mb-5">
        {renderInlineFormatting(paragraph, `${pIndex}`)}
      </p>
    );
  });
}

// Helper to render a single image with caption
function renderImage(src: string, alt: string, key?: number, maxWidth?: number) {
  return (
    <figure
      key={key}
      className="mt-10 mb-10 mx-auto"
      style={maxWidth ? { maxWidth: `${maxWidth}px` } : undefined}
    >
      <Image
        src={src}
        alt={alt}
        width={800}
        height={600}
        className="w-full h-auto object-contain"
      />
      <figcaption className={`${styles.caption} mt-3`}>{alt}</figcaption>
    </figure>
  );
}

// Helper to render multiple images in a grid
function renderImageGrid(items: Array<{ src: string; alt: string }>, maxWidth?: number) {
  return (
    <div
      className={`mb-10 mx-auto grid gap-4 ${getGridCols(items.length)}`}
      style={maxWidth ? { maxWidth: `${maxWidth}px` } : undefined}
    >
      {items.map((image, imgIndex) => (
        <figure key={imgIndex}>
          <Image
            src={image.src}
            alt={image.alt}
            width={800}
            height={600}
            className="w-full h-auto object-contain"
          />
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
      <video src={src} controls playsInline className="w-full h-auto">
        Your browser does not support the video tag.
      </video>
      {caption && <figcaption className={`${styles.caption} mt-2`}>{caption}</figcaption>}
    </figure>
  );
}

// Helper to render a notice (confidential, etc.) - inherits text-lg from parent
function renderNotice(content: string, color: 'red' | 'gray' = 'gray', key?: number) {
  const colorClass = color === 'red'
    ? 'text-[#e01414]'  // Original portfolio red
    : 'text-gray-400 dark:text-gray-500';

  return (
    <p key={key} className={`text-center font-medium mb-5 ${colorClass}`}>
      {content}
    </p>
  );
}

// Helper to render content blocks
function renderBlocks(blocks: ContentBlock[]) {
  return blocks.map((block, blockIndex) => {
    if (block.type === 'text') {
      const textClass = block.centered ? 'text-center' : '';
      // For large text, inherits text-lg from parent, adds medium weight
      if (block.size === 'large') {
        return (
          <p key={blockIndex} className={`font-medium mt-8 mb-6 ${textClass}`.trim()}>
            {renderInlineFormatting(block.content, `block-${blockIndex}`)}
          </p>
        );
      }
      return (
        <div key={blockIndex} className={textClass}>
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
        <div className={`space-y-12 text-lg ${styles.body} leading-relaxed`}>
          {project.sections.map((section, index) => (
            <section key={index}>
              {section.title && (
                <h2 className={`text-xl font-bold ${styles.heading} mb-4`}>{section.title}</h2>
              )}

              {/* Render blocks or legacy content */}
              {section.blocks
                ? renderBlocks(section.blocks)
                : (
                  <>
                    {section.content && renderTextContent(section.content)}
                    {section.images?.length && renderImageGrid(section.images)}
                  </>
                )
              }
            </section>
          ))}
        </div>

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
