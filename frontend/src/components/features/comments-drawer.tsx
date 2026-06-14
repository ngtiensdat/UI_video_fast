"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Heart, Send } from "lucide-react";
import { UI_LABELS } from "../../constants/labels";
import { INITIAL_COMMENTS_MAP, LOCAL_STORAGE_COMMENT_PREFIX } from "../../constants/video-data";
import { CommentItem } from "../../types";

interface CommentsDrawerProps {
  videoId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function CommentsDrawer({
  videoId,
  isOpen,
  onClose,
}: CommentsDrawerProps) {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [newCommentText, setNewCommentText] = useState("");
  const [shouldRender, setShouldRender] = useState(isOpen);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Load comments on open or when active videoId changes
  useEffect(() => {
    if (isOpen && videoId) {
      const timer = setTimeout(() => {
        setShouldRender(true);
        const storageKey = `${LOCAL_STORAGE_COMMENT_PREFIX}${videoId}`;
        const saved = localStorage.getItem(storageKey);
        
        if (saved) {
          try {
            setComments(JSON.parse(saved));
          } catch (e) {
            console.error("Failed to parse comments from localStorage", e);
            setComments(INITIAL_COMMENTS_MAP[videoId] || []);
          }
        } else {
          const initial = INITIAL_COMMENTS_MAP[videoId] || [];
          setComments(initial);
          localStorage.setItem(storageKey, JSON.stringify(initial));
        }
      }, 0);
      return () => clearTimeout(timer);
    } else if (!isOpen) {
      // Allow slide-down animation to complete before unmounting
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, videoId]);

  if (!shouldRender) return null;

  const handleLikeComment = (commentId: string) => {
    setComments((prev) => {
      const updated = prev.map((c) => {
        if (c.id === commentId) {
          const isLiked = !c.isLiked;
          return {
            ...c,
            isLiked,
            likesCount: isLiked ? c.likesCount + 1 : c.likesCount - 1,
          };
        }
        return c;
      });
      
      localStorage.setItem(
        `${LOCAL_STORAGE_COMMENT_PREFIX}${videoId}`,
        JSON.stringify(updated)
      );
      return updated;
    });
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const newComment: CommentItem = {
      id: `c-user-${Date.now()}`,
      authorName: "@khach_ghe_tham",
      authorAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop",
      content: newCommentText.trim(),
      createdAt: "Vừa xong",
      likesCount: 0,
      isLiked: false,
    };

    setComments((prev) => {
      const updated = [newComment, ...prev];
      localStorage.setItem(
        `${LOCAL_STORAGE_COMMENT_PREFIX}${videoId}`,
        JSON.stringify(updated)
      );
      // Notify components about the updated comments count
      window.dispatchEvent(
        new CustomEvent("looking_comments_count_update", {
          detail: { videoId, count: updated.length }
        })
      );
      return updated;
    });
    
    setNewCommentText("");

    // Scroll to top of list after posting
    setTimeout(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
    }, 100);
  };

  return (
    <div
      className={`absolute inset-x-0 bottom-0 z-40 w-full h-[65vh] bg-[var(--theme-comment-bg)] border-t border-[var(--theme-border)] rounded-t-2xl flex flex-col text-[var(--theme-text-primary)] shadow-2xl transition-transform duration-300 ease-out ${
        isOpen ? "translate-y-0" : "translate-y-full"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-[var(--theme-border)]">
        <div className="flex items-center gap-2">
          <span className="font-semibold tracking-wide">{UI_LABELS.comments.title}</span>
          <span className="text-xs bg-[var(--theme-hover-bg)] border border-[var(--theme-border)] px-2 py-0.5 rounded-full text-[var(--theme-text-secondary)]">
            {comments.length}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-[var(--theme-hover-bg)] text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Comments List */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-4 py-2 space-y-4 scrollbar-thin scrollbar-thumb-[var(--theme-border)] scrollbar-track-transparent"
      >
        {comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-[var(--theme-text-muted)] text-sm py-12 text-center">
            <p>{UI_LABELS.comments.noComments}</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 items-start animate-fade-in group">
              <img
                src={comment.authorAvatar}
                alt={comment.authorName}
                className="w-8 h-8 rounded-full object-cover border border-[var(--theme-border)] bg-slate-800"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-bold hover:underline cursor-pointer">
                    {comment.authorName}
                  </span>
                  <span className="text-[10px] text-[var(--theme-text-muted)]">{comment.createdAt}</span>
                </div>
                <p className="text-xs mt-1 text-[var(--theme-text-secondary)] leading-relaxed break-words">
                  {comment.content}
                </p>
                <button className="text-[10px] text-[var(--theme-text-muted)] font-semibold mt-1 hover:text-[var(--theme-text-primary)] cursor-pointer">
                  {UI_LABELS.comments.reply}
                </button>
              </div>
              <button
                onClick={() => handleLikeComment(comment.id)}
                className={`flex flex-col items-center gap-0.5 shrink-0 transition-transform duration-200 active:scale-75 cursor-pointer ${
                  comment.isLiked ? "text-red-500" : "text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)]"
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${comment.isLiked ? "fill-current" : ""}`} />
                <span className="text-[9px] font-semibold">{comment.likesCount}</span>
              </button>
            </div>
          ))
        )}
      </div>

      {/* Input Bar */}
      <form
        onSubmit={handlePostComment}
        className="p-4 border-t border-[var(--theme-border)] bg-[var(--theme-comment-bg)] flex gap-3 items-center sticky bottom-0"
      >
        <img
          src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop"
          alt="User avatar"
          className="w-8 h-8 rounded-full object-cover border border-[var(--theme-border)]"
        />
        <div className="flex-1 relative flex items-center bg-[var(--theme-input-bg)] border border-[var(--theme-border)] rounded-full py-1.5 pl-4 pr-10 focus-within:border-brand-primary focus-within:bg-[var(--theme-active-bg)] transition-all">
          <input
            type="text"
            placeholder={UI_LABELS.comments.placeholder}
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            className="bg-transparent text-xs text-[var(--theme-text-primary)] placeholder-slate-500 focus:outline-none w-full pr-2"
          />
          <button
            type="submit"
            disabled={!newCommentText.trim()}
            className={`absolute right-1 w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              newCommentText.trim()
                ? "bg-brand-primary text-black hover:brightness-110 active:scale-90"
                : "bg-transparent text-[var(--theme-text-muted)] cursor-not-allowed"
            }`}
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
}
