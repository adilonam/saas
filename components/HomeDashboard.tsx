"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  DocumentTextIcon,
  HomeIcon,
  ShieldCheckIcon,
  InformationCircleIcon,
  MagnifyingGlassIcon,
  BellIcon,
  SparklesIcon,
  DocumentMagnifyingGlassIcon,
  ChatBubbleLeftRightIcon,
  LanguageIcon,
  ArrowTrendingUpIcon,
  PencilSquareIcon,
  Squares2X2Icon,
  PhotoIcon,
  PencilIcon,
  CodeBracketSquareIcon,
  ComputerDesktopIcon,
} from "@heroicons/react/24/outline";
import { Input } from "@/components/ui/input";
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

const navItems = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/signin", label: "Privacy", icon: ShieldCheckIcon },
  { href: "#", label: "About", icon: InformationCircleIcon },
];

const aiTools = [
  {
    href: "/summarize-pdf",
    title: "AI Summarize",
    description:
      "Extract core insights and key points from any long PDF document instantly.",
    icon: DocumentMagnifyingGlassIcon,
    iconBg: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600",
  },
  {
    href: "#",
    title: "AI Q&A Chat",
    description:
      "Interactive chat interface to query your documents and get factual answers.",
    icon: ChatBubbleLeftRightIcon,
    iconBg: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600",
  },
  {
    href: "#",
    title: "AI Translate",
    description:
      "Multi-language translation that preserves your original document layout.",
    icon: LanguageIcon,
    iconBg: "bg-amber-100 dark:bg-amber-900/30 text-amber-600",
  },
];

const popularTools = [
  {
    href: "/sign-pdf",
    title: "Sign PDF",
    description: "Add signatures or manage digital signing workflows.",
    icon: PencilSquareIcon,
    iconBg: "bg-blue-100 dark:bg-blue-900/30 text-blue-600",
  },
  {
    href: "/merge-pdf",
    title: "Merge PDFs",
    description: "Combine multiple PDF files into one single document.",
    icon: Squares2X2Icon,
    iconBg: "bg-purple-100 dark:bg-purple-900/30 text-purple-600",
  },
  {
    href: "/pdf-to-word",
    title: "Convert PDF",
    description: "Convert to Word, Excel, or Image formats with high fidelity.",
    icon: PhotoIcon,
    iconBg: "bg-rose-100 dark:bg-rose-900/30 text-rose-600",
  },
  {
    href: "#",
    title: "Edit PDF",
    description: "Edit text, images, and pages within your PDF files.",
    icon: PencilIcon,
    iconBg: "bg-teal-100 dark:bg-teal-900/30 text-teal-600",
  },
];

export default function HomeDashboard() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100">
      <DepositDialog
        open={depositDialogOpen}
        onOpenChange={setDepositDialogOpen}
        onSuccess={() => {}}
      />

      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-sidebar-dark flex flex-col text-slate-400">
        <div className="p-8">
          <Link
            href="/"
            className="flex items-center gap-3 text-white hover:opacity-90 transition-opacity"
          >
            <div className="size-9 rounded-lg bg-dashboard-primary flex items-center justify-center">
              <DocumentTextIcon className="size-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">PDF Master</h1>
          </Link>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  active
                    ? "bg-dashboard-primary text-white shadow-lg shadow-dashboard-primary/20"
                    : "hover:text-white hover:bg-slate-800 transition-colors"
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
          <div className="p-5 bg-slate-800/50 rounded-2xl border border-slate-700">
            <p className="text-xs font-semibold text-dashboard-primary uppercase tracking-wider">
              Pro Plan
            </p>
            <p className="text-white text-sm font-bold mt-1 leading-snug">
              Unlock Unlimited AI Power
            </p>
            <Button
              onClick={() => setDepositDialogOpen(true)}
              className="mt-4 w-full bg-slate-700 hover:bg-slate-600 text-white py-2.5 rounded-lg text-xs font-bold transition-colors h-auto"
            >
              Upgrade Now
            </Button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-background-dark">
        <header className="h-20 shrink-0 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-10">
          <div className="w-full max-w-xl">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <MagnifyingGlassIcon className="size-5" />
              </div>
              <Input
                type="text"
                placeholder="Search for tools or documents..."
                className="w-full bg-slate-100 dark:bg-slate-900 border-none rounded-2xl py-3 pl-12 pr-4 text-sm focus-visible:ring-2 focus-visible:ring-dashboard-primary/20 placeholder:text-slate-500 h-auto"
              />
            </div>
          </div>
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
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {session.user.name || "User"}
                        </p>
                        {session.user.email && (
                          <p className="text-xs leading-none text-muted-foreground truncate">
                            {session.user.email}
                          </p>
                        )}
                        <p className="text-xs leading-none text-muted-foreground mt-1">
                          {session.user.tokens ?? 0} Tokens
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => signOut({ callbackUrl: "/signin" })}
                      className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
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
          <div className="max-w-7xl mx-auto">
            <div className="mb-12">
              <h2 className="text-3xl font-bold tracking-tight">
                PDF Tools Library
              </h2>
              <p className="text-slate-500 mt-2 text-lg">
                Manage, convert, and sign your documents with precision.
              </p>
            </div>

            {/* AI PDF Assistant */}
            <section className="mb-14">
              <div className="flex items-center gap-3 mb-8">
                <div className="size-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600">
                  <SparklesIcon className="size-5" />
                </div>
                <h3 className="text-xl font-bold">AI PDF Assistant</h3>
                <span className="bg-indigo-600 text-white text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-widest ml-2">
                  Premium
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {aiTools.map(({ href, title, description, icon: Icon, iconBg }) => (
                  <Link
                    key={title}
                    href={href}
                    className="tool-card group flex items-start gap-5 p-6 rounded-4xl bg-slate-50/50 dark:bg-slate-900/40 text-left"
                  >
                    <div
                      className={`size-14 rounded-2xl shrink-0 flex items-center justify-center transition-transform group-hover:scale-110 ${iconBg}`}
                    >
                      <Icon className="size-8" />
                    </div>
                    <div>
                      <p className="font-bold text-lg">{title}</p>
                      <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                        {description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* Popular Tools */}
            <section>
              <div className="flex items-center gap-3 mb-8">
                <div className="size-10 rounded-xl bg-dashboard-primary/10 flex items-center justify-center text-dashboard-primary">
                  <ArrowTrendingUpIcon className="size-5" />
                </div>
                <h3 className="text-xl font-bold">Popular Tools</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {popularTools.map(
                  ({ href, title, description, icon: Icon, iconBg }) => (
                    <Link
                      key={title}
                      href={href}
                      className="tool-card group flex flex-col p-6 rounded-4xl bg-slate-50/50 dark:bg-slate-900/40 text-left"
                    >
                      <div
                        className={`size-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${iconBg}`}
                      >
                        <Icon className="size-8" />
                      </div>
                      <p className="font-bold text-lg">{title}</p>
                      <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                        {description}
                      </p>
                    </Link>
                  )
                )}
              </div>
            </section>

            {/* CTA cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-14 pb-20">
              <Link
                href="/signup"
                className="p-8 rounded-[2.5rem] bg-linear-to-br from-dashboard-primary to-indigo-700 text-white flex justify-between items-center group overflow-hidden relative"
              >
                <div className="relative z-10">
                  <h4 className="text-2xl font-bold">API for Developers</h4>
                  <p className="text-white/80 mt-2 max-w-[280px]">
                    Automate your PDF tasks with our robust and easy-to-integrate
                    API.
                  </p>
                  <span className="mt-6 inline-block bg-white text-dashboard-primary px-6 py-2.5 rounded-xl font-bold text-sm hover:shadow-lg transition-all">
                    Get API Key
                  </span>
                </div>
                <CodeBracketSquareIcon className="size-40 opacity-10 absolute -right-4 top-1/2 -translate-y-1/2 rotate-12 group-hover:scale-110 transition-transform" />
              </Link>
              <div className="p-8 rounded-[2.5rem] bg-slate-900 text-white flex justify-between items-center group overflow-hidden relative">
                <div className="relative z-10">
                  <h4 className="text-2xl font-bold">Desktop App</h4>
                  <p className="text-slate-400 mt-2 max-w-[280px]">
                    Work offline with our dedicated application for Windows and
                    Mac.
                  </p>
                  <span className="mt-6 inline-block bg-slate-800 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-700 transition-all border border-slate-700 cursor-not-allowed">
                    Coming Soon
                  </span>
                </div>
                <ComputerDesktopIcon className="size-40 opacity-5 absolute -right-4 top-1/2 -translate-y-1/2 -rotate-12 group-hover:scale-110 transition-transform" />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
