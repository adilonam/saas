"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { MagnifyingGlassIcon, DocumentTextIcon } from "@heroicons/react/24/outline";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "components/hooks/use-mobile";

const SEARCHABLE_FEATURES = [
  { title: "AI Summarize", href: "/summarize-pdf", keywords: "summarize pdf ai extract insights" },
  { title: "Sign PDF", href: "/sign-pdf", keywords: "sign signature sign pdf" },
  { title: "Merge PDFs", href: "/merge-pdf", keywords: "merge combine pdf multiple" },
  { title: "Convert PDF", href: "/pdf-to-word", keywords: "convert word docx excel image" },
];

function matchQuery(title: string, keywords: string, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return false;
  const titleLower = title.toLowerCase();
  const keywordsLower = keywords.toLowerCase();
  return titleLower.includes(q) || keywordsLower.includes(q);
}

export default function Search() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const results = query.trim().length >= 1
    ? SEARCHABLE_FEATURES.filter((f) => matchQuery(f.title, f.keywords, query))
    : [];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        if (isMobile === true) setMobilePanelOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile]);

  const closeMobilePanel = () => {
    setMobilePanelOpen(false);
    setQuery("");
    setIsOpen(false);
  };

  const resultsList = (
    <>
      {results.length > 0 ? (
        <ul className="py-2 max-h-[min(280px,60vh)] overflow-y-auto">
          {results.map(({ title, href }) => (
            <li key={href}>
              <Link
                href={href}
                onClick={closeMobilePanel}
                className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
              >
                <div className="size-8 sm:size-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                  <DocumentTextIcon className="size-4 sm:size-5 text-slate-500 dark:text-slate-400" />
                </div>
                <span className="font-medium text-sm sm:text-base text-slate-900 dark:text-white truncate">
                  {title}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : query.trim().length >= 1 ? (
        <p className="px-3 sm:px-4 py-3 sm:py-4 text-sm text-slate-500 dark:text-slate-400">
          No tools match &quot;{query.trim()}&quot;
        </p>
      ) : null}
    </>
  );

  const dropdownContent = isOpen && query.trim().length >= 1 && isMobile !== true && (
    <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl overflow-hidden z-50">
      {resultsList}
    </div>
  );

  // Mobile: icon only, tap opens panel with input + results
  if (isMobile === true) {
    return (
      <div ref={containerRef} className="relative shrink-0">
        <button
          type="button"
          onClick={() => setMobilePanelOpen((open) => !open)}
          className="size-9 sm:size-11 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
          aria-label="Search"
        >
          <MagnifyingGlassIcon className="size-4 sm:size-5" />
        </button>

        {mobilePanelOpen && (
          <div className="fixed inset-0 top-16 left-0 right-0 z-50 flex flex-col bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-xl">
            <div className="p-3 border-b border-slate-200 dark:border-slate-800">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <MagnifyingGlassIcon className="size-5" />
                </div>
                <Input
                  type="text"
                  placeholder="Search for tools or documents..."
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setIsOpen(true);
                  }}
                  onFocus={() => query.length >= 1 && setIsOpen(true)}
                  className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-3 pl-12 pr-4 text-sm focus-visible:ring-2 focus-visible:ring-dashboard-primary/20 placeholder:text-slate-500 h-auto"
                  autoFocus
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto min-h-0">
              {query.trim().length >= 1 ? (
                <div className="border-t border-slate-200 dark:border-slate-800">
                  {resultsList}
                </div>
              ) : (
                <p className="px-4 py-6 text-sm text-slate-500 dark:text-slate-400">
                  Type to search tools...
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Desktop: full search input + dropdown
  return (
    <div ref={containerRef} className="relative w-full min-w-0 max-w-xl">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none text-slate-400">
          <MagnifyingGlassIcon className="size-4 sm:size-5" />
        </div>
        <Input
          type="text"
          placeholder="Search..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => query.length >= 1 && setIsOpen(true)}
          className="w-full min-w-0 bg-slate-100 dark:bg-slate-900 border-none rounded-xl sm:rounded-2xl py-2.5 sm:py-3 pl-9 sm:pl-12 pr-3 sm:pr-4 text-sm focus-visible:ring-2 focus-visible:ring-dashboard-primary/20 placeholder:text-slate-500 h-auto"
        />
      </div>

      {dropdownContent}
    </div>
  );
}
