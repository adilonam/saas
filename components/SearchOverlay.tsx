"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { TOOLS_REGISTRY, type Tool } from "lib/tools-registry";

interface SearchResult {
  type: "tool" | "blog";
  slug: string;
  title: string;
  description?: string;
  score: number; // For ranking
}

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

// Enhanced search matching with token-based scoring
function matchTool(tool: Tool, query: string): { matches: boolean; score: number } {
  const q = query.toLowerCase().trim();
  if (!q) return { matches: false, score: 0 };

  // Split query into tokens for multi-word matching
  const queryTokens = q.split(/\s+/);
  
  const title = tool.title.toLowerCase();
  const slug = tool.slug.toLowerCase();
  const description = tool.description.toLowerCase();
  const keywords = tool.keywords.map(k => k.toLowerCase());
  const category = tool.category.toLowerCase();

  let score = 0;
  let matchFound = false;

  // Check each query token
  for (const token of queryTokens) {
    let tokenMatched = false;

    // Exact title match (highest priority)
    if (title === token) {
      score += 100;
      tokenMatched = true;
    }
    // Title starts with token (high priority)
    else if (title.startsWith(token)) {
      score += 80;
      tokenMatched = true;
    }
    // Title contains token as word
    else if (title.includes(` ${token} `) || title.includes(` ${token}`) || title.includes(`${token} `)) {
      score += 60;
      tokenMatched = true;
    }
    // Title contains token anywhere
    else if (title.includes(token)) {
      score += 50;
      tokenMatched = true;
    }

    // Exact slug match (very high priority for things like "pdf")
    if (slug === token || slug.startsWith(`${token}-`) || slug.endsWith(`-${token}`) || slug.includes(`-${token}-`)) {
      score += 90;
      tokenMatched = true;
    }
    // Slug contains token
    else if (slug.includes(token)) {
      score += 70;
      tokenMatched = true;
    }

    // Exact keyword match
    if (keywords.some(k => k === token)) {
      score += 85;
      tokenMatched = true;
    }
    // Keyword starts with token
    else if (keywords.some(k => k.startsWith(token))) {
      score += 75;
      tokenMatched = true;
    }
    // Keyword contains token
    else if (keywords.some(k => k.includes(token))) {
      score += 65;
      tokenMatched = true;
    }

    // Category match
    if (category === token || category.includes(token)) {
      score += 40;
      tokenMatched = true;
    }

    // Description match (lower priority)
    if (description.includes(token)) {
      score += 30;
      tokenMatched = true;
    }

    if (tokenMatched) {
      matchFound = true;
    } else {
      // If any token doesn't match, reduce overall score
      score -= 20;
    }
  }

  // Bonus for matching all tokens
  if (matchFound && queryTokens.length > 1) {
    score += 20;
  }

  return { matches: matchFound && score > 0, score };
}

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [blogPosts, setBlogPosts] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch blog posts on mount
  useEffect(() => {
    fetch("/api/blog")
      .then((res) => res.json())
      .then((data) => {
        const posts: SearchResult[] = data.posts.map((post: any) => ({
          type: "blog" as const,
          slug: post.slug,
          title: post.title,
          description: post.metaDescription || undefined,
          score: 0,
        }));
        setBlogPosts(posts);
      })
      .catch((err) => {
        console.error("Failed to fetch blog posts:", err);
        setBlogPosts([]);
      });
  }, []);

  // Enhanced tool filtering with ranking
  const toolResults: SearchResult[] = query.trim()
    ? TOOLS_REGISTRY
        .map(tool => {
          const { matches, score } = matchTool(tool, query);
          return matches ? {
            type: "tool" as const,
            slug: tool.slug,
            title: tool.title,
            description: tool.description,
            score
          } : null;
        })
        .filter((r): r is NonNullable<typeof r> => r !== null)
        .sort((a, b) => b.score - a.score) // Sort by score descending
    : [];

  // Blog post filtering (keep existing simple matching)
  const blogResults = query.trim()
    ? blogPosts.filter((post) =>
        post.title.toLowerCase().includes(query.toLowerCase()) ||
        post.description?.toLowerCase().includes(query.toLowerCase())
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

        {/* Results - Increased max height and made scrollable */}
        <div className="max-h-[70vh] overflow-y-auto">
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
