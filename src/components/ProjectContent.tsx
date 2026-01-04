"use client";

import { useState } from "react";
import Image from "next/image";
import Lightbox from "./Lightbox";
import VideoPlayer from "./VideoPlayer";
import { ContentBlock } from "@/data/projects";

// Common style classes
const styles = {
  heading: "text-gray-900 dark:text-stone-100",
  body: "text-gray-600 dark:text-stone-400",
  muted: "text-gray-500 dark:text-stone-500",
  caption: "text-sm text-gray-500 dark:text-stone-500 text-center",
} as const;

// Get grid columns based on item count
const getGridCols = (count: number) => {
  if (count === 2) return "grid-cols-2";
  if (count >= 5) return "grid-cols-5";
  if (count >= 3) return "grid-cols-3";
  return "grid-cols-1";
};

// Helper to render inline formatting (bold **text** and underline _text_)
function renderInlineFormatting(text: string, keyPrefix: string = "") {
  const parts = text.split(/(\*\*[^*]+\*\*|_[^_]+_)/g);
  return parts.map((part, partIndex) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={`${keyPrefix}-${partIndex}`} className={`font-medium ${styles.heading}`}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("_") && part.endsWith("_") && part.length > 2) {
      return (
        <span key={`${keyPrefix}-${partIndex}`} className="underline">
          {part.slice(1, -1)}
        </span>
      );
    }
    return part;
  });
}

// Helper to render text content with paragraphs
function renderTextContent(content: string) {
  return content.split("\n\n").map((paragraph, pIndex) => {
    // Check if it's a list item (supports bullet •, hyphen -, em dash –, and numbered lists)
    if (
      paragraph.trim().startsWith("•") ||
      paragraph.trim().startsWith("-") ||
      paragraph.trim().startsWith("–") ||
      paragraph.trim().match(/^\d+\./)
    ) {
      const listItems = paragraph.split("\n").filter((item) => item.trim());
      return (
        <ul key={pIndex} className="list-none space-y-1 mb-5">
          {listItems.map((item, liIndex) => (
            <li key={liIndex}>{renderInlineFormatting(item, `${pIndex}-${liIndex}`)}</li>
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

interface ProjectContentProps {
  sections: Array<{
    title?: string;
    content?: string;
    images?: Array<{ src: string; alt: string }>;
    blocks?: ContentBlock[];
  }>;
}

export default function ProjectContent({ sections }: ProjectContentProps) {
  const [lightboxImage, setLightboxImage] = useState<{ src: string; alt: string; zoomable?: boolean } | null>(null);

  const openLightbox = (src: string, alt: string, zoomable?: boolean) => {
    setLightboxImage({ src, alt, zoomable });
  };

  const closeLightbox = () => {
    setLightboxImage(null);
  };

  // Clickable image component
  const ClickableImage = ({
    src,
    alt,
    maxWidth,
    showCaption = true,
    zoomable = false,
  }: {
    src: string;
    alt: string;
    maxWidth?: number;
    showCaption?: boolean;
    zoomable?: boolean;
  }) => (
    <figure
      className="mt-10 mb-10 mx-auto cursor-pointer group"
      style={maxWidth ? { maxWidth: `${maxWidth}px` } : undefined}
      onClick={() => openLightbox(src, alt, zoomable)}
    >
      <div className="relative">
        {/* Wrapper div for smooth transform animation (same pattern as project cards) */}
        <div className="transition-transform duration-300 ease-in-out group-hover:scale-[1.02]">
          <Image
            src={src}
            alt={alt}
            width={800}
            height={600}
            className="w-full h-auto object-contain"
          />
        </div>
        {/* Zoom icon with circular background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-in-out bg-black/50 rounded-full p-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="11" y1="8" x2="11" y2="14" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          </div>
        </div>
      </div>
      {showCaption && <figcaption className={`${styles.caption} mt-3`}>{alt}</figcaption>}
    </figure>
  );

  // Clickable image grid
  const ClickableImageGrid = ({
    items,
    maxWidth,
  }: {
    items: Array<{ src: string; alt: string }>;
    maxWidth?: number;
  }) => (
    <div
      className={`mb-10 mx-auto grid gap-4 ${getGridCols(items.length)}`}
      style={maxWidth ? { maxWidth: `${maxWidth}px` } : undefined}
    >
      {items.map((image, imgIndex) => (
        <figure
          key={imgIndex}
          className="cursor-pointer group relative"
          onClick={() => openLightbox(image.src, image.alt)}
        >
          {/* Wrapper div for smooth transform animation */}
          <div className="transition-transform duration-300 ease-in-out group-hover:scale-[1.02]">
            <Image
              src={image.src}
              alt={image.alt}
              width={800}
              height={600}
              className="w-full h-auto object-contain"
            />
          </div>
          {/* Zoom icon with circular background */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-in-out bg-black/50 rounded-full p-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="11" y1="8" x2="11" y2="14" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
            </div>
          </div>
        </figure>
      ))}
    </div>
  );

  // Render video with custom player
  const renderVideo = (src: string, caption?: string, key?: number, maxWidth?: number) => (
    <VideoPlayer key={key} src={src} caption={caption} maxWidth={maxWidth} />
  );

  // Render notice
  const renderNotice = (content: string, color: "red" | "gray" = "gray", key?: number) => {
    const colorClass = color === "red" ? "text-[#e01414]" : "text-gray-400 dark:text-gray-500";
    return (
      <p key={key} className={`text-center font-medium mb-5 ${colorClass}`}>
        {content}
      </p>
    );
  };

  // Render content blocks
  const renderBlocks = (blocks: ContentBlock[]) => {
    return blocks.map((block, blockIndex) => {
      if (block.type === "text") {
        const textClass = block.centered ? "text-center" : "";
        if (block.size === "large") {
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
      if (block.type === "image") {
        // Static image without lightbox
        if (block.noLightbox) {
          return (
            <figure
              key={blockIndex}
              className="mt-10 mb-10 mx-auto"
              style={block.maxWidth ? { maxWidth: `${block.maxWidth}px` } : undefined}
            >
              <Image
                src={block.src}
                alt={block.alt}
                width={800}
                height={600}
                className="w-full h-auto object-contain"
              />
              <figcaption className={`${styles.caption} mt-3`}>{block.alt}</figcaption>
            </figure>
          );
        }
        return (
          <ClickableImage
            key={blockIndex}
            src={block.src}
            alt={block.alt}
            maxWidth={block.maxWidth}
            zoomable={block.zoomable}
          />
        );
      }
      if (block.type === "images") {
        return (
          <div key={blockIndex}>
            <ClickableImageGrid items={block.items} maxWidth={block.maxWidth} />
          </div>
        );
      }
      if (block.type === "video") {
        return renderVideo(block.src, block.caption, blockIndex, block.maxWidth);
      }
      if (block.type === "notice") {
        return renderNotice(block.content, block.color, blockIndex);
      }
      return null;
    });
  };

  return (
    <>
      <div className={`space-y-12 text-lg ${styles.body} leading-relaxed`}>
        {sections.map((section, index) => (
          <section key={index}>
            {section.title && (
              <h2 className={`text-2xl font-medium ${styles.heading} mb-4`}>{section.title}</h2>
            )}

            {/* Render blocks or legacy content */}
            {section.blocks ? (
              renderBlocks(section.blocks)
            ) : (
              <>
                {section.content && renderTextContent(section.content)}
                {section.images?.length && (
                  <ClickableImageGrid items={section.images} />
                )}
              </>
            )}
          </section>
        ))}
      </div>

      {/* Lightbox */}
      <Lightbox
        src={lightboxImage?.src || ""}
        alt={lightboxImage?.alt || ""}
        isOpen={lightboxImage !== null}
        onClose={closeLightbox}
        enableZoom={lightboxImage?.zoomable}
      />
    </>
  );
}
