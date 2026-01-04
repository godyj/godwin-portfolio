"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import Image from "next/image";

interface LightboxProps {
  src: string;
  alt: string;
  isOpen: boolean;
  onClose: () => void;
  enableZoom?: boolean;
}

export default function Lightbox({ src, alt, isOpen, onClose, enableZoom = false }: LightboxProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  const MIN_SCALE = 1;
  const MAX_SCALE = 4;

  // Reset zoom when closing or opening
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen]);

  // Handle escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (scale > 1) {
          // Reset zoom first
          setScale(1);
          setPosition({ x: 0, y: 0 });
        } else {
          onClose();
        }
      }
    },
    [onClose, scale]
  );

  // Add/remove event listeners
  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  // Handle click to toggle zoom
  const handleImageClick = useCallback((e: React.MouseEvent) => {
    if (!enableZoom) return;
    e.stopPropagation();

    if (scale === 1) {
      // Zoom in to 2x
      setScale(2);

      // Center zoom on click position
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
  }, [enableZoom, scale]);

  // Handle mouse wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!enableZoom) return;
    e.preventDefault();

    const delta = e.deltaY > 0 ? -0.2 : 0.2;
    const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale + delta));

    if (newScale === 1) {
      setPosition({ x: 0, y: 0 });
    }

    setScale(newScale);
  }, [enableZoom, scale]);

  // Handle drag start
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!enableZoom || scale <= 1) return;
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  }, [enableZoom, scale, position]);

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
    setIsDragging(false);
  }, []);

  // Touch events for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!enableZoom || scale <= 1 || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
  }, [enableZoom, scale, position]);

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

  // Double tap to zoom on mobile
  const lastTapRef = useRef<number>(0);
  const handleDoubleTap = useCallback((e: React.TouchEvent) => {
    if (!enableZoom) return;

    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      // Double tap detected
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
    }
    lastTapRef.current = now;
  }, [enableZoom, scale]);

  if (!isOpen) return null;

  return (
    <div
      className="lightbox-overlay"
      onClick={onClose}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="lightbox-close"
        aria-label="Close lightbox"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Zoom indicator */}
      {enableZoom && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-black/60 text-white text-sm px-3 py-1.5 rounded-full">
          {scale === 1 ? "Click to zoom" : `${Math.round(scale * 100)}% — Click to reset`}
        </div>
      )}

      {/* Image container */}
      <div
        ref={containerRef}
        className="lightbox-image-container"
        onClick={(e) => e.stopPropagation()}
        onWheel={handleWheel}
        style={{ cursor: enableZoom ? (scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in') : 'default' }}
      >
        <div
          ref={imageRef}
          onClick={handleImageClick}
          onMouseDown={handleMouseDown}
          onTouchStart={(e) => { handleDoubleTap(e); handleTouchStart(e); }}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transition: isDragging ? 'none' : 'transform 0.2s ease-out',
            transformOrigin: 'center center'
          }}
        >
          <Image
            src={src}
            alt={alt}
            width={1920}
            height={1080}
            className="max-w-full max-h-[90vh] w-auto h-auto object-contain select-none"
            style={{ pointerEvents: 'none' }}
            priority
            unoptimized
            draggable={false}
          />
        </div>
      </div>

      {/* Caption */}
      <div className="lightbox-caption">{alt}</div>
    </div>
  );
}
