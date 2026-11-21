"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  Squares2X2Icon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import ThemeSwitch from "./ThemeSwitch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navItems = [
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

export default function IconRail() {
  const pathname = usePathname();
  const isHome = pathname === '/';

  return (
    <aside className="hidden md:flex lg:hidden flex-col items-center w-14 border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 py-4 gap-2">
      <TooltipProvider delayDuration={300}>
        {navItems.map((item) => {
          const isActive = item.href === '/' ? isHome : pathname?.startsWith(item.href);
          const Icon = item.icon;

          if (item.onClick) {
            return (
              <Tooltip key={item.label}>
                <TooltipTrigger asChild>
                  <button
                    onClick={item.onClick}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
                    }`}
                    aria-label={item.label}
                  >
                    <Icon className="w-5 h-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{item.label}</p>
                </TooltipContent>
              </Tooltip>
            );
          }

          return (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
                  }`}
                  aria-label={item.label}
                >
                  <Icon className="w-5 h-5" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{item.label}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}

        <div className="mt-auto">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="w-10 h-10 flex items-center justify-center">
                <ThemeSwitch />
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Toggle theme</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </aside>
  );
}
