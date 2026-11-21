"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface SearchResult {
  type: "tool" | "blog";
  slug: string;
  title: string;
  description?: string;
}

// All tools from the site
const ALL_TOOLS: SearchResult[] = [
  { type: "tool", slug: "youtube-title-length-checker", title: "YouTube Title Length Checker", description: "Check YouTube title character limits" },
  { type: "tool", slug: "sign-pdf", title: "Sign PDF", description: "Add digital signatures to PDFs" },
  { type: "tool", slug: "merge-pdf", title: "Merge PDF", description: "Combine multiple PDF files" },
  { type: "tool", slug: "age-calculator", title: "Age Calculator", description: "Calculate exact age in years, months, days" },
  { type: "tool", slug: "acceptance-criteria-generator", title: "Acceptance Criteria Generator", description: "Generate acceptance criteria for user stories" },
  { type: "tool", slug: "ai-email-subject-line", title: "AI Email Subject Line", description: "Generate compelling email subject lines" },
  { type: "tool", slug: "ai-resume-bullet", title: "AI Resume Bullet", description: "Create impactful resume bullet points" },
  // Add more tools as needed
];

const BLOG_POSTS: SearchResult[] = [
  { type: "blog", slug: "youtube-title-length-guide", title: "YouTube Title Length: Complete Guide" },
  { type: "blog", slug: "how-to-sign-pdf-documents", title: "How to Sign PDF Documents Online" },
  { type: "blog", slug: "calculate-age-accurately", title: "How to Calculate Age Accurately" },
  { type: "blog", slug: "merge-pdf-files-guide", title: "How to Merge PDF Files" },
  { type: "blog", slug: "ai-writing-tools-guide", title: "AI Writing Tools Guide" },
  { type: "blog", slug: "productivity-tools-guide", title: "Free Online Productivity Tools Guide" },
  { type: "blog", slug: "acceptance-criteria-guide", title: "Writing Effective Acceptance Criteria" },
];

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter results
  const toolResults = query.trim()
    ? ALL_TOOLS.filter((tool) =>
        tool.title.toLowerCase().includes(query.toLowerCase()) ||
        tool.description?.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const blogResults = query.trim()
    ? BLOG_POSTS.filter((post) =>
        post.title.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const allResults = [...toolResults, ...blogResults];
  const totalResults = allResults.length;

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "Escape":
          e.preventDefault();
          onClose();
          break;
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % Math.max(totalResults, 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + totalResults) % Math.max(totalResults, 1));
          break;
        case "Enter":
          e.preventDefault();
          if (totalResults > 0 && allResults[selectedIndex]) {
            const result = allResults[selectedIndex];
            const url = result.type === "blog" ? `/blog/${result.slug}` : `/${result.slug}`;
            window.location.href = url;
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex, totalResults, allResults, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="absolute inset-x-0 bottom-0 md:bottom-auto md:top-1/4 md:left-1/2 md:-translate-x-1/2 md:max-w-2xl md:w-full bg-white dark:bg-gray-900 md:rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-800">
          <MagnifyingGlassIcon className="w-6 h-6 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search tools and blog posts..."
            className="flex-1 bg-transparent border-none outline-none text-lg text-gray-900 dark:text-white placeholder:text-gray-400"
          />
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Close search"
          >
            <XMarkIcon className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {!query.trim() ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <MagnifyingGlassIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Start typing to search tools and blog posts</p>
            </div>
          ) : totalResults === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <p>No results found for "{query}"</p>
            </div>
          ) : (
            <>
              {/* Tool Results */}
              {toolResults.length > 0 && (
                <div className="py-2">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Tools ({toolResults.length})
                  </div>
                  {toolResults.map((result, index) => (
                    <Link
                      key={result.slug}
                      href={`/${result.slug}`}
                      className={`block px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                        selectedIndex === index
                          ? "bg-blue-50 dark:bg-blue-900/20"
                          : ""
                      }`}
                      onClick={onClose}
                    >
                      <div className="font-medium text-gray-900 dark:text-white">
                        {result.title}
                      </div>
                      {result.description && (
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {result.description}
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              )}

              {/* Blog Results */}
              {blogResults.length > 0 && (
                <div className="py-2 border-t border-gray-200 dark:border-gray-800">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Blog Posts ({blogResults.length})
                  </div>
                  {blogResults.map((result, index) => {
                    const resultIndex = toolResults.length + index;
                    return (
                      <Link
                        key={result.slug}
                        href={`/blog/${result.slug}`}
                        className={`block px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                          selectedIndex === resultIndex
                            ? "bg-blue-50 dark:bg-blue-900/20"
                            : ""
                        }`}
                        onClick={onClose}
                      >
                        <div className="font-medium text-gray-900 dark:text-white">
                          {result.title}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Keyboard hints */}
        {totalResults > 0 && (
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-4">
                <span><kbd className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">↑↓</kbd> Navigate</span>
                <span><kbd className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">Enter</kbd> Open</span>
              </div>
              <span><kbd className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">Esc</kbd> Close</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
