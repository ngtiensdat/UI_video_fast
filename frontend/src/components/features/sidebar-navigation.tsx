"use client";

import React, { useState, useEffect } from "react";
import { Home, Compass, Users, User, Flame, Sun, Moon } from "lucide-react";
import { UI_LABELS } from "../../constants/labels";

interface SidebarNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function SidebarNavigation({ activeTab, setActiveTab }: SidebarNavigationProps) {
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isThemeLight = document.documentElement.classList.contains("light");
      const timer = setTimeout(() => setIsLight(isThemeLight), 0);
      
      const handleThemeChange = (e: Event) => {
        const customEv = e as CustomEvent<{ theme: string }>;
        setIsLight(customEv.detail.theme === "light");
      };

      window.addEventListener("looking_theme_change", handleThemeChange);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("looking_theme_change", handleThemeChange);
      };
    }
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

  const menuItems = [
    { id: "home", label: UI_LABELS.sidebar.home, icon: Home },
    { id: "explore", label: UI_LABELS.sidebar.explore, icon: Compass },
    { id: "following", label: UI_LABELS.sidebar.following, icon: Users },
    { id: "friends", label: UI_LABELS.sidebar.friends, icon: Flame },
    { id: "profile", label: UI_LABELS.sidebar.profile, icon: User },
  ];

  return (
    <aside className="hidden md:flex flex-col w-20 lg:w-64 h-screen border-r border-[var(--theme-border)] bg-[var(--theme-panel-bg)]/95 backdrop-blur-md text-[var(--theme-text-primary)] p-4 lg:p-6 justify-between select-none fixed left-0 top-0 z-40 transition-all duration-300">
      <div className="space-y-8">
        {/* Brand Logo & Icon */}
        <div className="flex items-center gap-3 px-2 justify-center lg:justify-start">
          <img
            src="/logo.svg"
            alt="Looking Logo"
            className="w-10 h-10 object-contain shrink-0 filter drop-shadow-[0_0_8px_rgba(139,92,246,0.3)] hover:scale-105 transition-transform duration-300 cursor-pointer"
            onClick={() => setActiveTab("home")}
          />
          <span className="hidden lg:block text-xl font-extrabold tracking-widest bg-gradient-to-r from-brand-primary via-[var(--theme-text-primary)] to-brand-secondary bg-clip-text text-transparent">
            {UI_LABELS.appName.toUpperCase()}
          </span>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                suppressHydrationWarning
                className={`flex items-center gap-4 w-full justify-center lg:justify-start px-3 lg:px-4 py-3.5 rounded-xl transition-all duration-300 group cursor-pointer ${
                  isActive
                    ? "bg-[var(--theme-active-bg)] text-brand-primary border-l-0 lg:border-l-4 lg:border-brand-primary shadow-lg shadow-brand-primary/5"
                    : "text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] hover:bg-[var(--theme-hover-bg)]"
                }`}
                title={item.label}
              >
                <Icon
                  className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 shrink-0 ${
                    isActive ? "text-brand-primary" : "group-hover:text-[var(--theme-text-primary)]"
                  }`}
                />
                <span className="hidden lg:block font-medium text-sm tracking-wide">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
 
      {/* Footer Info */}
      <div className="border-t border-[var(--theme-border-soft)] pt-6 text-xs text-[var(--theme-text-muted)] space-y-4 text-center lg:text-left">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          suppressHydrationWarning
          className="flex items-center gap-4 w-full justify-center lg:justify-start px-3 py-3 rounded-xl text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)] hover:bg-[var(--theme-hover-bg)] transition-colors cursor-pointer border border-[var(--theme-border)]"
        >
          {isLight ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-cyan-400" />}
          <span className="hidden lg:block font-medium text-sm">Chế độ {isLight ? "sáng" : "tối"}</span>
        </button>

        <p className="hidden lg:block">© 2026 {UI_LABELS.appName}</p>
        <p className="hover:text-[var(--theme-text-primary)] cursor-pointer transition-colors text-[10px] lg:text-xs">Vercel</p>
      </div>
    </aside>
  );
}
