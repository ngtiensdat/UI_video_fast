"use client";

import React, { useState, useEffect, useRef } from "react";
import { SidebarNavigation } from "../components/features/sidebar-navigation";
import { BottomNavigation } from "../components/features/bottom-navigation";
import { VideoFeed } from "../components/features/video-feed";
import { UI_LABELS } from "../constants/labels";
import { 
  Search, 
  Flame, 
  UserCheck, 
  Edit3, 
  Grid, 
  Heart, 
  Play, 
  ChevronRight, 
  Plus,
  Send,
  ArrowLeft,
  Circle,
  Sun,
  Moon,
  X
} from "lucide-react";
import { MOCK_VIDEOS } from "../constants/video-data";
import { VideoItem } from "../types";
import { 
  BASE_PROFILE_STATS,
  MOCK_PROFILE_VIDEOS,
  MOCK_FOLLOWED_ACCOUNTS,
  FriendItem,
  MOCK_FRIENDS_LIST,
  MOCK_CHAT_REPLIES,
  MOCK_UPLOAD_SUGGESTIONS
} from "../constants/mock-data";

interface ChatMessage {
  sender: "me" | "friend";
  text: string;
  timestamp: string;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>("home");
  const [userBio, setUserBio] = useState("Next.js Developer | Nguyễn Tiến Đạt - Bài kiểm tra đầu vào. Đang xây dựng giao diện looking video snap! 🚀✨");
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [tempBio, setTempBio] = useState(userBio);
  
  const [isLight, setIsLight] = useState(false);

  // Search & Video States
  const [searchQuery, setSearchQuery] = useState("");
  const [allVideosList, setAllVideosList] = useState<VideoItem[]>(MOCK_VIDEOS);
  
  // Upload States
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadUrl, setUploadUrl] = useState("");
  const [uploadDesc, setUploadDesc] = useState("");
  const [uploadMusic, setUploadMusic] = useState("");

  // Load & sync user uploaded videos
  useEffect(() => {
    const loadVideos = () => {
      const savedVideos = localStorage.getItem("looking_uploaded_videos");
      if (savedVideos) {
        try {
          const uploadedList: VideoItem[] = JSON.parse(savedVideos);
          if (Array.isArray(uploadedList)) {
            setAllVideosList([...MOCK_VIDEOS, ...uploadedList]);
            return;
          }
        } catch (e) {
          console.error("Failed to parse uploaded videos", e);
        }
      }
      setAllVideosList(MOCK_VIDEOS);
    };

    loadVideos();

    window.addEventListener("looking_video_uploaded", loadVideos);
    return () => {
      window.removeEventListener("looking_video_uploaded", loadVideos);
    };
  }, []);

  const handlePlaySearchedVideo = (videoId: string) => {
    setActiveTab("home");
    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent("looking_focus_video", {
          detail: { videoId }
        })
      );
    }, 150);
  };

  const handlePlayUploadedVideo = (videoId: string) => {
    setActiveTab("home");
    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent("looking_focus_video", {
          detail: { videoId }
        })
      );
    }, 150);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadUrl.trim() || !uploadDesc.trim()) return;

    const newVideo: VideoItem = {
      id: `uploaded-${Date.now()}`,
      videoUrl: uploadUrl.trim(),
      authorName: "@dat_nguyen_test",
      authorAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
      description: uploadDesc.trim(),
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
      musicName: uploadMusic.trim() || "Âm thanh gốc - @dat_nguyen_test",
    };

    const saved = localStorage.getItem("looking_uploaded_videos");
    let uploadedList: VideoItem[] = [];
    if (saved) {
      try {
        uploadedList = JSON.parse(saved);
      } catch (err) {
        console.error(err);
      }
    }
    uploadedList.unshift(newVideo);
    localStorage.setItem("looking_uploaded_videos", JSON.stringify(uploadedList));

    // Dispatch event to components
    window.dispatchEvent(new CustomEvent("looking_video_uploaded"));

    // Reset fields & close modal
    setUploadUrl("");
    setUploadDesc("");
    setUploadMusic("");
    setIsUploadModalOpen(false);
  };

  // Client-side theme check and event syncing
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("looking_theme");
      if (savedTheme === "light") {
        document.documentElement.classList.add("light");
        setIsLight(true);
      } else {
        document.documentElement.classList.remove("light");
        setIsLight(false);
      }
    }

    const handleThemeChange = (e: Event) => {
      const customEv = e as CustomEvent<{ theme: string }>;
      setIsLight(customEv.detail.theme === "light");
    };

    window.addEventListener("looking_theme_change", handleThemeChange);
    return () => {
      window.removeEventListener("looking_theme_change", handleThemeChange);
    };
  }, []);

  const toggleTheme = () => {
    const isCurrentlyLight = document.documentElement.classList.contains("light");
    if (isCurrentlyLight) {
      document.documentElement.classList.remove("light");
      localStorage.setItem("looking_theme", "dark");
      window.dispatchEvent(new CustomEvent("looking_theme_change", { detail: { theme: "dark" } }));
    } else {
      document.documentElement.classList.add("light");
      localStorage.setItem("looking_theme", "light");
      window.dispatchEvent(new CustomEvent("looking_theme_change", { detail: { theme: "light" } }));
    }
  };

  // Follow Sync States
  const [followedCreators, setFollowedCreators] = useState<string[]>([]);
  
  // Chat Sync States
  const [activeChatFriend, setActiveChatFriend] = useState<FriendItem | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [typeMessage, setTypeMessage] = useState("");
  const [isFriendTyping, setIsFriendTyping] = useState(false);
  
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Sync Follows and Bio from LocalStorage
  useEffect(() => {
    // 1. Followed creators
    const savedFollows = localStorage.getItem("looking_followed_users");
    if (savedFollows) {
      try {
        setFollowedCreators(JSON.parse(savedFollows));
      } catch (e) {
        console.error(e);
      }
    }

    // 2. Custom follow change event listener
    const handleFollowChange = (e: Event) => {
      const customEv = e as CustomEvent<{ authorName: string; followed: boolean }>;
      if (customEv.detail) {
        setFollowedCreators((prev) => {
          const exists = prev.includes(customEv.detail.authorName);
          if (customEv.detail.followed && !exists) {
            return [...prev, customEv.detail.authorName];
          }
          if (!customEv.detail.followed && exists) {
            return prev.filter((name) => name !== customEv.detail.authorName);
          }
          return prev;
        });
      }
    };

    window.addEventListener("looking_follow_change", handleFollowChange);
    return () => {
      window.removeEventListener("looking_follow_change", handleFollowChange);
    };
  }, []);

  // Sync Chats from LocalStorage when active friend changes
  useEffect(() => {
    if (!activeChatFriend) return;

    const storageKey = `looking_chat_${activeChatFriend.name}`;
    const savedChat = localStorage.getItem(storageKey);

    if (savedChat) {
      try {
        setChatMessages(JSON.parse(savedChat));
      } catch (e) {
        console.error(e);
      }
    } else {
      // Default Initial Conversations
      const defaultConvo: ChatMessage[] = [
        { 
          sender: "friend", 
          text: `Chào bạn! Mình là ${activeChatFriend.name}. Cảm ơn bạn đã ghé thăm trang của mình nhé! ✨`, 
          timestamp: "10:45 AM" 
        }
      ];
      setChatMessages(defaultConvo);
      localStorage.setItem(storageKey, JSON.stringify(defaultConvo));
    }
  }, [activeChatFriend]);

  // Scroll to bottom of chat logs
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isFriendTyping]);

  const handleSaveBio = (e: React.FormEvent) => {
    e.preventDefault();
    setUserBio(tempBio);
    setIsEditingBio(false);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typeMessage.trim() || !activeChatFriend) return;

    const myMsg: ChatMessage = {
      sender: "me",
      text: typeMessage.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMsgs = [...chatMessages, myMsg];
    setChatMessages(updatedMsgs);
    setTypeMessage("");

    const storageKey = `looking_chat_${activeChatFriend.name}`;
    localStorage.setItem(storageKey, JSON.stringify(updatedMsgs));

    // Simulated reply trigger (1s delay)
    setIsFriendTyping(true);
    setTimeout(() => {
      setIsFriendTyping(false);
      
      const randomReply = MOCK_CHAT_REPLIES[Math.floor(Math.random() * MOCK_CHAT_REPLIES.length)];

      const friendMsg: ChatMessage = {
        sender: "friend",
        text: randomReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const finalMsgs = [...updatedMsgs, friendMsg];
      setChatMessages(finalMsgs);
      localStorage.setItem(storageKey, JSON.stringify(finalMsgs));
    }, 1200);
  };

  const handleUnfollow = (creatorName: string) => {
    const updated = followedCreators.filter(name => name !== creatorName);
    setFollowedCreators(updated);
    localStorage.setItem("looking_followed_users", JSON.stringify(updated));

    // Dispatch global follow state change
    window.dispatchEvent(
      new CustomEvent("looking_follow_change", {
        detail: { authorName: creatorName, followed: false }
      })
    );
  };

  const handleFollowFromList = (creatorName: string) => {
    const updated = [...followedCreators, creatorName];
    setFollowedCreators(updated);
    localStorage.setItem("looking_followed_users", JSON.stringify(updated));

    // Dispatch global follow state change
    window.dispatchEvent(
      new CustomEvent("looking_follow_change", {
        detail: { authorName: creatorName, followed: true }
      })
    );
  };

  // 1. Explore View Component
  const renderExplore = () => {
    const query = searchQuery.toLowerCase().trim();
    const isSearching = query !== "";
    
    // Filter videos by query
    const filteredSearchVideos = allVideosList.filter((video) => {
      return (
        video.authorName.toLowerCase().includes(query) ||
        video.description.toLowerCase().includes(query) ||
        video.musicName.toLowerCase().includes(query)
      );
    });

    return (
      <div className="w-full h-full bg-[var(--theme-sub-bg)] flex flex-col p-5 overflow-y-auto scrollbar-none text-[var(--theme-text-primary)] animate-fade-in transition-all duration-300">
        {/* Header Search */}
        <div className="relative flex items-center gap-3 mb-6">
          <div className="relative flex-1 flex items-center">
            <Search className="absolute left-4 w-4 h-4 text-slate-400 font-bold" />
            <input
              type="text"
              placeholder="Tìm kiếm xu hướng, âm nhạc, hashtag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--theme-input-bg)] border border-[var(--theme-border)] rounded-full py-2.5 pl-11 pr-10 text-sm focus:outline-none focus:border-brand-primary focus:bg-[var(--theme-active-bg)] transition-all placeholder-slate-500 text-[var(--theme-text-primary)]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 p-1 rounded-full hover:bg-[var(--theme-hover-bg)] text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button
            onClick={toggleTheme}
            className="md:hidden p-2.5 rounded-full bg-[var(--theme-hover-bg)] border border-[var(--theme-border)] text-[var(--theme-text-primary)] hover:bg-[var(--theme-active-bg)] cursor-pointer"
          >
            {isLight ? <Sun className="w-4 h-4 text-yellow-500" /> : <Moon className="w-4 h-4 text-brand-primary" />}
          </button>
        </div>

        {!isSearching ? (
          <>
            {/* Banner */}
            <div className="relative rounded-2xl bg-gradient-to-r from-brand-secondary/45 to-brand-primary/45 border border-[var(--theme-border)] p-6 mb-6 overflow-hidden shadow-lg shadow-brand-secondary/5 select-none">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 rounded-full blur-2xl" />
              <span className="text-[10px] uppercase font-bold tracking-widest text-brand-primary bg-brand-primary/10 border border-brand-primary/30 px-2.5 py-0.5 rounded-full">
                HOT EVENT
              </span>
              <h2 className="text-xl font-black mt-3 mb-1 bg-gradient-to-r from-[var(--theme-text-primary)] to-[var(--theme-text-secondary)] bg-clip-text text-transparent">
                {UI_LABELS.appName.toUpperCase()} CREATORS 2026
              </h2>
              <p className="text-xs text-[var(--theme-text-secondary)] leading-relaxed max-w-[240px]">
                Sáng tạo video snap ngắn dạng dọc, thu hút ngàn lượt xem để rinh quà khủng.
              </p>
            </div>

            {/* Trending Badges */}
            <div className="flex gap-2 flex-wrap mb-6">
              {["#LookingVibes", "#CodeLife", "#MusicShorts", "#RetroSunset", "#Blender3D", "#NextJS"].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSearchQuery(tag)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[var(--theme-input-bg)] border border-[var(--theme-border)] hover:border-brand-primary hover:bg-[var(--theme-active-bg)] transition-all cursor-pointer text-[var(--theme-text-primary)]"
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Trending Categories */}
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-[var(--theme-text-secondary)] tracking-wide uppercase flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-brand-secondary" /> Xu hướng thịnh hành
              </h3>

              {[
                { title: "Kênh nhảy Freestyle nghệ thuật", count: "125.4K video", tag: "#DanceArt" },
                { title: "Dự án Next.js & TypeScript xịn", count: "98.2K video", tag: "#LookingApp" },
                { title: "Hoàng hôn lofi Chill", count: "64.1K video", tag: "#SunsetLofi" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => setSearchQuery(item.tag)}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--theme-input-bg)] border border-[var(--theme-border)] hover:bg-[var(--theme-active-bg)] hover:border-[var(--theme-text-secondary)] transition-all cursor-pointer group"
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-[var(--theme-text-primary)] group-hover:text-brand-primary transition-colors">
                      {item.tag}
                    </span>
                    <span className="text-[10px] text-[var(--theme-text-secondary)] mt-0.5">{item.title}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-[var(--theme-text-muted)] font-semibold">{item.count}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[var(--theme-text-muted)] group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          /* Search Results View */
          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between border-b border-[var(--theme-border)] pb-3.5 mb-4 select-none">
              <span className="text-xs font-semibold text-[var(--theme-text-secondary)]">
                Tìm thấy {filteredSearchVideos.length} kết quả
              </span>
              <button
                onClick={() => setSearchQuery("")}
                className="text-xs font-bold text-brand-primary hover:underline cursor-pointer"
              >
                Hủy lọc
              </button>
            </div>

            {filteredSearchVideos.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-16 text-center text-[var(--theme-text-secondary)] gap-3 animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-[var(--theme-hover-bg)] flex items-center justify-center text-[var(--theme-text-muted)] border border-[var(--theme-border)]">
                  <Search className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold mt-2">Không tìm thấy video nào</p>
                <p className="text-[10px] text-[var(--theme-text-muted)] max-w-[240px] leading-relaxed">
                  Hãy thử tìm kiếm với các từ khóa khác như tên kênh, hashtag (#CodeLife, #Sunset) hoặc bài hát.
                </p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="mt-2 px-5 py-2 rounded-full bg-[var(--theme-active-bg)] border border-[var(--theme-border)] text-xs font-bold hover:bg-[var(--theme-hover-bg)] transition-colors cursor-pointer text-[var(--theme-text-primary)]"
                >
                  Xóa tìm kiếm
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 pb-8 animate-fade-in">
                {filteredSearchVideos.map((video) => (
                  <div
                    key={video.id}
                    onClick={() => handlePlaySearchedVideo(video.id)}
                    className="relative rounded-xl overflow-hidden aspect-[9/16] border border-[var(--theme-border)] group cursor-pointer bg-black/40 hover:border-brand-primary transition-all"
                  >
                    <video
                      src={video.videoUrl}
                      muted
                      preload="metadata"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent flex flex-col justify-end p-2.5">
                      <span className="text-[10px] font-bold text-white truncate">{video.authorName}</span>
                      <p className="text-[9px] text-slate-300 line-clamp-2 mt-0.5 leading-normal">
                        {video.description}
                      </p>
                      <div className="flex items-center justify-between mt-1.5 text-[8px] text-slate-400 font-bold border-t border-white/5 pt-1">
                        <span className="flex items-center gap-0.5">
                          <Heart className="w-2.5 h-2.5 text-brand-secondary fill-current" /> {video.likesCount}
                        </span>
                        <span className="text-white/60">Xem ngay</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // 2. Following View Component (Synced with localStorage/video actions!)
  const renderFollowing = () => {
    const followedAccounts = MOCK_FOLLOWED_ACCOUNTS;

    return (
      <div className="w-full h-full bg-[var(--theme-sub-bg)] flex flex-col p-5 overflow-y-auto scrollbar-none text-[var(--theme-text-primary)] animate-fade-in transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-bold tracking-wide">Tài khoản đang follow</h2>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-brand-secondary/20 border border-brand-secondary/30 text-brand-secondary px-2.5 py-0.5 rounded-full font-bold">
              {followedCreators.length} Đã theo dõi
            </span>
            <button
              onClick={toggleTheme}
              className="md:hidden p-2 rounded-full bg-[var(--theme-hover-bg)] border border-[var(--theme-border)] text-[var(--theme-text-primary)] cursor-pointer"
            >
              {isLight ? <Sun className="w-3.5 h-3.5 text-yellow-500" /> : <Moon className="w-3.5 h-3.5 text-brand-primary" />}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {followedAccounts.map((item, idx) => {
            const isFollowed = followedCreators.includes(item.handle);
            return (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-[var(--theme-input-bg)] border border-[var(--theme-border-soft)] hover:border-[var(--theme-border)] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={item.avatar}
                      alt={item.name}
                      className={`w-11 h-11 rounded-full object-cover border ${
                        item.status === "live" ? "border-brand-secondary" : "border-[var(--theme-border)]"
                      } bg-slate-800`}
                    />
                    {item.status === "online" && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[var(--theme-sub-bg)]" />
                    )}
                    {item.status === "live" && (
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-brand-secondary text-[7px] font-bold px-1 rounded border border-black uppercase">
                        LIVE
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-[var(--theme-text-primary)]">{item.name}</span>
                    <span className={`text-[10px] mt-0.5 ${item.status === "live" ? "text-brand-secondary font-medium" : "text-[var(--theme-text-secondary)]"}`}>
                      {item.desc}
                    </span>
                  </div>
                </div>

                {isFollowed ? (
                  <button
                    onClick={() => handleUnfollow(item.handle)}
                    className="flex items-center gap-1 text-[10px] font-bold bg-[var(--theme-hover-bg)] hover:bg-red-950/20 hover:border-red-900 border border-[var(--theme-border)] hover:text-red-400 px-3 py-1.5 rounded-lg transition-colors cursor-pointer text-[var(--theme-text-secondary)]"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Đang follow</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleFollowFromList(item.handle)}
                    className="flex items-center gap-1 text-[10px] font-bold bg-brand-primary hover:brightness-110 text-black px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Follow</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // 3. Friends View & Active Chat Component (LocalStorage synced!)
  const renderFriends = () => {
    const friendsList: FriendItem[] = MOCK_FRIENDS_LIST;

    if (activeChatFriend) {
      // Chat Dialogue Panel
      return (
        <div className="w-full h-full bg-[var(--theme-sub-bg)] flex flex-col text-[var(--theme-text-primary)] animate-fade-in relative transition-all duration-300">
          {/* Top Panel Chat Header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-[var(--theme-border)] bg-[var(--theme-panel-bg)]">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveChatFriend(null)}
                className="p-1 rounded-full hover:bg-[var(--theme-hover-bg)] transition-colors text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="relative shrink-0">
                <img
                  src={activeChatFriend.avatar}
                  alt={activeChatFriend.name}
                  className="w-10 h-10 rounded-full object-cover border border-[var(--theme-border)]"
                />
                {activeChatFriend.online && (
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-[var(--theme-panel-bg)]" />
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold">{activeChatFriend.name}</span>
                <span className="text-[9px] text-[var(--theme-text-secondary)] flex items-center gap-1">
                  {activeChatFriend.online ? (
                    <>
                      <Circle className="w-1.5 h-1.5 fill-emerald-500 text-emerald-500" /> Trực tuyến
                    </>
                  ) : (
                    "Ngoại tuyến"
                  )}
                </span>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className="md:hidden p-2 rounded-full bg-[var(--theme-hover-bg)] border border-[var(--theme-border)] text-[var(--theme-text-primary)] cursor-pointer"
            >
              {isLight ? <Sun className="w-3.5 h-3.5 text-yellow-500" /> : <Moon className="w-3.5 h-3.5 text-brand-primary" />}
            </button>
          </div>

          {/* Messages Log area */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-thin scrollbar-thumb-[var(--theme-border)]">
            {chatMessages.map((msg, idx) => {
              const isMe = msg.sender === "me";
              return (
                <div
                  key={idx}
                  className={`flex ${isMe ? "justify-end" : "justify-start"} animate-fade-in`}
                >
                  <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs shadow-md leading-relaxed ${
                    isMe
                      ? "bg-gradient-to-tr from-brand-primary to-brand-secondary text-black font-semibold rounded-br-none"
                      : "bg-[var(--theme-hover-bg)] text-[var(--theme-text-primary)] rounded-bl-none border border-[var(--theme-border-soft)]"
                  }`}>
                    <p className="break-words">{msg.text}</p>
                    <span className={`block text-[8px] mt-1 text-right ${isMe ? "text-neutral-900" : "text-[var(--theme-text-secondary)]"}`}>
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Simulated typing status */}
            {isFriendTyping && (
              <div className="flex justify-start animate-pulse">
                <div className="bg-[var(--theme-input-bg)] border border-[var(--theme-border)] text-[var(--theme-text-secondary)] text-[10px] rounded-full px-4 py-2 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            
            <div ref={chatBottomRef} />
          </div>

          {/* Bottom Chat Message Input field */}
          <form
            onSubmit={handleSendMessage}
            className="p-4 border-t border-[var(--theme-border)] bg-[var(--theme-panel-bg)] flex gap-2.5 items-center"
          >
            <input
              type="text"
              placeholder="Nhập tin nhắn..."
              value={typeMessage}
              onChange={(e) => setTypeMessage(e.target.value)}
              className="flex-1 bg-[var(--theme-input-bg)] border border-[var(--theme-border)] rounded-full px-4 py-2 text-xs focus:outline-none focus:border-brand-primary text-[var(--theme-text-primary)]"
            />
            <button
              type="submit"
              disabled={!typeMessage.trim()}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                typeMessage.trim()
                  ? "bg-brand-primary text-black hover:brightness-110 active:scale-90"
                  : "bg-transparent text-slate-600 cursor-not-allowed"
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      );
    }

    return (
      <div className="w-full h-full bg-[var(--theme-sub-bg)] flex flex-col p-5 overflow-y-auto scrollbar-none text-[var(--theme-text-primary)] animate-fade-in transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-bold tracking-wide font-sans">Bạn bè trực tuyến</h2>
          <button
            onClick={toggleTheme}
            className="md:hidden p-2 rounded-full bg-[var(--theme-hover-bg)] border border-[var(--theme-border)] text-[var(--theme-text-primary)] cursor-pointer"
          >
            {isLight ? <Sun className="w-3.5 h-3.5 text-yellow-500" /> : <Moon className="w-3.5 h-3.5 text-brand-primary" />}
          </button>
        </div>

        <div className="space-y-4">
          {friendsList.map((friend, idx) => (
            <div
              key={idx}
              onClick={() => setActiveChatFriend(friend)}
              className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--theme-input-bg)] border border-[var(--theme-border-soft)] hover:bg-[var(--theme-hover-bg)] hover:border-[var(--theme-border)] transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={friend.avatar}
                    alt={friend.name}
                    className="w-11 h-11 rounded-full object-cover border border-[var(--theme-border)] bg-slate-800"
                  />
                  {friend.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[var(--theme-sub-bg)]" />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[var(--theme-text-primary)] group-hover:text-brand-primary transition-colors">
                    {friend.name}
                  </span>
                  <span className="text-[10px] text-[var(--theme-text-secondary)] mt-0.5 line-clamp-1">
                    {friend.msg}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1">
                <span className="text-[9px] text-[var(--theme-text-muted)] font-semibold">{friend.time}</span>
                <span className="text-[9px] font-bold text-brand-primary opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-wider">
                  Trò chuyện
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 4. Profile View Component
  const renderProfile = () => {
    const myUploadedVideos = allVideosList.filter(v => v.authorName === BASE_PROFILE_STATS.authorName);
    const uploadedLikesSum = myUploadedVideos.reduce((acc, curr) => acc + curr.likesCount, 0);
    const totalLikesVal = BASE_PROFILE_STATS.likesBase + uploadedLikesSum; // Start at popular likes base and sync dynamics

    return (
      <div className="w-full h-full bg-[var(--theme-sub-bg)] flex flex-col p-5 overflow-y-auto scrollbar-none text-[var(--theme-text-primary)] animate-fade-in transition-all duration-300">
        {/* Header Profile */}
        <div className="flex flex-col items-center text-center mt-4 mb-6 select-none relative">
          <button
            onClick={toggleTheme}
            className="absolute right-0 top-0 p-2 rounded-full bg-[var(--theme-hover-bg)] border border-[var(--theme-border)] text-[var(--theme-text-primary)] cursor-pointer"
          >
            {isLight ? <Sun className="w-4 h-4 text-yellow-500" /> : <Moon className="w-4 h-4 text-brand-primary" />}
          </button>
          <div className="relative p-1 rounded-full bg-gradient-to-tr from-brand-secondary to-brand-primary">
            <img
              src={BASE_PROFILE_STATS.defaultAvatar}
              alt="User avatar"
              className="w-20 h-20 rounded-full object-cover border-2 border-[var(--theme-sub-bg)]"
            />
          </div>
          <h2 className="text-base font-bold mt-3">{BASE_PROFILE_STATS.authorName}</h2>
          <span className="text-[10px] font-semibold tracking-wider text-[var(--theme-text-secondary)] bg-[var(--theme-input-bg)] border border-[var(--theme-border)] px-2.5 py-0.5 rounded mt-1.5 uppercase">
            DEVELOPER ACCOUNT
          </span>
        </div>

        {/* Stats Counter Bar (Decoupled Following stat synced with followedCreators!) */}
        <div className="grid grid-cols-3 gap-2 bg-[var(--theme-input-bg)] border border-[var(--theme-border)] rounded-xl p-3.5 mb-6 text-center select-none">
          <div>
            <span className="block text-sm font-bold text-brand-primary">{BASE_PROFILE_STATS.followedBase + followedCreators.length}</span>
            <span className="text-[9px] text-[var(--theme-text-secondary)] font-medium">Đang follow</span>
          </div>
          <div className="border-x border-[var(--theme-border)]">
            <span className="block text-sm font-bold text-[var(--theme-text-primary)]">{BASE_PROFILE_STATS.followers}</span>
            <span className="text-[9px] text-[var(--theme-text-secondary)] font-medium">Follower</span>
          </div>
          <div>
            <span className="block text-sm font-bold text-brand-secondary">
              {totalLikesVal >= 1000 ? `${(totalLikesVal / 1000).toFixed(1)}K` : totalLikesVal}
            </span>
            <span className="text-[9px] text-[var(--theme-text-secondary)] font-medium">Lượt thích</span>
          </div>
        </div>

        {/* Upload Video Button */}
        <div className="mb-6">
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-black font-bold text-xs hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-brand-secondary/10"
          >
            <Plus className="w-4 h-4" /> Đăng video mới
          </button>
        </div>

        {/* Bio Segment */}
        <div className="mb-6 bg-[var(--theme-input-bg)] border border-[var(--theme-border)] rounded-xl p-4">
          <div className="flex justify-between items-center mb-2.5">
            <span className="text-xs font-bold text-[var(--theme-text-secondary)]">Tiểu sử</span>
            {!isEditingBio ? (
              <button
                onClick={() => {
                  setTempBio(userBio);
                  setIsEditingBio(true);
                }}
                className="text-[10px] font-bold text-brand-primary flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Edit3 className="w-3 h-3" /> Chỉnh sửa
              </button>
            ) : null}
          </div>

          {isEditingBio ? (
            <form onSubmit={handleSaveBio} className="flex flex-col gap-2">
              <textarea
                value={tempBio}
                onChange={(e) => setTempBio(e.target.value)}
                className="w-full bg-[var(--theme-active-bg)] border border-[var(--theme-border)] rounded-lg p-2 text-xs focus:outline-none focus:border-brand-primary text-[var(--theme-text-primary)] resize-none h-16 leading-relaxed"
                maxLength={120}
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsEditingBio(false)}
                  className="px-3 py-1 bg-[var(--theme-hover-bg)] hover:bg-[var(--theme-active-bg)] text-[var(--theme-text-secondary)] text-[10px] font-bold rounded-lg cursor-pointer transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 bg-gradient-to-r from-brand-primary to-brand-secondary text-black text-[10px] font-bold rounded-lg cursor-pointer hover:brightness-110 transition-all"
                >
                  Lưu
                </button>
              </div>
            </form>
          ) : (
            <p className="text-xs text-[var(--theme-text-secondary)] leading-relaxed font-medium break-words">
              {userBio}
            </p>
          )}
        </div>

        {/* Profile Video Grid Mock */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-[var(--theme-text-secondary)] tracking-wide uppercase flex items-center gap-1.5">
            <Grid className="w-4 h-4 text-brand-primary" /> Video đã tải lên ({2 + myUploadedVideos.length})
          </span>

          <div className="grid grid-cols-2 gap-3 pb-6">
            {MOCK_PROFILE_VIDEOS.map((v) => (
              <div
                key={v.id}
                onClick={() => handlePlayUploadedVideo(v.id)}
                className="relative rounded-xl overflow-hidden aspect-video border border-[var(--theme-border)] group cursor-pointer bg-black/40 hover:border-brand-primary transition-colors"
              >
                <img
                  src={v.img}
                  alt={v.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 bg-slate-800"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2.5">
                  <span className="text-[10px] font-bold text-white truncate">{v.title}</span>
                  <div className="flex items-center justify-between mt-1 text-[8px] text-slate-400 font-bold">
                    <span className="flex items-center gap-0.5">
                      <Play className="w-2.5 h-2.5 text-brand-primary fill-current" /> {v.views}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Heart className="w-2.5 h-2.5 text-brand-secondary fill-current" /> {v.likes}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {myUploadedVideos.map((v) => (
              <div
                key={v.id}
                onClick={() => handlePlayUploadedVideo(v.id)}
                className="relative rounded-xl overflow-hidden aspect-video border border-[var(--theme-border)] group cursor-pointer bg-black/45 hover:border-brand-primary transition-all"
              >
                <video
                  src={v.videoUrl}
                  muted
                  preload="metadata"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent flex flex-col justify-end p-2.5">
                  <span className="text-[10px] font-bold text-white truncate">
                    {v.description.split("#")[0].trim() || "Video tải lên"}
                  </span>
                  <div className="flex items-center justify-between mt-1 text-[8px] text-slate-400 font-bold">
                    <span className="flex items-center gap-0.5">
                      <Play className="w-2.5 h-2.5 text-brand-primary fill-current" /> Xem ngay
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Heart className="w-2.5 h-2.5 text-brand-secondary fill-current" /> {v.likesCount}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex w-full h-screen bg-[var(--theme-main-bg)] text-[var(--theme-text-primary)] overflow-hidden transition-all duration-300">
      {/* Hidden screen-reader only H1 tag for SEO compliance */}
      <h1 className="sr-only">
        {UI_LABELS.appName} - {UI_LABELS.sidebar.home}
      </h1>

      {/* Desktop Left Sidebar Navigation */}
      <SidebarNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center relative bg-[var(--theme-main-bg)] transition-all duration-300">
        {/* Decorative Neon background elements (Desktop) */}
        <div className="hidden md:block absolute top-10 left-1/4 w-72 h-72 bg-brand-primary/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="hidden md:block absolute bottom-10 right-1/4 w-72 h-72 bg-brand-secondary/5 rounded-full blur-[120px] pointer-events-none" />

        {/* Dynamic Snapping Viewport Frame */}
        {/* On Mobile: fills screen (w-full h-full) */}
        {/* On PC: max-w-[420px], h-[92vh], rounded corners, glass shadow border */}
        <div className="w-full h-full md:max-w-[420px] md:h-[92vh] md:rounded-2xl border-0 md:border md:border-[var(--theme-border)] bg-[var(--card-bg)] md:shadow-[0_0_40px_rgba(139,92,246,0.08)] overflow-hidden relative transition-all duration-300">
          
          {activeTab === "home" && <VideoFeed />}
          {activeTab === "explore" && renderExplore()}
          {activeTab === "following" && renderFollowing()}
          {activeTab === "friends" && renderFriends()}
          {activeTab === "profile" && renderProfile()}

          {/* SIMULATED UPLOAD MODAL INSIDE VIEWPORT FRAME */}
          {isUploadModalOpen && (
            <div className="absolute inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in text-[var(--theme-text-primary)]">
              <div className="w-full max-w-sm bg-[var(--theme-panel-bg)] border border-[var(--theme-border)] rounded-2xl p-5 shadow-2xl flex flex-col gap-4">
                
                {/* Modal Header */}
                <div className="flex justify-between items-center pb-2 border-b border-[var(--theme-border)]">
                  <h3 className="font-bold text-sm text-[var(--theme-text-primary)]">Đăng video mới</h3>
                  <button
                    onClick={() => setIsUploadModalOpen(false)}
                    className="p-1 rounded-full hover:bg-[var(--theme-hover-bg)] text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Quick Sample Suggestions */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] text-[var(--theme-text-secondary)] font-bold uppercase tracking-wider">Chọn video mẫu nhanh:</span>
                  <div className="flex gap-1.5 flex-wrap">
                    {MOCK_UPLOAD_SUGGESTIONS.map((sug) => (
                      <button
                        key={sug.label}
                        type="button"
                        onClick={() => {
                          setUploadUrl(sug.url);
                          setUploadDesc(sug.desc);
                          setUploadMusic(sug.music);
                        }}
                        className="text-[9px] font-semibold px-2.5 py-1.5 bg-[var(--theme-input-bg)] hover:bg-[var(--theme-active-bg)] border border-[var(--theme-border)] rounded-full transition-all cursor-pointer text-[var(--theme-text-secondary)] hover:text-brand-primary hover:border-brand-primary"
                      >
                        {sug.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Upload Form */}
                <form onSubmit={handleUploadSubmit} className="flex flex-col gap-3.5">
                  
                  {/* Video URL Input */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-[var(--theme-text-secondary)] uppercase tracking-wider">
                      Đường dẫn video (URL)
                    </label>
                    <input
                      type="url"
                      placeholder="https://example.com/video.mp4"
                      value={uploadUrl}
                      onChange={(e) => setUploadUrl(e.target.value)}
                      required
                      className="w-full bg-[var(--theme-input-bg)] border border-[var(--theme-border)] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-primary focus:bg-[var(--theme-active-bg)] transition-all text-[var(--theme-text-primary)]"
                    />
                  </div>

                  {/* Description Input */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-[var(--theme-text-secondary)] uppercase tracking-wider">
                      Mô tả / Hashtag
                    </label>
                    <textarea
                      placeholder="Nhập mô tả cho video của bạn... #chill #codelife"
                      value={uploadDesc}
                      onChange={(e) => setUploadDesc(e.target.value)}
                      required
                      className="w-full h-16 bg-[var(--theme-input-bg)] border border-[var(--theme-border)] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-primary focus:bg-[var(--theme-active-bg)] transition-all text-[var(--theme-text-primary)] resize-none"
                    />
                  </div>

                  {/* Music Name Input */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-[var(--theme-text-secondary)] uppercase tracking-wider">
                      Tên âm nhạc
                    </label>
                    <input
                      type="text"
                      placeholder="Âm thanh gốc - @dat_nguyen_test"
                      value={uploadMusic}
                      onChange={(e) => setUploadMusic(e.target.value)}
                      className="w-full bg-[var(--theme-input-bg)] border border-[var(--theme-border)] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-primary focus:bg-[var(--theme-active-bg)] transition-all text-[var(--theme-text-primary)]"
                    />
                  </div>

                  {/* Submit / Cancel Buttons */}
                  <div className="flex gap-2 justify-end pt-2 border-t border-[var(--theme-border)]">
                    <button
                      type="button"
                      onClick={() => setIsUploadModalOpen(false)}
                      className="px-4 py-2 bg-[var(--theme-hover-bg)] hover:bg-[var(--theme-active-bg)] text-[var(--theme-text-secondary)] text-xs font-bold rounded-xl cursor-pointer transition-colors"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      disabled={!uploadUrl.trim() || !uploadDesc.trim()}
                      className="px-5 py-2 bg-gradient-to-r from-brand-primary to-brand-secondary text-black text-xs font-bold rounded-xl hover:brightness-110 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Đăng ngay
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
