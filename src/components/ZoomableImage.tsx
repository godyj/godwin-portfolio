"use client";

import { useState, useCallback, useRef, useEffect } from "react";
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
 * Interactions:
 * - Click: Toggle zoom (zoom to fill viewport / reset)
 * - Wheel/trackpad scroll: Pan when zoomed
 * - Double-tap (mobile): Toggle zoom
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
  const [fillScale, setFillScale] = useState(2); // Calculated scale to fill viewport
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const lastTapRef = useRef<number>(0);

  const isZoomed = scale > 1;

  // Calculate the scale needed to fill viewport with the image
  useEffect(() => {
    const calculateFillScale = () => {
      if (!containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Calculate how much we need to scale to fill viewport
      // Use the lesser of width/height ratio to ensure image fills but doesn't overflow excessively
      const scaleToFillWidth = viewportWidth / containerRect.width;
      const scaleToFillHeight = viewportHeight / containerRect.height;

      // Use the smaller scale so the image fills one dimension completely
      // This leaves room to pan in the other dimension
      const calculatedScale = Math.min(scaleToFillWidth, scaleToFillHeight, maxZoom);

      // Ensure at least 1.5x zoom for a noticeable effect
      setFillScale(Math.max(1.5, calculatedScale));
    };

    calculateFillScale();
    window.addEventListener('resize', calculateFillScale);
    return () => window.removeEventListener('resize', calculateFillScale);
  }, [maxZoom]);

  // Handle click to toggle zoom
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();

    if (scale === 1) {
      // Zoom in to fill viewport, centered
      setScale(fillScale);
      setPosition({ x: 0, y: 0 });
    } else {
      // Reset zoom
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [scale, fillScale]);

  // Handle mouse wheel/trackpad for panning when zoomed
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!isZoomed) return; // Only pan when zoomed

    e.preventDefault();

    // Pan based on scroll delta
    const panSpeed = 1;
    setPosition(prev => ({
      x: prev.x - e.deltaX * panSpeed,
      y: prev.y - e.deltaY * panSpeed
    }));
  }, [isZoomed]);

  // Touch events for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    // Double tap detection for toggle zoom
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      e.preventDefault();
      if (scale === 1) {
        setScale(fillScale);
        setPosition({ x: 0, y: 0 });
      } else {
        setScale(1);
        setPosition({ x: 0, y: 0 });
      }
      lastTapRef.current = 0;
      return;
    }
    lastTapRef.current = now;
  }, [scale, fillScale]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    // Prevent default only when zoomed to allow panning
    if (isZoomed && e.touches.length === 1) {
      // Note: Native scroll handles panning on touch devices
    }
  }, [isZoomed]);

  const handleTouchEnd = useCallback(() => {
    // No-op, but kept for potential future use
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{
        cursor: isZoomed ? 'zoom-out' : 'zoom-in',
      }}
      onClick={handleClick}
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

      {/* Zoom level indicator + pan hint */}
      {isZoomed && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 bg-black/60 text-white text-xs px-2 py-1 rounded-full pointer-events-none">
          {Math.round(scale * 100)}% · Scroll to pan
        </div>
      )}

      <div
        ref={imageRef}
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transition: 'transform 0.2s ease-out',
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
