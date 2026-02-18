"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
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
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import DashboardLayout from "components/DashboardLayout";

const aiTools = [
  {
    href: "/summarize-pdf",
    title: "AI Summarize",
    description:
      "Extract core insights and key points from any long PDF document instantly.",
    icon: DocumentMagnifyingGlassIcon,
    iconBg: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600",
    comingSoon: false,
  },
  {
    href: "#",
    title: "AI Q&A Chat",
    description:
      "Interactive chat interface to query your documents and get factual answers.",
    icon: ChatBubbleLeftRightIcon,
    iconBg: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600",
    comingSoon: true,
  },
  {
    href: "#",
    title: "AI Translate",
    description:
      "Multi-language translation that preserves your original document layout.",
    icon: LanguageIcon,
    iconBg: "bg-amber-100 dark:bg-amber-900/30 text-amber-600",
    comingSoon: true,
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
  const searchParams = useSearchParams();
  const [showVerifiedBanner, setShowVerifiedBanner] = useState(false);

  useEffect(() => {
    if (searchParams.get("verified") === "1") {
      setShowVerifiedBanner(true);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [searchParams]);

  return (
    <DashboardLayout>
      {showVerifiedBanner && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-3 text-emerald-800 dark:text-emerald-200">
          <CheckCircleIcon className="size-6 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <p className="text-sm font-medium">
            Email verified. You have 1 day of free subscription to use all PDF tools.
          </p>
          <button
            type="button"
            onClick={() => setShowVerifiedBanner(false)}
            className="ml-auto rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-200/50 dark:text-emerald-400 dark:hover:bg-emerald-800/50"
            aria-label="Dismiss"
          >
            <span className="sr-only">Dismiss</span>
            <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
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
          {aiTools.map(({ href, title, description, icon: Icon, iconBg, comingSoon }) =>
            comingSoon ? (
              <div
                key={title}
                className="group flex items-start gap-5 p-6 rounded-4xl bg-slate-50/50 dark:bg-slate-900/40 text-left border border-slate-200 dark:border-slate-700 cursor-not-allowed opacity-90"
              >
                <div
                  className={`size-14 rounded-2xl shrink-0 flex items-center justify-center ${iconBg}`}
                >
                  <Icon className="size-8" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-lg">{title}</p>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                      Coming Soon
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                    {description}
                  </p>
                </div>
              </div>
            ) : (
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
            )
          )}
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

      {/* CTA cards - fixed colors, do not change with theme */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-14 pb-20">
        <div className="p-8 rounded-[2.5rem] bg-linear-to-br from-[#135bec] to-indigo-700 text-white flex justify-between items-center group overflow-hidden relative">
          <div className="relative z-10">
            <h4 className="text-2xl font-bold">API for Developers</h4>
            <p className="text-white/80 mt-2 max-w-[280px]">
              Automate your PDF tasks with our robust and easy-to-integrate
              API.
            </p>
            <span className="mt-6 inline-block bg-white/90 text-[#135bec] px-6 py-2.5 rounded-xl font-bold text-sm border border-white/30 cursor-not-allowed">
              Coming Soon
            </span>
          </div>
          <CodeBracketSquareIcon className="size-40 opacity-10 absolute -right-4 top-1/2 -translate-y-1/2 rotate-12 group-hover:scale-110 transition-transform" />
        </div>
        <div className="p-8 rounded-[2.5rem] bg-[#0f172a] text-white flex justify-between items-center group overflow-hidden relative">
          <div className="relative z-10">
            <h4 className="text-2xl font-bold">Desktop App</h4>
            <p className="text-slate-400 mt-2 max-w-[280px]">
              Work offline with our dedicated application for Windows and
              Mac.
            </p>
            <span className="mt-6 inline-block bg-[#1e293b] text-white px-6 py-2.5 rounded-xl font-bold text-sm border border-[#334155] cursor-not-allowed">
              Coming Soon
            </span>
          </div>
          <ComputerDesktopIcon className="size-40 opacity-5 absolute -right-4 top-1/2 -translate-y-1/2 -rotate-12 group-hover:scale-110 transition-transform" />
        </div>
      </div>
    </DashboardLayout>
  );
}
