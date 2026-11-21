"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  Squares2X2Icon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import ThemeSwitch from "./ThemeSwitch";
import SearchOverlay from "./SearchOverlay";

export default function BottomTabBar() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const isHome = pathname === '/';
  const isBlog = pathname?.startsWith('/blog');

  return (
    <>
      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800">
        {/* Desktop: centered floating bar */}
        <div className="hidden md:block absolute inset-x-0 bottom-0 pb-safe">
          <div className="max-w-md mx-auto px-4 pb-4">
            <div className="flex items-center justify-around h-16 px-4 bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800">
              <Link
                href="/"
                className={`flex flex-col items-center justify-center min-w-0 flex-1 gap-1 py-1 px-3 rounded-lg transition-colors ${
                  isHome
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
                aria-label="Home"
              >
                <HomeIcon className="w-6 h-6" />
                <span className="text-xs font-medium">Home</span>
              </Link>

              <Link
                href="/blog"
                className={`flex flex-col items-center justify-center min-w-0 flex-1 gap-1 py-1 px-3 rounded-lg transition-colors ${
                  isBlog
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
                aria-label="Blog"
              >
                <Squares2X2Icon className="w-6 h-6" />
                <span className="text-xs font-medium">Blog</span>
              </Link>

              <button
                onClick={() => setSearchOpen(true)}
                className="flex flex-col items-center justify-center min-w-0 flex-1 gap-1 py-1 px-3 rounded-lg transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                aria-label="Search"
              >
                <MagnifyingGlassIcon className="w-6 h-6" />
                <span className="text-xs font-medium">Search</span>
              </button>

              <div className="flex flex-col items-center justify-center min-w-0 flex-1 gap-1 py-1 px-3">
                <ThemeSwitch />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Theme</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile: full-width bar */}
        <div className="md:hidden flex items-center justify-around h-16 px-2 pb-safe">
          <Link
            href="/"
            className={`flex flex-col items-center justify-center min-w-0 flex-1 gap-1 py-1 px-2 rounded-lg transition-colors ${
              isHome
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
            aria-label="Home"
          >
            <HomeIcon className="w-6 h-6" />
            <span className="text-xs font-medium truncate">Home</span>
          </Link>

          <Link
            href="/blog"
            className={`flex flex-col items-center justify-center min-w-0 flex-1 gap-1 py-1 px-2 rounded-lg transition-colors ${
              isBlog
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
            aria-label="Blog"
          >
            <Squares2X2Icon className="w-6 h-6" />
            <span className="text-xs font-medium truncate">Blog</span>
          </Link>

          <button
            onClick={() => setSearchOpen(true)}
            className="flex flex-col items-center justify-center min-w-0 flex-1 gap-1 py-1 px-2 rounded-lg transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            aria-label="Search"
          >
            <MagnifyingGlassIcon className="w-6 h-6" />
            <span className="text-xs font-medium truncate">Search</span>
          </button>

          <div className="flex flex-col items-center justify-center min-w-0 flex-1 gap-1 py-1 px-2">
            <ThemeSwitch />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Theme</span>
          </div>
        </div>
      </nav>
    </>
  );
}
