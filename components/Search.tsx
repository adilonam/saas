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
  { title: "BMI Calculator", href: "/bmi-calculator", keywords: "bmi body mass index weight height calculator" },
  { title: "GPA Calculator", href: "/gpa-calculator", keywords: "gpa grade point average letter grade credits calculator" },
  { title: "Auto Loan Calculator", href: "/autoloan-calculator", keywords: "auto loan car loan monthly payment interest calculator" },
  { title: "Calorie Calculator", href: "/calorie-calculator", keywords: "calorie calories tdee bmr daily intake weight loss gain maintain" },
  { title: "Duration Calculator", href: "/time-calculator", keywords: "duration between two dates time calculator days hours minutes seconds" },
  { title: "Age Calculator", href: "/age-calculator", keywords: "age birthday birth date years months days calculator" },
  { title: "Picker Wheel", href: "/picker-wheel", keywords: "picker wheel spinner random choice weighted spin" },
  { title: "Win Probability Calculator", href: "/win-probability-calculator", keywords: "win probability win rate odds implied probability calculator" },
  { title: "Compound Interest Calculator", href: "/compound-interest-calculator", keywords: "compound interest future value savings calculator" },
  { title: "Loan Payment Calculator", href: "/loan-payment-calculator", keywords: "loan payment monthly payment interest calculator mortgage" },
  { title: "Forex Position Size Calculator", href: "/forex-position-size-calculator", keywords: "forex position size lot size pip risk calculator" },
  { title: "Leverage & Margin Calculator", href: "/leverage-margin-calculator", keywords: "leverage margin required margin calculator trading" },
  { title: "ROI Calculator", href: "/roi-calculator", keywords: "roi return on investment gain loss calculator" },
  { title: "Image to Prompt", href: "/image-to-prompt", keywords: "image to prompt midjourney flux stable diffusion" },
  { title: "Video to Prompt", href: "/video-to-prompt", keywords: "video to prompt midjourney flux stable diffusion" },
  { title: "Break-even Calculator", href: "/breakeven-calculator", keywords: "break even breakeven fixed costs variable price units calculator" },
  { title: "Probability Calculator", href: "/probability-calculator", keywords: "probability P(A) P(B) combinations n choose k calculator" },
  { title: "Discount Calculator", href: "/discount-calculator", keywords: "discount sale price percent off original price calculator" },
  { title: "JSON to CSV", href: "/json-to-csv", keywords: "json csv convert array objects export" },
  { title: "API Response Formatter", href: "/api-response-formatter", keywords: "api json format pretty minify formatter" },
  { title: "Regex Tester", href: "/regex-tester", keywords: "regex regular expression test match online" },
  { title: "Cron Generator", href: "/cron-generator", keywords: "cron expression generator schedule job" },
  { title: "Wealth Comparison Calculator", href: "/wealth-comparison-calculator", keywords: "wealth net worth comparison percentile calculator" },
  { title: "Life in Weeks Visualizer", href: "/life-in-weeks", keywords: "life in weeks calendar weeks lived visualizer" },
  { title: "Habit Streak Tracker", href: "/habit-streak-tracker", keywords: "habit streak tracker daily habit days" },
  { title: "Goal Progress Tracker", href: "/goal-progress-tracker", keywords: "goal progress tracker target percentage" },
  { title: "Salary After Tax Calculator", href: "/salary-after-tax-calculator", keywords: "salary after tax take home pay gross net tax calculator" },
  { title: "AI Product Description", href: "/ai-product-description", keywords: "product description ecommerce copywriting" },
  { title: "AI Resume Bullet", href: "/ai-resume-bullet", keywords: "resume bullet points cv experience" },
  { title: "AI Meeting Notes Summarizer", href: "/ai-meeting-notes-summarizer", keywords: "meeting notes summary action items" },
  { title: "Hashtag Generator", href: "/hashtag-generator", keywords: "hashtag instagram tiktok social media" },
  { title: "YouTube Title Generator", href: "/youtube-title-generator", keywords: "youtube title video seo" },
  { title: "Tweet/Post Formatter", href: "/tweet-post-formatter", keywords: "tweet formatter thread twitter post" },
  { title: "JWT Token Decoder", href: "/jwt-decoder", keywords: "jwt token decode json web token header payload" },
  { title: "Startup Valuation Calculator", href: "/startup-valuation-calculator", keywords: "startup valuation revenue growth multiple" },
  { title: "Ad ROI Calculator", href: "/ad-roi-calculator", keywords: "ad roi roas ad spend revenue calculator" },
  { title: "SaaS Pricing Simulator", href: "/saas-pricing-simulator", keywords: "saas mrr churn arpu pricing simulator" },
  { title: "Customer Lifetime Value Calculator", href: "/clv-calculator", keywords: "clv ltv customer lifetime value arpu churn" },
  { title: "Churn Rate Calculator", href: "/churn-rate-calculator", keywords: "churn rate customers lost retention" },
  { title: "AI Email Subject Line Generator", href: "/ai-email-subject-line", keywords: "email subject line generator ai marketing" },
  { title: "AI Cold Outreach Writer", href: "/ai-cold-outreach", keywords: "cold email outreach sales ai writer" },
  { title: "Social Media Bio Generator", href: "/social-media-bio", keywords: "social media bio instagram twitter linkedin profile bio generator" },
  { title: "Content Idea Generator", href: "/content-idea-generator", keywords: "content ideas blog social video newsletter topic generator" },
  { title: "Time Zone Meeting Planner", href: "/timezone-meeting-planner", keywords: "timezone meeting planner world clock convert time zones" },
  { title: "File Size Compressor", href: "/file-size-compressor", keywords: "compress image file size reduce resize jpeg" },
  { title: "Screenshot Annotation Tool", href: "/screenshot-annotation", keywords: "screenshot annotation draw arrow highlight annotate image" },
  { title: "PDF to Image Converter", href: "/pdf-to-image", keywords: "pdf to image convert png jpeg page export" },
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
