"use client";

import React, { useState, useEffect } from "react";
import { X, Link, Send, Check } from "lucide-react";
import { UI_LABELS } from "../../constants/labels";

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
    </svg>
  );
}

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
}

export function ShareDialog({ isOpen, onClose, videoUrl }: ShareDialogProps) {
  const [copied, setCopied] = useState(false);
  const [shouldRender, setShouldRender] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setShouldRender(true), 0);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(videoUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link", err);
    }
  };

  const shareOptions = [
    { name: UI_LABELS.share.facebook, icon: FacebookIcon, color: "bg-blue-600 hover:bg-blue-700" },
    { name: UI_LABELS.share.messenger, icon: Send, color: "bg-sky-500 hover:bg-sky-600" },
    { name: UI_LABELS.share.twitter, icon: TwitterIcon, color: "bg-neutral-800 hover:bg-neutral-900 border border-white/10" },
  ];

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
      />

      {/* Panel */}
      <div
        className={`relative w-full md:max-w-md bg-[#16161a] border-t md:border border-white/10 rounded-t-2xl md:rounded-2xl p-6 text-white shadow-2xl z-10 transition-transform duration-300 ease-out ${
          isOpen ? "translate-y-0 scale-100" : "translate-y-full md:scale-95"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold tracking-wide">{UI_LABELS.share.title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Social Icons Grid */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {shareOptions.map((option, idx) => {
            const Icon = option.icon;
            return (
              <button
                key={idx}
                className="flex flex-col items-center gap-2 group cursor-pointer"
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-115 shadow-md ${option.color}`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs text-slate-400 group-hover:text-white transition-colors">
                  {option.name}
                </span>
              </button>
            );
          })}

          {/* Copy Link button */}
          <button
            onClick={handleCopyLink}
            className="flex flex-col items-center gap-2 group cursor-pointer"
          >
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-115 shadow-md ${
                copied ? "bg-brand-primary" : "bg-white/10 hover:bg-white/20"
              }`}
            >
              {copied ? (
                <Check className="w-5 h-5 text-black" />
              ) : (
                <Link className="w-5 h-5 text-white" />
              )}
            </div>
            <span
              className={`text-xs transition-colors ${
                copied ? "text-brand-primary font-medium" : "text-slate-400 group-hover:text-white"
              }`}
            >
              {copied ? UI_LABELS.share.linkCopied.split(" ")[0] + "!" : UI_LABELS.share.copyLink}
            </span>
          </button>
        </div>

        {/* URL Input Box */}
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-2 pl-4">
          <input
            type="text"
            readOnly
            value={videoUrl}
            className="bg-transparent text-xs text-slate-300 focus:outline-none flex-1 overflow-ellipsis"
          />
          <button
            onClick={handleCopyLink}
            className="px-4 py-2 bg-gradient-to-r from-brand-primary to-brand-secondary text-black text-xs font-semibold rounded-lg hover:brightness-110 active:scale-95 transition-all"
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>

        {/* Temporary Copy Toast Banner within dialog */}
        <div
          className={`absolute -top-12 left-1/2 -translate-x-1/2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-semibold rounded-lg shadow-lg transition-all duration-300 flex items-center gap-2 ${
            copied ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
          }`}
        >
          <Check className="w-4 h-4" />
          <span>{UI_LABELS.share.linkCopied}</span>
        </div>
      </div>
    </div>
  );
}
