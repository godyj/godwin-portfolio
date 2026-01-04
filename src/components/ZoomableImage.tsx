"use client";

import { useState, useCallback, useRef } from "react";
import Image from "next/image";

interface ZoomableImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  maxZoom?: number;
  showHint?: boolean;
}

/**
 * A reusable zoomable image component with pan and zoom functionality.
 *
 * Usage:
 * ```tsx
 * <ZoomableImage
 *   src="/images/diagram.png"
 *   alt="Flow diagram"
 *   maxZoom={4}
 * />
 * ```
 */
export default function ZoomableImage({
  src,
  alt,
  width = 1920,
  height = 1080,
  className = "",
  maxZoom = 4,
  showHint = true,
}: ZoomableImageProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const lastTapRef = useRef<number>(0);

  const MIN_SCALE = 1;
  const MAX_SCALE = maxZoom;

  const isZoomed = scale > 1;

  // Handle click to toggle zoom
  const handleClick = useCallback((e: React.MouseEvent) => {
    if (isDragging) return; // Don't toggle if we were dragging

    e.stopPropagation();

    if (scale === 1) {
      // Zoom in to 2x centered on click position
      setScale(2);
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const clickX = e.clientX - rect.left - rect.width / 2;
        const clickY = e.clientY - rect.top - rect.height / 2;
        setPosition({ x: -clickX, y: -clickY });
      }
    } else {
      // Reset zoom
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [scale, isDragging]);

  // Handle mouse wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.3 : 0.3;
    const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale + delta));

    if (newScale === 1) {
      setPosition({ x: 0, y: 0 });
    }
    setScale(newScale);
  }, [scale, MAX_SCALE]);

  // Handle drag start
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (scale <= 1) return;
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  }, [scale, position]);

  // Handle drag move
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  }, [isDragging, dragStart]);

  // Handle drag end
  const handleMouseUp = useCallback(() => {
    // Small delay to prevent click from firing after drag
    setTimeout(() => setIsDragging(false), 50);
  }, []);

  // Touch events for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    // Double tap detection
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      e.preventDefault();
      if (scale === 1) {
        setScale(2);
        const touch = e.touches[0] || e.changedTouches[0];
        if (containerRef.current && touch) {
          const rect = containerRef.current.getBoundingClientRect();
          const tapX = touch.clientX - rect.left - rect.width / 2;
          const tapY = touch.clientY - rect.top - rect.height / 2;
          setPosition({ x: -tapX, y: -tapY });
        }
      } else {
        setScale(1);
        setPosition({ x: 0, y: 0 });
      }
      lastTapRef.current = 0;
      return;
    }
    lastTapRef.current = now;

    // Pan start
    if (scale > 1 && e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
    }
  }, [scale, position]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setPosition({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y
    });
  }, [isDragging, dragStart]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{
        cursor: isZoomed ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
      }}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Zoom hint */}
      {showHint && !isZoomed && (
        <div className="absolute top-2 right-2 z-10 bg-black/50 text-white text-xs px-2 py-1 rounded-full pointer-events-none opacity-70">
          Click to zoom
        </div>
      )}

      {/* Zoom level indicator */}
      {isZoomed && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 bg-black/60 text-white text-xs px-2 py-1 rounded-full pointer-events-none">
          {Math.round(scale * 100)}%
        </div>
      )}

      <div
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transition: isDragging ? 'none' : 'transform 0.2s ease-out',
          transformOrigin: 'center center',
        }}
      >
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className="w-full h-auto object-contain select-none"
          style={{ pointerEvents: 'none' }}
          draggable={false}
          unoptimized
        />
      </div>

      {/* Reset button when zoomed */}
      {isZoomed && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setScale(1);
            setPosition({ x: 0, y: 0 });
          }}
          className="absolute bottom-2 right-2 z-10 bg-black/60 hover:bg-black/80 text-white text-xs px-3 py-1.5 rounded-full transition-colors"
        >
          Reset
        </button>
      )}
    </div>
  );
}
