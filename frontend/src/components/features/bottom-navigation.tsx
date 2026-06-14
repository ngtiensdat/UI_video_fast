"use client";

import React from "react";
import { Home, Compass, Plus, Users, User } from "lucide-react";
import { UI_LABELS } from "../../constants/labels";

interface BottomNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onUploadClick: () => void;
}

export function BottomNavigation({ activeTab, setActiveTab, onUploadClick }: BottomNavigationProps) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 border-t border-[var(--theme-border)] bg-[var(--theme-panel-bg)]/90 backdrop-blur-lg flex items-center justify-around px-4 z-40 text-[var(--theme-text-secondary)] select-none transition-all duration-300">
      {/* Home Tab */}
      <button
        onClick={() => setActiveTab("home")}
        suppressHydrationWarning
        className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-colors cursor-pointer ${
          activeTab === "home" ? "text-[var(--theme-text-primary)]" : "hover:text-[var(--theme-text-primary)]"
        }`}
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px] font-medium">{UI_LABELS.sidebar.home}</span>
      </button>

      {/* Discover Tab */}
      <button
        onClick={() => setActiveTab("explore")}
        suppressHydrationWarning
        className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-colors cursor-pointer ${
          activeTab === "explore" ? "text-[var(--theme-text-primary)]" : "hover:text-[var(--theme-text-primary)]"
        }`}
      >
        <Compass className="w-5 h-5" />
        <span className="text-[10px] font-medium">{UI_LABELS.sidebar.explore}</span>
      </button>

      {/* Special Center Plus Button (TikTok style) */}
      <button
        suppressHydrationWarning
        className="relative flex items-center justify-center w-12 h-8 mx-2 rounded-lg bg-[var(--theme-text-primary)] transition-transform duration-200 active:scale-95 cursor-pointer"
        onClick={onUploadClick}
      >
        {/* Neon blue and red backing layers */}
        <div className="absolute inset-y-0 -left-1 w-6 rounded-lg bg-brand-primary -z-10 translate-x-0.5 animate-pulse"></div>
        <div className="absolute inset-y-0 -right-1 w-6 rounded-lg bg-brand-secondary -z-10 -translate-x-0.5 animate-pulse"></div>
        <Plus className="w-5 h-5 text-[var(--theme-main-bg)] font-bold" />
      </button>

      {/* Following Tab */}
      <button
        onClick={() => setActiveTab("following")}
        suppressHydrationWarning
        className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-colors cursor-pointer ${
          activeTab === "following" ? "text-[var(--theme-text-primary)]" : "hover:text-[var(--theme-text-primary)]"
        }`}
      >
        <Users className="w-5 h-5" />
        <span className="text-[10px] font-medium">{UI_LABELS.sidebar.following}</span>
      </button>

      {/* Profile Tab */}
      <button
        onClick={() => setActiveTab("profile")}
        suppressHydrationWarning
        className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-colors cursor-pointer ${
          activeTab === "profile" ? "text-[var(--theme-text-primary)]" : "hover:text-[var(--theme-text-primary)]"
        }`}
      >
        <User className="w-5 h-5" />
        <span className="text-[10px] font-medium">{UI_LABELS.sidebar.profile}</span>
      </button>
    </nav>
  );
}
