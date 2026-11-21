"use client";

import Link from "next/link";
import Image from "next/image";
import ThemeSwitch from "./ThemeSwitch";
import BottomTabBar from "./BottomTabBar";

interface UnifiedLayoutProps {
  children: React.ReactNode;
}

export default function UnifiedLayout({ children }: UnifiedLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      {/* Top Header - Logo and Theme Toggle only */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 relative">
              <Image
                src="/images/logo/apple-touch-icon.png"
                alt="eProd"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">eProd</h1>
          </Link>

          <div className="hidden md:block">
            <ThemeSwitch />
          </div>
        </div>
      </header>

      {/* Main Content - with bottom padding for fixed bottom bar */}
      <main className="flex-1 pb-20 md:pb-24">
        {children}
      </main>

      {/* Bottom Tab Bar - shown on all pages */}
      <BottomTabBar />
    </div>
  );
}
