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
import { useState } from "react";
import { signOut } from "next-auth/react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session } = useSession();
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100">
      <DepositDialog
        open={depositDialogOpen}
        onOpenChange={setDepositDialogOpen}
        onSuccess={() => {}}
      />

      <Sidebar onUpgradeClick={() => setDepositDialogOpen(true)} />

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-background-dark">
        <header className="h-20 shrink-0 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-10">
          <Search />
          <div className="flex items-center gap-4">
            <ThemeSwitch />
            <button
              type="button"
              className="size-11 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
              aria-label="Notifications"
            >
              <BellIcon className="size-5" />
            </button>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-2" />
            <div className="flex items-center gap-3">
              {session?.user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="flex items-center gap-3 rounded-2xl p-1 pr-2 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors text-left"
                      aria-label="User menu"
                    >
                      <div className="text-right">
                        <p className="text-sm font-bold">
                          {session.user.name || "User"}
                        </p>
                        <p className="text-[11px] text-slate-500 uppercase tracking-tighter">
                          {session.user.tokens != null
                            ? `${session.user.tokens} Tokens`
                            : "0 Tokens"}
                        </p>
                      </div>
                      <div className="size-11 rounded-2xl border-2 border-dashboard-primary/10 bg-slate-700 flex items-center justify-center text-white font-bold text-sm overflow-hidden shrink-0">
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
                          {session.user.tokens ?? 0} Tokens
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
                <div className="flex items-center gap-2">
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/signin">Sign In</Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link href="/signup">Sign Up</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-10 no-scrollbar">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
