"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  CurrencyDollarIcon,
  EnvelopeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/pricing", label: "Pricing", icon: CurrencyDollarIcon },
  { href: "/contact", label: "Contact us", icon: EnvelopeIcon },
];

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onUpgradeClick: () => void;
  showCollapseToggle?: boolean;
}

export default function Sidebar({
  collapsed,
  onToggleCollapse,
  onUpgradeClick,
  showCollapseToggle = true,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`shrink-0 flex flex-col border-r border-slate-200 dark:border-transparent bg-slate-50 dark:bg-[#111827] text-slate-600 dark:text-slate-400 transition-[width] duration-200 ease-in-out overflow-hidden ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      <div
        className={`flex items-center shrink-0 border-b border-slate-200 dark:border-slate-800 ${
          collapsed ? "justify-center gap-0 p-3" : "justify-between gap-2 p-4 pr-3"
        } ${showCollapseToggle ? "h-20" : "h-16"}`}
      >
        <Link
          href="/"
          className={`flex items-center text-slate-900 dark:text-white hover:opacity-90 transition-opacity ${
            collapsed
              ? showCollapseToggle
                ? "flex-1 justify-center ml-3"
                : "flex-1 justify-center"
              : "gap-3 min-w-0 flex-1"
          }`}
          title={collapsed ? "Anycode" : undefined}
        >
          <div
            className={`rounded-lg flex items-center justify-center overflow-hidden shrink-0 ${
              collapsed ? (showCollapseToggle ? "size-7" : "size-6 sm:size-7") : "size-9"
            }`}
          >
            <Image
              src="/images/logo/apple-touch-icon.png"
              alt="Anycode"
              width={collapsed ? (showCollapseToggle ? 28 : 24) : 36}
              height={collapsed ? (showCollapseToggle ? 28 : 24) : 36}
              className={
                collapsed
                  ? showCollapseToggle
                    ? "size-7 object-contain"
                    : "size-6 sm:size-7 object-contain"
                  : "size-9 object-contain"
              }
            />
          </div>
          {!collapsed && (
            <h1 className="text-xl font-bold tracking-tight truncate">Anycode</h1>
          )}
        </Link>
        {showCollapseToggle && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="size-9 shrink-0 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRightIcon className="size-5" />
            ) : (
              <ChevronLeftIcon className="size-5" />
            )}
          </Button>
        )}
      </div>

      <nav className={`flex-1 px-4 pt-5 space-y-1 ${collapsed ? "flex flex-col items-center" : ""}`}>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={`flex items-center rounded-xl transition-all ${
                collapsed
                  ? "justify-center w-10 h-10"
                  : "w-full gap-3 px-4 py-3"
              } ${
                active
                  ? "bg-dashboard-primary text-white shadow-lg shadow-dashboard-primary/20"
                  : "hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors text-slate-700 dark:text-slate-400"
              }`}
            >
              <Icon className="size-5 shrink-0" />
              {!collapsed && (
                <span className={active ? "font-semibold text-sm" : "font-medium text-sm truncate"}>
                  {label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {collapsed ? (
        <div className="px-3 pb-2 flex justify-center">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onUpgradeClick}
            className="size-10 rounded-xl text-dashboard-primary hover:bg-dashboard-primary/10"
            title="Upgrade"
            aria-label="Upgrade"
          >
            <CurrencyDollarIcon className="size-5" />
          </Button>
        </div>
      ) : (
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
      )}
    </aside>
  );
}
