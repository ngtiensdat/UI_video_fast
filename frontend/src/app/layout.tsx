import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { UI_LABELS } from "../constants/labels";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${UI_LABELS.appName} - Premium Vertical Video Feed`,
  description: `Experience immersive vertical scrolling video player feed with smooth micro-animations on ${UI_LABELS.appName}. Built with Next.js, TypeScript and Tailwind CSS.`,
  keywords: ["vertical video", "video feed", "cyberpunk feed", "tiktok clone", "next.js video player"],
  authors: [{ name: "Nguyễn Tiến Đạt" }],
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
      style={{ colorScheme: "dark" }}
    >
      <body className="min-h-full flex flex-col bg-[#0c0c0e] text-white overflow-hidden select-none">
        {children}
      </body>
    </html>
  );
}

