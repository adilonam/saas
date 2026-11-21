"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  Squares2X2Icon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import ThemeSwitch from "./ThemeSwitch";

const tabs = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "#categories", label: "Tools", icon: Squares2X2Icon, onClick: () => {
    const section = document.getElementById('all-tools');
    section?.scrollIntoView({ behavior: 'smooth' });
  }},
  { href: "#search", label: "Search", icon: MagnifyingGlassIcon, onClick: () => {
    const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
    searchInput?.focus();
  }},
];

export default function BottomTabBar() {
  const pathname = usePathname();
  const isHome = pathname === '/';

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800 safe-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const isActive = tab.href === '/' ? isHome : pathname?.startsWith(tab.href);
          const Icon = tab.icon;
          
          if (tab.onClick) {
            return (
              <button
                key={tab.label}
                onClick={tab.onClick}
                className={`flex flex-col items-center justify-center min-w-0 flex-1 gap-1 py-1 px-2 rounded-lg transition-colors ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
                aria-label={tab.label}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs font-medium truncate">{tab.label}</span>
              </button>
            );
          }
          
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center min-w-0 flex-1 gap-1 py-1 px-2 rounded-lg transition-colors ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
              aria-label={tab.label}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs font-medium truncate">{tab.label}</span>
            </Link>
          );
        })}
        
        <div className="flex flex-col items-center justify-center min-w-0 flex-1 gap-1 py-1 px-2">
          <ThemeSwitch />
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Theme</span>
        </div>
      </div>
    </nav>
  );
}
