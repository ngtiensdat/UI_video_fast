"use client";

import React, { useState, useEffect } from "react";
import { Heart, MessageCircle, Share2, Music2, Plus, Check, MoreHorizontal } from "lucide-react";
import { VideoItem } from "../../types";
import { VideoPlayer } from "./video-player";
import { ShareDialog } from "./share-dialog";
import { UI_LABELS } from "../../constants/labels";
import { LIKE_INCREASE_STEP, INITIAL_COMMENTS_MAP } from "../../constants/video-data";

interface VideoCardProps {
  video: VideoItem;
  isActive: boolean;
  onToggleComments: () => void;
}

interface FloatingHeart {
  id: number;
  x: number;
  y: number;
}

export function VideoCard({ video, isActive, onToggleComments }: VideoCardProps) {
  const [likesCount, setLikesCount] = useState(video.likesCount);
  const [commentsCount, setCommentsCount] = useState(() => {
    const initial = INITIAL_COMMENTS_MAP[video.id];
    return initial ? initial.length : video.commentsCount;
  });

  const [sharesCount, setSharesCount] = useState(video.sharesCount);
  const [isLiked, setIsLiked] = useState(false);
  const [isFollowed, setIsFollowed] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [floatingHearts, setFloatingHearts] = useState<FloatingHeart[]>([]);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [showFollowCheck, setShowFollowCheck] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Sync follow state and listen to events (follow & comments count update)
  useEffect(() => {
    const saved = localStorage.getItem("looking_followed_users");
    if (saved) {
      try {
        const followedList: string[] = JSON.parse(saved);
        if (followedList.includes(video.authorName)) {
          setIsFollowed(true);
        }
      } catch (e) {
        console.error("Failed to parse followed list from localStorage", e);
      }
    }

    // Load actual comments count from localStorage to avoid hydration mismatch
    const storageKey = `cyberfeed_comments_${video.id}`;
    const savedComments = localStorage.getItem(storageKey);
    if (savedComments) {
      try {
        const parsed = JSON.parse(savedComments);
        if (Array.isArray(parsed)) {
          setCommentsCount(parsed.length);
        }
      } catch (e) {
        console.error(e);
      }
    }

    const handleFollowEvent = (e: Event) => {
      const customEv = e as CustomEvent<{ authorName: string; followed: boolean }>;
      if (customEv.detail && customEv.detail.authorName === video.authorName) {
        setIsFollowed(customEv.detail.followed);
      }
    };

    const handleCommentsCountUpdate = (e: Event) => {
      const customEv = e as CustomEvent<{ videoId: string; count: number }>;
      if (customEv.detail && customEv.detail.videoId === video.id) {
        setCommentsCount(customEv.detail.count);
      }
    };

    window.addEventListener("looking_follow_change", handleFollowEvent);
    window.addEventListener("looking_comments_count_update", handleCommentsCountUpdate);
    
    return () => {
      window.removeEventListener("looking_follow_change", handleFollowEvent);
      window.removeEventListener("looking_comments_count_update", handleCommentsCountUpdate);
    };
  }, [video.authorName, video.id]);

  const handleLikeToggle = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const nextLiked = !isLiked;
    setIsLiked(nextLiked);
    setLikesCount((prevCount) =>
      nextLiked ? prevCount + LIKE_INCREASE_STEP : prevCount - LIKE_INCREASE_STEP
    );
  };

  const handleFollowToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFollowed(true);
    setShowFollowCheck(true);

    const saved = localStorage.getItem("looking_followed_users");
    let followedList: string[] = [];
    if (saved) {
      try {
        followedList = JSON.parse(saved);
      } catch (err) {
        console.error(err);
      }
    }
    if (!followedList.includes(video.authorName)) {
      followedList.push(video.authorName);
      localStorage.setItem("looking_followed_users", JSON.stringify(followedList));
    }

    // Notify other cards and profile components immediately
    window.dispatchEvent(
      new CustomEvent("looking_follow_change", {
        detail: { authorName: video.authorName, followed: true },
      })
    );

    setTimeout(() => {
      setShowFollowCheck(false);
    }, 1200);
  };

  // Safe Double click likes handler triggered via VideoPlayer callbacks
  const handleVideoDoubleTap = (x: number, y: number) => {
    const newHeart: FloatingHeart = {
      id: Date.now() + Math.random(),
      x,
      y,
    };

    setFloatingHearts((prev) => [...prev, newHeart]);

    if (!isLiked) {
      setIsLiked(true);
      setLikesCount((prevCount) => prevCount + LIKE_INCREASE_STEP);
    }

    // Clean up heart after animation ends
    setTimeout(() => {
      setFloatingHearts((prev) => prev.filter((h) => h.id !== newHeart.id));
    }, 1000);
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsShareOpen(true);
    setSharesCount((prev) => prev + 1);
  };

  const isMyVideo = video.authorName === "@dat_nguyen_test";

  const handleDeleteVideo = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(false);

    // Load from localStorage
    const saved = localStorage.getItem("looking_uploaded_videos");
    if (saved) {
      try {
        const uploadedList: VideoItem[] = JSON.parse(saved);
        if (Array.isArray(uploadedList)) {
          // Filter out the current video
          const filtered = uploadedList.filter((v) => v.id !== video.id);
          localStorage.setItem("looking_uploaded_videos", JSON.stringify(filtered));
          
          // Notify page/feed to refresh the video list
          window.dispatchEvent(new CustomEvent("looking_video_uploaded"));
          alert("Xóa video thành công!");
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-black">
      {/* Video Area Container */}
      <div className="relative w-full h-full select-none bg-black">
        
        {/* Playback player with single/double-click conflict resolver */}
        <VideoPlayer
          videoUrl={video.videoUrl}
          isActive={isActive}
          onDoubleTap={handleVideoDoubleTap}
        />

        {/* Double-Click Floating Hearts Overlay */}
        {floatingHearts.map((heart) => (
          <div
            key={heart.id}
            className="absolute pointer-events-none z-30 animate-heart-float"
            style={{
              left: `${heart.x}px`,
              top: `${heart.y}px`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <Heart className="w-16 h-16 text-brand-secondary fill-current drop-shadow-[0_0_10px_var(--brand-secondary)]" />
          </div>
        ))}

        {/* Bottom-Left Information Overlay */}
        <div className="absolute bottom-5 left-4 right-16 z-20 text-white flex flex-col gap-2 pointer-events-none">
          <div className="flex items-center gap-2">
            <span className="font-bold text-base hover:underline pointer-events-auto cursor-pointer">
              {video.authorName}
            </span>
          </div>
          <div className="text-sm text-slate-200 leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] pointer-events-auto">
            <p className={isDescExpanded ? "" : "line-clamp-2"}>
              {video.description}
            </p>
            {video.description.length > 85 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDescExpanded(!isDescExpanded);
                }}
                suppressHydrationWarning={true}
                className="text-brand-primary hover:text-brand-secondary font-bold text-xs mt-1 transition-colors cursor-pointer"
              >
                {isDescExpanded ? "Ẩn bớt" : "Xem thêm"}
              </button>
            )}
          </div>

          {/* Music Scrolling marquee */}
          <div className="flex items-center gap-2 mt-1 pointer-events-auto">
            <Music2 className="w-4 h-4 text-slate-300 shrink-0" />
            <div className="overflow-hidden w-40 sm:w-48 h-4 relative">
              <div className="absolute whitespace-nowrap text-xs text-slate-300 font-medium animate-marquee">
                {video.musicName} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {video.musicName}
              </div>
            </div>
          </div>
        </div>

        {/* Right-Side Interaction Panel (Overlaid Glassmorphic Columns) */}
        <div className="absolute right-3 bottom-20 z-20 flex flex-col items-center gap-5">
          {/* Author Profile Picture Widget */}
          <div className="relative mb-2">
            <img
              src={video.authorAvatar}
              alt="Author Avatar"
              className="w-12 h-12 rounded-full object-cover border-2 border-white pointer-events-auto cursor-pointer hover:scale-105 transition-transform bg-slate-800"
            />
            {!isFollowed && (
              <button
                onClick={handleFollowToggle}
                suppressHydrationWarning={true}
                className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-5 bg-brand-secondary hover:brightness-110 text-white rounded-full flex items-center justify-center border border-black transition-all duration-300 pointer-events-auto cursor-pointer hover:scale-110 active:scale-90"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}
            {isFollowed && showFollowCheck && (
              <div
                className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-5 bg-emerald-500 text-white rounded-full flex items-center justify-center border border-black animate-scale-in"
              >
                <Check className="w-3 h-3" />
              </div>
            )}
          </div>

          {/* Like Interaction Button */}
          <button
            onClick={handleLikeToggle}
            suppressHydrationWarning={true}
            className="flex flex-col items-center group pointer-events-auto cursor-pointer transition-transform duration-200 active:scale-75"
          >
            <div
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 ${
                isLiked
                  ? "bg-brand-secondary/20 border-brand-secondary text-brand-secondary"
                  : "bg-black/40 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 group-hover:scale-105"
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
            </div>
            <span className="text-xs text-white/95 mt-1 font-semibold drop-shadow-md">
              {likesCount}
            </span>
          </button>

          {/* Comments Dialog Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleComments();
            }}
            suppressHydrationWarning={true}
            className="flex flex-col items-center group pointer-events-auto cursor-pointer transition-transform duration-200 active:scale-75"
          >
            <div className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/10 group-hover:scale-105 transition-all duration-300">
              <MessageCircle className="w-5 h-5" />
            </div>
            <span className="text-xs text-white/95 mt-1 font-semibold drop-shadow-md">
              {commentsCount}
            </span>
          </button>

          {/* Share Dialog Button */}
          <button
            onClick={handleShareClick}
            suppressHydrationWarning={true}
            className="flex flex-col items-center group pointer-events-auto cursor-pointer transition-transform duration-200 active:scale-75"
          >
            <div className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/10 group-hover:scale-105 transition-all duration-300">
              <Share2 className="w-5 h-5" />
            </div>
            <span className="text-xs text-white/95 mt-1 font-semibold drop-shadow-md">
              {sharesCount}
            </span>
          </button>

          {/* More Actions Menu Button (3 Dots) */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
              suppressHydrationWarning={true}
              className="flex flex-col items-center group pointer-events-auto cursor-pointer transition-transform duration-200 active:scale-75"
            >
              <div className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/10 group-hover:scale-105 transition-all duration-300">
                <MoreHorizontal className="w-5 h-5" />
              </div>
              <span className="text-xs text-white/95 mt-1 font-semibold drop-shadow-md">
                Thêm
              </span>
            </button>

            {/* Context Menu Dropdown */}
            {isMenuOpen && (
              <div className="absolute right-14 bottom-0 z-50 w-44 bg-black/90 backdrop-blur-xl border border-white/15 rounded-2xl p-2 shadow-2xl flex flex-col gap-1 text-white pointer-events-auto">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(window.location.origin + "?v=" + video.id);
                    alert("Đã sao chép liên kết video!");
                    setIsMenuOpen(false);
                  }}
                  suppressHydrationWarning={true}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Sao chép liên kết
                </button>
                
                {isMyVideo ? (
                  <button
                    onClick={handleDeleteVideo}
                    suppressHydrationWarning={true}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold bg-red-500/10 hover:bg-red-500/25 text-red-400 hover:text-red-300 transition-colors border border-red-500/15 cursor-pointer"
                  >
                    Xóa video
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      alert("Đã báo cáo video này!");
                      setIsMenuOpen(false);
                    }}
                    suppressHydrationWarning={true}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    Báo cáo video
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Spinning Music Vinyl Disc (Bottom Right, aligned with Music Marquee) */}
        <div className="absolute bottom-5 right-4 z-20 w-10 h-10 flex items-center justify-center pointer-events-auto">
          {/* Ambient music note emojis animation */}
          {isActive && (
            <>
              <div className="absolute text-[10px] text-brand-primary animate-note-float-1 select-none pointer-events-none opacity-0">🎵</div>
              <div className="absolute text-[10px] text-brand-secondary animate-note-float-2 select-none pointer-events-none opacity-0">🎶</div>
            </>
          )}
          <div
            className={`w-9 h-9 rounded-full bg-gradient-to-tr from-neutral-900 to-black border-2 border-slate-700 flex items-center justify-center shadow-lg shadow-black/80 ${
              isActive ? "animate-spin" : ""
            }`}
            style={{ animationDuration: "5s" }}
          >
            {/* Spinning disc middle label */}
            <div className="w-3 h-3 rounded-full bg-brand-primary border border-black" />
          </div>
        </div>
      </div>

      <ShareDialog
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        videoUrl={video.videoUrl}
      />
    </div>
  );
}
export type { FloatingHeart };
