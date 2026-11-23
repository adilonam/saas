"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import Image from "next/image";

// Tool categories with their tools
const TOOL_CATEGORIES = {
  "PDF Tools": [
    { path: "sign-pdf", title: "Sign PDF" },
    { path: "merge-pdf", title: "Merge PDF" },
    { path: "pdf-to-word", title: "PDF to Word" },
    { path: "compress-pdf", title: "Compress PDF" },
    { path: "split-pdf", title: "Split PDF" },
    { path: "rotate-pdf", title: "Rotate PDF" },
    { path: "pdf-to-image", title: "PDF to Image" },
    { path: "image-to-pdf", title: "Image to PDF" },
    { path: "pdf-to-text", title: "PDF to Text" },
    { path: "pdf-metadata", title: "PDF Metadata" },
    { path: "summarize-pdf", title: "AI Summarize PDF" },
  ],
  "Calculators": [
    { path: "age-calculator", title: "Age Calculator" },
    { path: "bmi-calculator", title: "BMI Calculator" },
    { path: "compound-interest-calculator", title: "Compound Interest" },
    { path: "loan-payment-calculator", title: "Loan Payment" },
    { path: "roi-calculator", title: "ROI Calculator" },
    { path: "discount-calculator", title: "Discount Calculator" },
    { path: "black-friday-discount-calculator", title: "Black Friday Calculator" },
    { path: "tip-split-calculator", title: "Tip Split Calculator" },
    { path: "time-calculator", title: "Time Calculator" },
    { path: "calorie-calculator", title: "Calorie Calculator" },
    { path: "probability-calculator", title: "Probability" },
    { path: "christmas-countdown", title: "Christmas Countdown" },
    { path: "new-year-countdown", title: "New Year Countdown" },
    { path: "2027-calendar", title: "2027 Calendar" },
  ],
  "Generators": [
    { path: "password-generator", title: "Password Generator" },
    { path: "qr-generate", title: "QR Code Generator" },
    { path: "hashtag-generator", title: "Hashtag Generator" },
    { path: "youtube-title-generator", title: "YouTube Title" },
    { path: "uuid-generator", title: "UUID Generator" },
    { path: "barcode-generator", title: "Barcode Generator" },
    { path: "slug-generator", title: "Slug Generator" },
  ],
  "AI Tools": [
    { path: "ai-email-subject-line", title: "AI Email Subject Line" },
    { path: "ai-resume-bullet", title: "AI Resume Bullet" },
    { path: "ai-product-description", title: "AI Product Description" },
    { path: "ai-meeting-notes-summarizer", title: "AI Meeting Notes" },
    { path: "text-summarizer", title: "Text Summarizer" },
    { path: "image-to-prompt", title: "Image to Prompt" },
  ],
  "Converters": [
    { path: "json-to-csv", title: "JSON to CSV" },
    { path: "csv-to-json", title: "CSV to JSON" },
    { path: "image-convert", title: "Image Converter" },
    { path: "base64-encoder-decoder", title: "Base64 Encoder/Decoder" },
    { path: "url-encoder-decoder", title: "URL Encoder/Decoder" },
    { path: "timestamp-converter", title: "Timestamp Converter" },
    { path: "color-converter", title: "Color Converter" },
  ],
  "Content & Writing": [
    { path: "word-counter", title: "Word Counter" },
    { path: "text-case-converter", title: "Text Case Converter" },
    { path: "text-diff-checker", title: "Text Diff Checker" },
    { path: "reading-time-estimator", title: "Reading Time" },
    { path: "youtube-title-length-checker", title: "YouTube Title Length" },
    { path: "keyword-density-checker", title: "Keyword Density" },
  ],
  "Developer Tools": [
    { path: "regex-tester", title: "Regex Tester" },
    { path: "jwt-decoder", title: "JWT Decoder" },
    { path: "api-response-formatter", title: "API Response Formatter" },
    { path: "sql-formatter", title: "SQL Formatter" },
    { path: "json-minify-beautify", title: "JSON Minify/Beautify" },
    { path: "xml-formatter", title: "XML Formatter" },
    { path: "gitignore-suggester", title: "Gitignore Suggester" },
  ],
  "Productivity": [
    { path: "pomodoro-timer", title: "Pomodoro Timer" },
    { path: "task-prioritizer", title: "Task Prioritizer" },
    { path: "time-blocking-builder", title: "Time Blocking" },
    { path: "habit-streak-tracker", title: "Habit Streak Tracker" },
    { path: "goal-progress-tracker", title: "Goal Progress" },
    { path: "meeting-agenda-builder", title: "Meeting Agenda" },
    { path: "daily-planner", title: "Daily Planner" },
    { path: "secret-santa-generator", title: "Secret Santa Generator" },
    { path: "share", title: "Share Files Securely" },
  ],
  "Business": [
    { path: "cac-calculator", title: "CAC Calculator" },
    { path: "ltv-calculator", title: "LTV Calculator" },
    { path: "roas-calculator", title: "ROAS Calculator" },
    { path: "churn-rate-calculator", title: "Churn Rate" },
    { path: "profit-margin-calculator", title: "Profit Margin" },
    { path: "burn-rate-runway", title: "Burn Rate & Runway" },
  ],
};

interface ImprovedHomeDashboardProps {
  onSearchClick: () => void;
}

export default function ImprovedHomeDashboard({ onSearchClick }: ImprovedHomeDashboardProps) {
  const totalTools = Object.values(TOOL_CATEGORIES).reduce(
    (sum, tools) => sum + tools.length,
    0
  );

  return (
    <div className="min-h-screen">
      {/* Hero Section - Smaller on Mobile */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900/20 py-8 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3 md:mb-4">
              eProd – Free Productivity Tools
            </h1>
            <p className="text-base md:text-xl text-gray-700 dark:text-gray-300 mb-6 md:mb-8">
              {totalTools}+ free online tools for PDF, calculators, generators, and more
            </p>

            {/* Prominent Search - Opens SearchOverlay */}
            <button
              onClick={onSearchClick}
              className="relative max-w-2xl mx-auto w-full pl-11 pr-4 py-3 md:py-4 text-base md:text-lg border-2 border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-left transition-colors hover:border-blue-400 dark:hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Search tools and blog posts"
            >
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <span className="text-gray-500 dark:text-gray-400">Search tools and blog posts...</span>
            </button>
          </div>
        </div>
      </section>

      {/* Featured: Contextly */}
      <section className="py-8 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            ⭐ Featured: Chrome Extension
          </h2>
          <Link
            href="/contextly"
            className="block max-w-2xl bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl p-6 hover:shadow-lg transition-shadow border border-emerald-200 dark:border-emerald-800"
          >
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-emerald-100 dark:bg-emerald-900/30">
                <Image
                  src="/products/contextly-icon.png"
                  alt="Contextly"
                  width={64}
                  height={64}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  Contextly
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Chrome extension to improve writing anywhere — select text, choose a prompt, preview, then apply or copy.
                </p>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* All Tools by Category */}
      <section id="all-tools" className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-gray-900 dark:text-white">
            All Tools
          </h2>

          <div className="space-y-10 md:space-y-12">
            {Object.entries(TOOL_CATEGORIES).map(([category, tools]) => (
                <div key={category}>
                  <h3 className="text-lg md:text-xl font-bold mb-4 text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-800 pb-2">
                    {category}
                    <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                      ({tools.length})
                    </span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                    {tools.map((tool) => (
                      <Link
                        key={tool.path}
                        href={`/${tool.path}`}
                        className="group p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all"
                      >
                        <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {tool.title}
                        </h4>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
        </div>
      </section>
    </div>
  );
}
