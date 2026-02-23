"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { BellIcon } from "@heroicons/react/24/outline";
import Sidebar from "components/Sidebar";
import Search from "components/Search";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ThemeSwitch from "components/ThemeSwitch";
import DepositDialog from "components/DepositDialog";
import Footer from "components/Footer";
import { useIsMobile } from "components/hooks/use-mobile";
import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  fullWidth?: boolean;
}

const SIDEBAR_COLLAPSED_KEY = "managepdf-sidebar-collapsed";

export default function DashboardLayout({ children, fullWidth }: DashboardLayoutProps) {
  const { data: session } = useSession();
  const isMobile = useIsMobile(); // true = mobile, false = desktop, undefined = not yet known
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  useEffect(() => {
    if (isMobile !== false) return; // only restore preference on desktop
    try {
      setSidebarCollapsed(localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true");
    } catch {}
  }, [isMobile]);

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
    <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100">
      <DepositDialog
        open={depositDialogOpen}
        onOpenChange={setDepositDialogOpen}
        onSuccess={() => {}}
      />

      <Sidebar
        collapsed={isMobile === false ? sidebarCollapsed : true}
        onToggleCollapse={handleSidebarToggle}
        onUpgradeClick={() => setDepositDialogOpen(true)}
        showCollapseToggle={isMobile === false}
      />

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-background-dark">
        <header className="h-16 sm:h-20 shrink-0 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 sm:gap-6 px-3 sm:px-10">
          <div className="flex-1 min-w-0 flex items-center">
            <Search />
          </div>
          <div className="flex items-center gap-1.5 sm:gap-4 shrink-0">
            <ThemeSwitch />
            <button
              type="button"
              className="size-9 sm:size-11 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
              aria-label="Notifications"
            >
              <BellIcon className="size-4 sm:size-5" />
            </button>
            <div className="h-5 sm:h-6 w-px bg-slate-200 dark:bg-slate-800 mx-0.5 sm:mx-2" />
            <div className="flex items-center gap-2 sm:gap-3">
              {session?.user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="flex items-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl p-1 pr-1.5 sm:pr-2 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors text-left min-w-0"
                      aria-label="User menu"
                    >
                      <div className="text-right hidden sm:block min-w-0">
                        <p className="text-xs sm:text-sm font-bold truncate">
                          {session.user.name || "User"}
                        </p>
                        <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-tighter">
                          {session.user.subscriptionExpiresAt &&
                          new Date(session.user.subscriptionExpiresAt) > new Date()
                            ? session.user.waitlistNumber != null
                              ? (
                                  <>
                                    Expires {new Date(session.user.subscriptionExpiresAt).toLocaleDateString()} ·{" "}
                                    <span className="text-dashboard-primary font-semibold normal-case">Waitlist {session.user.waitlistNumber}</span>
                                  </>
                                )
                              : `Expires ${new Date(session.user.subscriptionExpiresAt).toLocaleDateString()}`
                            : session.user.waitlistNumber != null
                              ? (
                                  <span className="text-dashboard-primary font-semibold normal-case">Waitlist {session.user.waitlistNumber}</span>
                                )
                              : "No subscription"}
                        </p>
                      </div>
                      <div className="size-9 sm:size-11 rounded-xl sm:rounded-2xl border-2 border-dashboard-primary/10 bg-slate-700 flex items-center justify-center text-white font-bold text-xs sm:text-sm overflow-hidden shrink-0">
                        {(session.user.name || session.user.email || "U")
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-64 rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 shadow-xl"
                  >
                    <DropdownMenuLabel className="px-3 py-2.5 text-slate-900 dark:text-white font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-semibold leading-none">
                          {session.user.name || "User"}
                        </p>
                        {session.user.email && (
                          <p className="text-xs leading-none text-slate-500 dark:text-slate-400 truncate">
                            {session.user.email}
                          </p>
                        )}
                        <p className="text-xs leading-none text-slate-500 dark:text-slate-400 mt-1">
                          {session.user.subscriptionExpiresAt &&
                          new Date(session.user.subscriptionExpiresAt) > new Date()
                            ? session.user.waitlistNumber != null
                              ? (
                                  <>
                                    Subscription expires {new Date(session.user.subscriptionExpiresAt).toLocaleDateString()} ·{" "}
                                    <span className="text-dashboard-primary font-medium">Waitlist {session.user.waitlistNumber}</span>
                                  </>
                                )
                              : `Subscription expires ${new Date(session.user.subscriptionExpiresAt).toLocaleDateString()}`
                            : session.user.waitlistNumber != null
                              ? (
                                  <span className="text-dashboard-primary font-medium">Waitlist {session.user.waitlistNumber}</span>
                                )
                              : "No active subscription"}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-700 my-1" />
                    <DropdownMenuItem
                      onClick={() => signOut({ callbackUrl: "/signin" })}
                      className="cursor-pointer rounded-xl px-3 py-2.5 text-red-600 dark:text-red-400 focus:bg-slate-100 dark:focus:bg-slate-800 focus:text-red-600 dark:focus:text-red-400"
                    >
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Button asChild variant="ghost" size="sm" className="text-xs sm:text-sm px-2 sm:px-3">
                    <Link href="/signin">Sign In</Link>
                  </Button>
                  <Button asChild size="sm" className="text-xs sm:text-sm px-2 sm:px-3">
                    <Link href="/signup">Sign Up</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <main className={`flex-1 overflow-y-auto no-scrollbar ${fullWidth ? "p-0" : "p-10"}`}>
            <div className={fullWidth ? "h-full w-full" : "max-w-7xl mx-auto"}>{children}</div>
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
}
