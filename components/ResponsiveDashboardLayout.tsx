"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import BottomTabBar from "./BottomTabBar";
import IconRail from "./IconRail";
import Sidebar from "./Sidebar";
import Search from "./Search";
import ThemeSwitch from "./ThemeSwitch";
import Footer from "./Footer";
import { useIsMobile } from "./hooks/use-mobile";

interface ResponsiveDashboardLayoutProps {
  children: React.ReactNode;
  fullWidth?: boolean;
}

const SIDEBAR_COLLAPSED_KEY = "eprod-sidebar-collapsed";

export default function ResponsiveDashboardLayout({ 
  children, 
  fullWidth 
}: ResponsiveDashboardLayoutProps) {
  const isMobile = useIsMobile();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true";
    } catch {
      return false;
    }
  });

  const handleSidebarToggle = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      } catch {}
      return next;
    });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-gray-950">
      {/* Desktop Sidebar - only on large screens */}
      <div className="hidden lg:block">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={handleSidebarToggle}
          onUpgradeClick={() => {}}
          showCollapseToggle={true}
        />
      </div>

      {/* Tablet Icon Rail - only on md/tablet screens */}
      <IconRail />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Simplified Header */}
        <header className="h-14 md:h-16 shrink-0 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between gap-4 px-4 md:px-6 bg-white dark:bg-gray-950">
          {/* Logo - only on mobile/tablet (desktop has it in sidebar) */}
          <Link 
            href="/" 
            className="lg:hidden flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white"
          >
            <img 
              src="/images/logo/apple-touch-icon.png" 
              alt="eProd" 
              className="w-8 h-8"
            />
            <span className="hidden sm:inline">eProd</span>
          </Link>

          {/* Search */}
          <div className="flex-1 max-w-xl">
            <Search />
          </div>

          {/* Theme Toggle - only on desktop (mobile/tablet have it in nav) */}
          <div className="hidden lg:block">
            <ThemeSwitch />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-6">
          <div className={fullWidth ? "" : "container mx-auto px-4 md:px-6 py-6 md:py-8"}>
            {children}
          </div>
        </main>

        {/* Footer */}
        <Footer />
      </div>

      {/* Mobile Bottom Tab Bar */}
      <BottomTabBar />
    </div>
  );
}
