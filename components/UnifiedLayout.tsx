"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import ThemeSwitch from "./ThemeSwitch";
import BottomTabBar from "./BottomTabBar";
import SearchOverlay from "./SearchOverlay";

interface UnifiedLayoutProps {
  children: React.ReactNode;
  searchOpen?: boolean;
  setSearchOpen?: (open: boolean) => void;
}

export default function UnifiedLayout({ 
  children, 
  searchOpen: externalSearchOpen, 
  setSearchOpen: externalSetSearchOpen 
}: UnifiedLayoutProps) {
  const pathname = usePathname();
  const [internalSearchOpen, setInternalSearchOpen] = useState(false);
  
  // Use external state if provided, otherwise use internal
  const searchOpen = externalSearchOpen !== undefined ? externalSearchOpen : internalSearchOpen;
  const setSearchOpen = externalSetSearchOpen || setInternalSearchOpen;
  
  const isHome = pathname === '/';
  const isBlog = pathname?.startsWith('/blog');

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Desktop Top Navbar (>=1024px) */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
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

          {/* Desktop Nav Links (hidden on mobile) */}
          <nav className="hidden lg:flex items-center gap-6">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors ${
                isHome
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Home
            </Link>
            <Link
              href="/#categories"
              className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
            >
              Tools
            </Link>
            <Link
              href="/blog"
              className={`text-sm font-medium transition-colors ${
                isBlog
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Blog
            </Link>
          </nav>

          {/* Desktop Search (hidden on mobile) */}
          <div className="hidden lg:flex flex-1 max-w-md">
            <button
              onClick={() => setSearchOpen(true)}
              className="w-full flex items-center gap-3 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-left"
            >
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-500 dark:text-gray-400">Search tools and blog...</span>
              <kbd className="ml-auto px-2 py-1 text-xs bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Desktop Theme Toggle (hidden on mobile) */}
          <div className="hidden lg:block">
            <ThemeSwitch />
          </div>
        </div>
      </header>

      {/* Main Content - bottom padding only for mobile/tablet */}
      <main className="flex-1 pb-20 lg:pb-6">
        {children}
      </main>

      {/* Bottom Tab Bar - mobile/tablet only (<1024px) */}
      <div className="lg:hidden">
        <BottomTabBar />
      </div>
    </div>
  );
}
