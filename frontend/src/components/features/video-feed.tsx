"use client";

import React, { useState, useEffect, useRef } from "react";
import { Users } from "lucide-react";
import { MOCK_VIDEOS } from "../../constants/video-data";
import { VideoItem } from "../../types";
import { VideoCard } from "./video-card";
import { useIntersectionObserver } from "../../hooks/use-intersection-observer";
import { CommentsDrawer } from "./comments-drawer";

interface FeedItemWrapperProps {
  video: VideoItem;
  isActive: boolean;
  onActive: (id: string) => void;
  onToggleComments: () => void;
}

function FeedItemWrapper({
  video,
  isActive,
  onActive,
  onToggleComments,
}: FeedItemWrapperProps) {
  const [ref, isIntersecting] = useIntersectionObserver({
    threshold: 0.6,
  });

  useEffect(() => {
    if (isIntersecting) {
      onActive(video.id);
    }
  }, [isIntersecting, video.id, onActive]);

  return (
    <div
      ref={ref}
      className="w-full h-full snap-start snap-always shrink-0 relative"
    >
      <VideoCard
        video={video}
        isActive={isActive}
        onToggleComments={onToggleComments}
      />
    </div>
  );
}

export function VideoFeed() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const [allVideos, setAllVideos] = useState<VideoItem[]>(MOCK_VIDEOS);
  const [activeVideoId, setActiveVideoId] = useState<string>("");
  const [isCommentsOpen, setIsCommentsOpen] = useState<boolean>(false);
  const [feedType, setFeedType] = useState<"for-you" | "following">("for-you");
  const [followedCreators, setFollowedCreators] = useState<string[]>([]);

  // 1. Load merged video list (mock videos + uploaded user videos) on mount and on changes
  useEffect(() => {
    const loadVideosAndFollows = () => {
      // Load uploaded videos
      const savedVideos = localStorage.getItem("looking_uploaded_videos");
      let mergedVideos = [...MOCK_VIDEOS];
      if (savedVideos) {
        try {
          const uploadedList: VideoItem[] = JSON.parse(savedVideos);
          if (Array.isArray(uploadedList)) {
            mergedVideos = [...MOCK_VIDEOS, ...uploadedList];
          }
        } catch (e) {
          console.error("Failed to parse uploaded videos", e);
        }
      }
      setAllVideos(mergedVideos);

      // Load followed users
      const savedFollows = localStorage.getItem("looking_followed_users");
      if (savedFollows) {
        try {
          setFollowedCreators(JSON.parse(savedFollows));
        } catch (e) {
          console.error("Failed to parse followed list", e);
        }
      }
    };

    loadVideosAndFollows();

    const handleVideoUpload = () => loadVideosAndFollows();
    const handleFollowChange = () => loadVideosAndFollows();

    window.addEventListener("looking_video_uploaded", handleVideoUpload);
    window.addEventListener("looking_follow_change", handleFollowChange);

    return () => {
      window.removeEventListener("looking_video_uploaded", handleVideoUpload);
      window.removeEventListener("looking_follow_change", handleFollowChange);
    };
  }, []);

  // 2. Auto scroll snap to a target video when search matches
  useEffect(() => {
    const handleFocusVideo = (e: Event) => {
      const customEv = e as CustomEvent<{ videoId: string }>;
      if (customEv.detail && customEv.detail.videoId) {
        const id = customEv.detail.videoId;
        setFeedType("for-you");
        setActiveVideoId(id);
        
        // Find index of targeted video
        const index = allVideos.findIndex((v) => v.id === id);
        if (index !== -1 && scrollContainerRef.current) {
          const container = scrollContainerRef.current;
          setTimeout(() => {
            const targetChild = container.children[index] as HTMLElement;
            if (targetChild) {
              targetChild.scrollIntoView({ behavior: "smooth", block: "start" });
            }
          }, 150);
        }
      }
    };

    window.addEventListener("looking_focus_video", handleFocusVideo);
    return () => {
      window.removeEventListener("looking_focus_video", handleFocusVideo);
    };
  }, [allVideos]);

  // 3. Set the first active video ID based on filtered items
  const filteredVideos = allVideos.filter((video) => {
    if (feedType === "following") {
      return followedCreators.includes(video.authorName);
    }
    return true;
  });

  useEffect(() => {
    if (filteredVideos.length > 0) {
      // If current active video is not in the filtered list, reset it to the first item
      const isActiveStillValid = filteredVideos.some((v) => v.id === activeVideoId);
      if (!isActiveStillValid) {
        setActiveVideoId(filteredVideos[0].id);
      }
    } else {
      setActiveVideoId("");
    }
  }, [feedType, filteredVideos, activeVideoId]);

  return (
    <div id="video-feed-root" className="relative w-full h-full overflow-hidden bg-black">
      {/* Top Feed Tabs Selector Overlay */}
      <div className="absolute top-4 left-0 right-0 z-30 flex justify-center gap-6 select-none pointer-events-none">
        <button
          onClick={() => setFeedType("for-you")}
          className={`text-sm font-bold tracking-wide transition-all cursor-pointer relative py-1 pointer-events-auto filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] ${
            feedType === "for-you"
              ? "text-white scale-105"
              : "text-white/60 hover:text-white"
          }`}
        >
          Dành cho bạn
          {feedType === "for-you" && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-brand-primary rounded-full shadow-[0_0_8px_var(--brand-primary)]" />
          )}
        </button>
        <button
          onClick={() => setFeedType("following")}
          className={`text-sm font-bold tracking-wide transition-all cursor-pointer relative py-1 pointer-events-auto filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] ${
            feedType === "following"
              ? "text-white scale-105"
              : "text-white/60 hover:text-white"
          }`}
        >
          Đang theo dõi
          {feedType === "following" && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-brand-secondary rounded-full shadow-[0_0_8px_var(--brand-secondary)]" />
          )}
        </button>
      </div>

      {filteredVideos.length === 0 ? (
        <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-[var(--theme-sub-bg)] text-center select-none text-[var(--theme-text-primary)] gap-4 animate-fade-in transition-all duration-300">
          <div className="w-20 h-20 rounded-full bg-[var(--theme-hover-bg)] flex items-center justify-center text-[var(--theme-text-secondary)] border border-[var(--theme-border)] shadow-lg shadow-brand-primary/5">
            <Users className="w-8 h-8 text-brand-primary" />
          </div>
          <h3 className="font-bold text-base tracking-wide">Chưa follow người sáng tạo nào</h3>
          <p className="text-xs text-[var(--theme-text-secondary)] max-w-[280px] leading-relaxed">
            Nhấn chuyển sang mục <strong>"Dành cho bạn"</strong> hoặc sang mục <strong>"Khám phá"</strong> để follow những nhà sáng tạo nội dung đầu tiên!
          </p>
          <button
            onClick={() => setFeedType("for-you")}
            className="mt-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary text-black font-bold text-xs hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer"
          >
            Xem Dành cho bạn
          </button>
        </div>
      ) : (
        /* Scroll Snap Feed Container */
        <div
          ref={scrollContainerRef}
          className={`w-full h-full snap-y snap-mandatory scroll-smooth scrollbar-none ${
            isCommentsOpen ? "overflow-y-hidden" : "overflow-y-scroll"
          }`}
        >
          {filteredVideos.map((video) => (
            <FeedItemWrapper
              key={video.id}
              video={video}
              isActive={video.id === activeVideoId}
              onActive={(id) => setActiveVideoId(id)}
              onToggleComments={() => setIsCommentsOpen((prev) => !prev)}
            />
          ))}
        </div>
      )}

      {/* Global Comments Drawer at feed level */}
      {activeVideoId && (
        <CommentsDrawer
          videoId={activeVideoId}
          isOpen={isCommentsOpen}
          onClose={() => setIsCommentsOpen(false)}
        />
      )}
    </div>
  );
}

export { FeedItemWrapper };
