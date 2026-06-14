"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { Play, Pause, Volume2, VolumeX, Loader2, Maximize2, Minimize2, Maximize, Minimize } from "lucide-react";
import { UI_LABELS } from "../../constants/labels";

interface VideoPlayerProps {
  videoUrl: string;
  isActive: boolean; // True if this video is currently in the active viewport
  onDoubleTap?: (x: number, y: number) => void;
}

// Global volume syncing variables
const DEFAULT_VOLUME = 0.8;
let globalMuted = true; // Auto-play is usually muted by default on browsers
let globalVolume = DEFAULT_VOLUME;
const VOLUME_EVENT_NAME = "cyberfeed_volume_change";

// Global aspect ratio fit mode syncing variables
let globalFitMode = false;
const FIT_MODE_EVENT_NAME = "cyberfeed_fit_mode_change";

const DOUBLE_CLICK_DELAY_MS = 250;
const LONG_PRESS_DELAY_MS = 400;

export function VideoPlayer({ videoUrl, isActive, onDoubleTap }: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const longPressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const playOverlayTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(globalMuted);
  const [volume, setVolume] = useState(globalVolume);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showPlayOverlay, setShowPlayOverlay] = useState(false);
  const [overlayType, setOverlayType] = useState<"play" | "pause">("play");
  const [isFitMode, setIsFitMode] = useState(globalFitMode); // Initially load from synchronized global variable
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Dynamic video orientation detection states
  const [isLandscape, setIsLandscape] = useState(false);

  // Speed Up hold state
  const [isSpeedUp, setIsSpeedUp] = useState(false);
  const isLongPressingRef = useRef(false);
  const wasLongPressRef = useRef(false);
  const [isDraggingProgress, setIsDraggingProgress] = useState(false);

  // Gesture coordinate & time tracking
  const pointerDownTimeRef = useRef<number>(0);
  const pointerStartCoordsRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Pure React 19 prop adjustment to reset loading state on URL changes
  const [lastUrl, setLastUrl] = useState(videoUrl);
  if (videoUrl !== lastUrl) {
    setLastUrl(videoUrl);
    setIsLoading(true);
  }

  // Memoized Toggle Play function (declared first to avoid hoisting/linting warnings)
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
      setOverlayType("pause");
    } else {
      video.play().catch((err) => console.log(err));
      setIsPlaying(true);
      setOverlayType("play");
    }

    // Trigger overlay animation
    if (playOverlayTimeoutRef.current) {
      clearTimeout(playOverlayTimeoutRef.current);
    }
    setShowPlayOverlay(true);
    playOverlayTimeoutRef.current = setTimeout(() => setShowPlayOverlay(false), 600);
  }, [isPlaying]);

  // Safe Double click likes handler triggered via VideoPlayer callbacks
  const handleTap = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (tapTimeoutRef.current) {
      // Double tap detected
      clearTimeout(tapTimeoutRef.current);
      tapTimeoutRef.current = null;

      // Extract client coordinates relative to container
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (onDoubleTap) {
        onDoubleTap(x, y);
      }
    } else {
      // Start single tap timer
      tapTimeoutRef.current = setTimeout(() => {
        tapTimeoutRef.current = null;
        togglePlay();
      }, DOUBLE_CLICK_DELAY_MS);
    }
  }, [togglePlay, onDoubleTap]);

  // Pointer Down triggers long-press checks for 2x Fast Forward
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('.h-4') || target.closest('.z-20')) {
      return;
    }

    pointerDownTimeRef.current = e.timeStamp;
    pointerStartCoordsRef.current = { x: e.clientX, y: e.clientY };
    isLongPressingRef.current = false;
    wasLongPressRef.current = false;

    // Check long press delay (400ms)
    longPressTimeoutRef.current = setTimeout(() => {
      const video = videoRef.current;
      if (!video) return;

      video.playbackRate = 2.0;
      setIsSpeedUp(true);
      isLongPressingRef.current = true;
      wasLongPressRef.current = true;

      // Disable any pending single clicks
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
        tapTimeoutRef.current = null;
      }
    }, LONG_PRESS_DELAY_MS);
  }, []);

  // Pointer Up releases speed-up overrides and handles click gestures
  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }

    const video = videoRef.current;
    if (video && video.playbackRate !== 1.0) {
      video.playbackRate = 1.0;
    }

    setIsSpeedUp(false);

    // If it was a long press, do nothing further (wasLongPressRef resets here)
    if (wasLongPressRef.current) {
      wasLongPressRef.current = false;
      isLongPressingRef.current = false;
      return;
    }

    // Measure time and movement distance to qualify a normal tap gesture (pure e.timeStamp instead of Date.now())
    const elapsed = e.timeStamp - pointerDownTimeRef.current;
    const dx = e.clientX - pointerStartCoordsRef.current.x;
    const dy = e.clientY - pointerStartCoordsRef.current.y;
    const distanceSq = dx * dx + dy * dy;

    // Fast click (< 350ms) and minimal pixel travel (< 15px, distanceSq < 225)
    if (elapsed < 350 && distanceSq < 225) {
      handleTap(e);
    }

    isLongPressingRef.current = false;
  }, [handleTap]);

  const handlePointerCancel = useCallback(() => {
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }

    const video = videoRef.current;
    if (video && video.playbackRate !== 1.0) {
      video.playbackRate = 1.0;
    }

    setIsSpeedUp(false);
    isLongPressingRef.current = false;
    wasLongPressRef.current = false;
  }, []);

  const handlePointerLeave = useCallback(() => {
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }

    const video = videoRef.current;
    if (video && video.playbackRate !== 1.0) {
      video.playbackRate = 1.0;
    }

    setIsSpeedUp(false);
    isLongPressingRef.current = false;
    wasLongPressRef.current = false;
  }, []);

  // Load preferences from localStorage on mount (deferred to avoid set-state-in-effect)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedVolume = localStorage.getItem("looking_volume");
      const savedMuted = localStorage.getItem("looking_muted");
      const savedFitMode = localStorage.getItem("looking_fit_mode");

      // Defer state setting to satisfy linter and optimize rendering
      const timer = setTimeout(() => {
        if (savedVolume !== null) {
          const parsedVolume = parseFloat(savedVolume);
          globalVolume = parsedVolume;
          setVolume(parsedVolume);
        }
        if (savedMuted !== null) {
          const parsedMuted = savedMuted === "true";
          globalMuted = parsedMuted;
          setIsMuted(parsedMuted);
        }
        if (savedFitMode !== null) {
          const parsedFitMode = savedFitMode === "true";
          globalFitMode = parsedFitMode;
          setIsFitMode(parsedFitMode);
        }
      }, 0);

      return () => clearTimeout(timer);
    }
  }, []);

  // Check if video is already loaded
  useEffect(() => {
    const video = videoRef.current;
    if (video && video.readyState >= 1) {
      setIsLoading(false);
      setIsLandscape(video.videoWidth > video.videoHeight);
    }
  }, [isActive, videoUrl]);

  // Sync autoplay state based on visibility (deferred isPlaying update with muted fallback)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setTimeout(() => setIsPlaying(true), 0);
          })
          .catch((error) => {
            console.log("Auto-play prevented by browser policy, trying muted fallback...", error);
            // Fallback: mute video and play
            video.muted = true;
            setIsMuted(true);
            video.play()
              .then(() => {
                setTimeout(() => setIsPlaying(true), 0);
              })
              .catch((err) => {
                console.error("Muted auto-play also failed", err);
                setTimeout(() => setIsPlaying(false), 0);
              });
          });
      }
    } else {
      video.pause();
      video.currentTime = 0;
      setTimeout(() => setIsPlaying(false), 0);
    }
  }, [isActive]);

  // Listen to keyboard spacebar to toggle play/pause
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        const activeEl = document.activeElement;
        if (
          activeEl &&
          (activeEl.tagName === "INPUT" ||
            activeEl.tagName === "TEXTAREA" ||
            activeEl.getAttribute("contenteditable") === "true")
        ) {
          return;
        }

        e.preventDefault();
        togglePlay();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isActive, togglePlay]);

  // Sync volume with physical video element
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = isMuted;
    video.volume = volume;
  }, [isMuted, volume]);

  // Global Volume sync listener
  useEffect(() => {
    const handleGlobalVolumeChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ volume: number; muted: boolean }>;
      if (customEvent.detail) {
        setVolume(customEvent.detail.volume);
        setIsMuted(customEvent.detail.muted);
      }
    };

    window.addEventListener(VOLUME_EVENT_NAME, handleGlobalVolumeChange);
    return () => {
      window.removeEventListener(VOLUME_EVENT_NAME, handleGlobalVolumeChange);
    };
  }, []);

  // Global Fit Mode aspect ratio sync listener
  useEffect(() => {
    const handleGlobalFitModeChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ isFitMode: boolean }>;
      if (customEvent.detail !== undefined) {
        setIsFitMode(customEvent.detail.isFitMode);
      }
    };

    window.addEventListener(FIT_MODE_EVENT_NAME, handleGlobalFitModeChange);
    return () => {
      window.removeEventListener(FIT_MODE_EVENT_NAME, handleGlobalFitModeChange);
    };
  }, []);

  // Listen to fullscreen changes (ESC key exit support)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Drag seeking window-level release listener
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDraggingProgress(false);
    };
    if (isDraggingProgress) {
      window.addEventListener("mouseup", handleGlobalMouseUp);
      window.addEventListener("touchend", handleGlobalMouseUp);
    }
    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp);
      window.removeEventListener("touchend", handleGlobalMouseUp);
    };
  }, [isDraggingProgress]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
      if (longPressTimeoutRef.current) clearTimeout(longPressTimeoutRef.current);
      if (playOverlayTimeoutRef.current) clearTimeout(playOverlayTimeoutRef.current);
    };
  }, []);

  const dispatchVolumeUpdate = (newVol: number, newMuted: boolean) => {
    globalVolume = newVol;
    globalMuted = newMuted;
    setVolume(newVol);
    setIsMuted(newMuted);
    if (typeof window !== "undefined") {
      localStorage.setItem("looking_volume", newVol.toString());
      localStorage.setItem("looking_muted", newMuted.toString());
    }
    window.dispatchEvent(
      new CustomEvent(VOLUME_EVENT_NAME, {
        detail: { volume: newVol, muted: newMuted },
      })
    );
  };

  // Seek Progress Calculations
  const seekToPosition = (clientX: number) => {
    const video = videoRef.current;
    const bar = progressBarRef.current;
    if (!video || !bar || video.duration === 0) return;

    const rect = bar.getBoundingClientRect();
    const relativeX = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = relativeX / rect.width;

    video.currentTime = percentage * video.duration;
    setProgress(percentage * 100);
  };

  const handleProgressMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsDraggingProgress(true);
    seekToPosition(e.clientX);
  };

  const handleProgressMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingProgress) return;
    e.stopPropagation();
    seekToPosition(e.clientX);
  };

  const handleProgressTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsDraggingProgress(true);
    if (e.touches[0]) {
      seekToPosition(e.touches[0].clientX);
    }
  };

  const handleProgressTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDraggingProgress) return;
    e.stopPropagation();
    if (e.touches[0]) {
      seekToPosition(e.touches[0].clientX);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering play/pause
    const newMuted = !isMuted;
    let newVol = volume;

    if (!newMuted && volume === 0) {
      newVol = DEFAULT_VOLUME;
    }
    dispatchVolumeUpdate(newVol, newMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const newVol = parseFloat(e.target.value);
    const newMuted = newVol === 0;
    dispatchVolumeUpdate(newVol, newMuted);
  };

  const toggleFitMode = (e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid play/pause trigger
    const nextFit = !isFitMode;
    globalFitMode = nextFit;
    setIsFitMode(nextFit);
    if (typeof window !== "undefined") {
      localStorage.setItem("looking_fit_mode", nextFit.toString());
    }
    window.dispatchEvent(
      new CustomEvent(FIT_MODE_EVENT_NAME, {
        detail: { isFitMode: nextFit },
      })
    );
  };

  const toggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    const container = document.getElementById("video-feed-root") || containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch((err) => console.error("Error attempting to enable fullscreen", err));
    } else {
      document.exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch((err) => console.error("Error attempting to exit fullscreen", err));
    }
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || isDraggingProgress) return; // Don't snap track during user seek dragging
    const currentPercent = (video.currentTime / video.duration) * 100;
    setProgress(currentPercent || 0);
  };
  // Measures dynamic video metadata dimensions on load
  const handleVideoLoaded = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    setIsLoading(false);
    const video = e.currentTarget;
    if (video) {
      // Widescreen is landscape: width > height
      setIsLandscape(video.videoWidth > video.videoHeight);
    }
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      onPointerCancel={handlePointerCancel}
      className="relative w-full h-full bg-[#030304] flex items-center justify-center cursor-pointer select-none overflow-hidden"
    >
      {/* Video Tag */}
      <video
        ref={videoRef}
        src={videoUrl}
        loop
        playsInline
        autoPlay={isActive}
        muted={isMuted}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleVideoLoaded}
        onCanPlay={() => setIsLoading(false)}
        onPlaying={() => setIsLoading(false)}
        className={`w-full h-full transition-all duration-300 ${(isFitMode && isLandscape) ? "object-contain bg-black" : "object-cover"
          }`}
      />

      {/* Loading Spinner Skeleton */}
      {isLoading && (
        <div className="absolute inset-0 bg-[#0c0c0e] flex flex-col items-center justify-center text-white/60">
          <Loader2 className="w-10 h-10 animate-spin text-brand-primary mb-2" />
          <span className="text-xs font-medium tracking-widest uppercase">
            {UI_LABELS.video.loading}
          </span>
        </div>
      )}

      {/* Pulsating Speed Up 2x Overlay Indicator */}
      {isSpeedUp && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-black/60 border border-white/10 px-3.5 py-1.5 rounded-full text-xs font-bold text-brand-primary animate-pulse pointer-events-none select-none shadow-lg backdrop-blur-sm">
          <span className="flex gap-0.5 tracking-tighter">▶▶</span>
          <span>Phát nhanh 2X</span>
        </div>
      )}

      {/* Play/Pause Central Tap Indicator */}
      {showPlayOverlay && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="w-16 h-16 rounded-full bg-black/40 border border-white/20 flex items-center justify-center animate-ping-once text-white shadow-xl shadow-brand-primary/10 backdrop-blur-sm">
            {overlayType === "play" ? (
              <Pause className="w-8 h-8 text-brand-secondary fill-current" />
            ) : (
              <Play className="w-8 h-8 text-brand-primary fill-current translate-x-0.5" />
            )}
          </div>
        </div>
      )}

      {/* Top Left Aspect Ratio Fit/Fill Toggle Button (Only visible for Widescreen landscape videos!) */}
      {isLandscape && (
        <button
          onClick={toggleFitMode}
          suppressHydrationWarning={true}
          className="absolute top-4 left-4 z-20 flex items-center gap-1.5 bg-black/40 hover:bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-xs font-semibold text-white/90 hover:text-white hover:scale-105 active:scale-95 transition-all select-none cursor-pointer"
        >
          {isFitMode ? (
            <>
              <Minimize2 className="w-3.5 h-3.5 text-brand-secondary" />
            </>
          ) : (
            <>
              <Maximize2 className="w-3.5 h-3.5 text-brand-primary" />
            </>
          )}
        </button>
      )}

      {/* Vertical Volume Controller on the Left Side (Slides out from Left Border on Hover) */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-14 h-64 z-20 flex items-center group/volzone">
        <div
          className="ml-2.5 flex flex-col-reverse items-center gap-3 bg-black/50 backdrop-blur-md px-2 py-3 rounded-full border border-white/10 transition-all duration-300 -translate-x-[180%] opacity-0 scale-90 pointer-events-none group-hover/volzone:translate-x-0 group-hover/volzone:opacity-100 group-hover/volzone:scale-100 group-hover/volzone:pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Mute/Unmute Icon Button */}
          <button
            onClick={toggleMute}
            suppressHydrationWarning={true}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:text-brand-primary hover:bg-white/10 transition-all cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Vertical Slider wrapper */}
          <div className="h-24 flex items-center justify-center pb-1">
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              style={{ WebkitAppearance: "slider-vertical" } as React.CSSProperties}
              className="h-20 w-1 accent-brand-primary bg-white/20 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Fullscreen Controls overlay (Top Right) */}
      <div
        className="absolute top-4 right-4 z-20 flex items-center bg-black/35 backdrop-blur-md p-2 rounded-full border border-white/10 opacity-70 hover:opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={toggleFullscreen}
          suppressHydrationWarning={true}
          className="w-7 h-7 text-white hover:text-brand-primary hover:bg-white/10 rounded-full transition-colors cursor-pointer flex items-center justify-center"
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </button>
      </div>

      {/* Interactive Seekable Progress Bar Overlay (Bottom of Video Card) */}
      <div
        ref={progressBarRef}
        onMouseDown={handleProgressMouseDown}
        onMouseMove={handleProgressMouseMove}
        onTouchStart={handleProgressTouchStart}
        onTouchMove={handleProgressTouchMove}
        onClick={(e) => e.stopPropagation()} // Prevent trigger play/pause on seek click
        className="absolute bottom-0 left-0 right-0 h-6 z-30 group flex items-end cursor-pointer select-none"
      >
        {/* Background track (hidden by default, only visible on hover or dragging) */}
        <div className="w-full h-1 group-hover:h-2 bg-white/15 opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-all duration-300 flex items-center relative">

          {/* Active filled track */}
          <div
            className="h-full bg-gradient-to-r from-brand-primary to-brand-secondary shadow-[0_0_8px_var(--brand-primary)]"
            style={{ width: `${progress}%` }}
          />

          {/* Scrubber Handle Dot (pops up on hover or drag) */}
          <div
            className="absolute w-2.5 h-2.5 rounded-full bg-white scale-0 group-hover:scale-100 group-active:scale-100 transition-transform -translate-x-1/2 shadow shadow-black/60 pointer-events-none"
            style={{ left: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
export { DEFAULT_VOLUME, VOLUME_EVENT_NAME };
