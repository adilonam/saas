"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { MagnifyingGlassIcon, DocumentTextIcon } from "@heroicons/react/24/outline";
import { Input } from "@/components/ui/input";

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
  const containerRef = useRef<HTMLDivElement>(null);

  const results = query.trim().length >= 1
    ? SEARCHABLE_FEATURES.filter((f) => matchQuery(f.title, f.keywords, query))
    : [];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
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
          className="w-full bg-slate-100 dark:bg-slate-900 border-none rounded-2xl py-3 pl-12 pr-4 text-sm focus-visible:ring-2 focus-visible:ring-dashboard-primary/20 placeholder:text-slate-500 h-auto"
        />
      </div>

      {isOpen && query.trim().length >= 1 && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl overflow-hidden z-50">
          {results.length > 0 ? (
            <ul className="py-2 max-h-[280px] overflow-y-auto">
              {results.map(({ title, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => {
                      setQuery("");
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
                  >
                    <div className="size-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                      <DocumentTextIcon className="size-5 text-slate-500 dark:text-slate-400" />
                    </div>
                    <span className="font-medium text-slate-900 dark:text-white">{title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : query.trim().length >= 1 ? (
            <p className="px-4 py-4 text-sm text-slate-500 dark:text-slate-400">
              No tools match &quot;{query.trim()}&quot;
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
