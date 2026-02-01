"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  DocumentTextIcon,
  HomeIcon,
  ShieldCheckIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/signin", label: "Privacy", icon: ShieldCheckIcon },
  { href: "#", label: "About", icon: InformationCircleIcon },
];

interface SidebarProps {
  onUpgradeClick: () => void;
}

export default function Sidebar({ onUpgradeClick }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 flex flex-col border-r border-slate-200 dark:border-transparent bg-slate-50 dark:bg-[#111827] text-slate-600 dark:text-slate-400 transition-colors">
      <div className="p-8">
        <Link
          href="/"
          className="flex items-center gap-3 text-slate-900 dark:text-white hover:opacity-90 transition-opacity"
        >
          <div className="size-9 rounded-lg bg-dashboard-primary flex items-center justify-center">
            <DocumentTextIcon className="size-5 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Manage PDF</h1>
        </Link>
      </div>
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href && href !== "/signin";
          return (
            <Link
              key={href}
              href={href}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                active
                  ? "bg-dashboard-primary text-white shadow-lg shadow-dashboard-primary/20"
                  : "hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors text-slate-700 dark:text-slate-400"
              }`}
            >
              <Icon className="size-5 shrink-0" />
              <span className={active ? "font-semibold text-sm" : "font-medium text-sm"}>
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
      <div className="p-6">
        <div className="p-5 bg-slate-200/80 dark:bg-slate-800/50 rounded-2xl border border-slate-300 dark:border-slate-700 transition-colors">
          <p className="text-xs font-semibold text-dashboard-primary uppercase tracking-wider">
            Pro Plan
          </p>
          <p className="text-slate-800 dark:text-white text-sm font-bold mt-1 leading-snug">
            Unlock Unlimited AI Power
          </p>
          <Button
            type="button"
            onClick={onUpgradeClick}
            className="mt-4 w-full bg-slate-600 dark:bg-slate-700 hover:bg-slate-500 dark:hover:bg-slate-600 text-white py-2.5 rounded-lg text-xs font-bold transition-colors h-auto"
          >
            Upgrade Now
          </Button>
        </div>
      </div>
    </aside>
  );
}
