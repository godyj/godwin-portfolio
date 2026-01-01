"use client";

import { useState, useRef } from "react";

interface VideoPlayerProps {
  src: string;
  caption?: string;
  maxWidth?: number;
}

export default function VideoPlayer({ src, caption, maxWidth }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleVideoClick = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
  };

  return (
    <figure
      className="mt-2.5 mb-5 mx-auto"
      style={maxWidth ? { maxWidth: `${maxWidth}px` } : undefined}
    >
      <div
        className="video-player group"
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        <video
          ref={videoRef}
          src={src}
          playsInline
          onClick={handleVideoClick}
          onEnded={handleEnded}
          controls={isPlaying && showControls}
          className="w-full h-auto"
        >
          Your browser does not support the video tag.
        </video>

        {/* Play button overlay */}
        {!isPlaying && (
          <div className="video-player-overlay" onClick={handlePlay}>
            <div className="video-play-button">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {caption && (
        <figcaption className="text-sm text-gray-500 dark:text-stone-500 text-center mt-2">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
