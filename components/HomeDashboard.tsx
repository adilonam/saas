"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  SparklesIcon,
  DocumentMagnifyingGlassIcon,
  DocumentPlusIcon,
  ChatBubbleLeftRightIcon,
  LanguageIcon,
  ArrowTrendingUpIcon,
  PencilSquareIcon,
  Squares2X2Icon,
  PhotoIcon,
  FilmIcon,
  PencilIcon,
  ChartBarIcon,
  CodeBracketSquareIcon,
  ComputerDesktopIcon,
  CheckCircleIcon,
  CalculatorIcon,
  BanknotesIcon,
  ChartPieIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  ClipboardDocumentListIcon,
  HashtagIcon,
  PlayCircleIcon,
  KeyIcon,
  EnvelopeIcon,
  UserCircleIcon,
  LightBulbIcon,
  GlobeAltIcon,
  DocumentArrowDownIcon,
  PencilSquareIcon as AnnotationIcon,
  DocumentIcon,
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
    href: "/trading-signal",
    title: "Trading Signal",
    description: "Upload a chart screenshot and get AI analysis: entry, take profit, stop loss.",
    icon: ChartBarIcon,
    iconBg: "bg-amber-100 dark:bg-amber-900/30 text-amber-600",
  },
  {
    href: "/generate-pdf",
    title: "Generate PDF",
    description: "Describe your document in plain language; get LaTeX code and compile to PDF.",
    icon: DocumentPlusIcon,
    iconBg: "bg-sky-100 dark:bg-sky-900/30 text-sky-600",
  },
  {
    href: "#",
    title: "Edit PDF",
    description: "Edit text, images, and pages within your PDF files.",
    icon: PencilIcon,
    iconBg: "bg-teal-100 dark:bg-teal-900/30 text-teal-600",
    comingSoon: true,
  },
];

const aiWritingTools = [
  {
    href: "/ai-product-description",
    title: "AI Product Description",
    description:
      "Generate compelling e-commerce product descriptions from name, features, and audience.",
    icon: DocumentTextIcon,
    iconBg: "bg-amber-100 dark:bg-amber-900/30 text-amber-600",
  },
  {
    href: "/ai-resume-bullet",
    title: "AI Resume Bullet",
    description:
      "Turn experience and role into strong, impact-focused resume bullet points.",
    icon: AcademicCapIcon,
    iconBg: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600",
  },
  {
    href: "/ai-meeting-notes-summarizer",
    title: "AI Meeting Notes Summarizer",
    description:
      "Summarize meeting notes into key decisions, action items, and next steps.",
    icon: ClipboardDocumentListIcon,
    iconBg: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600",
  },
  {
    href: "/hashtag-generator",
    title: "Hashtag Generator",
    description:
      "Get relevant hashtags for Instagram, TikTok, or Twitter from your topic.",
    icon: HashtagIcon,
    iconBg: "bg-rose-100 dark:bg-rose-900/30 text-rose-600",
  },
  {
    href: "/youtube-title-generator",
    title: "YouTube Title Generator",
    description:
      "Generate click-worthy, SEO-friendly video title ideas from your topic.",
    icon: PlayCircleIcon,
    iconBg: "bg-red-100 dark:bg-red-900/30 text-red-600",
  },
  {
    href: "/tweet-post-formatter",
    title: "Tweet/Post Formatter",
    description:
      "Split long content into tweet-sized posts (280 chars) or a short thread.",
    icon: ChatBubbleLeftRightIcon,
    iconBg: "bg-sky-100 dark:bg-sky-900/30 text-sky-600",
  },
  {
    href: "/ai-email-subject-line",
    title: "AI Email Subject Line Generator",
    description:
      "Describe your email topic or campaign and get 5 subject line ideas.",
    icon: EnvelopeIcon,
    iconBg: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600",
  },
  {
    href: "/ai-cold-outreach",
    title: "AI Cold Outreach Writer",
    description:
      "Describe your offer and audience; get a short, personalized cold email draft.",
    icon: ChatBubbleLeftRightIcon,
    iconBg: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600",
  },
  {
    href: "/social-media-bio",
    title: "Social Media Bio Generator",
    description:
      "Get 3 short, engaging bios for Instagram, Twitter, LinkedIn, or any platform.",
    icon: UserCircleIcon,
    iconBg: "bg-pink-100 dark:bg-pink-900/30 text-pink-600",
  },
  {
    href: "/content-idea-generator",
    title: "Content Idea Generator",
    description:
      "Get 10 content ideas for blogs, social, or videos from your topic.",
    icon: LightBulbIcon,
    iconBg: "bg-amber-100 dark:bg-amber-900/30 text-amber-600",
  },
];

const productivityTools = [
  {
    href: "/timezone-meeting-planner",
    title: "Time Zone Meeting Planner",
    description:
      "Enter a meeting time and time zones to see the same moment everywhere.",
    icon: GlobeAltIcon,
    iconBg: "bg-sky-100 dark:bg-sky-900/30 text-sky-600",
  },
  {
    href: "/file-size-compressor",
    title: "File Size Compressor",
    description:
      "Compress images by resizing and reducing quality. Output is JPEG.",
    icon: DocumentArrowDownIcon,
    iconBg: "bg-teal-100 dark:bg-teal-900/30 text-teal-600",
  },
  {
    href: "/screenshot-annotation",
    title: "Screenshot Annotation Tool",
    description:
      "Upload a screenshot, add arrows and text, then download the annotated image.",
    icon: AnnotationIcon,
    iconBg: "bg-rose-100 dark:bg-rose-900/30 text-rose-600",
  },
  {
    href: "/pdf-to-image",
    title: "PDF to Image Converter",
    description:
      "Upload a PDF and convert each page to a PNG image.",
    icon: DocumentIcon,
    iconBg: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
  },
];

const aiImageTools = [
  {
    href: "/image-to-prompt",
    title: "Image to Prompt",
    description:
      "Turn any image into AI-ready prompts for Midjourney, Stable Diffusion, Flux, and more.",
    icon: PhotoIcon,
    iconBg: "bg-violet-100 dark:bg-violet-900/30 text-violet-600",
  },
  {
    href: "/video-to-prompt",
    title: "Video to Prompt",
    description:
      "Turn any video into AI-ready prompts from key frames — for Flux, Midjourney, Stable Diffusion.",
    icon: FilmIcon,
    iconBg: "bg-violet-100 dark:bg-violet-900/30 text-violet-600",
  },
];

const calculatorTools = [
  {
    href: "/bmi-calculator",
    title: "BMI Calculator",
    description:
      "Calculate your Body Mass Index from weight and height. See category and healthy range.",
    icon: CalculatorIcon,
    iconBg: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600",
  },
  {
    href: "/gpa-calculator",
    title: "GPA Calculator",
    description:
      "Calculate your Grade Point Average from letter grades and credit hours. Add courses and see cumulative GPA.",
    icon: CalculatorIcon,
    iconBg: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600",
  },
  {
    href: "/autoloan-calculator",
    title: "Auto Loan Calculator",
    description:
      "Estimate monthly payment, total interest, and total cost for a car loan.",
    icon: BanknotesIcon,
    iconBg: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600",
  },
  {
    href: "/calorie-calculator",
    title: "Calorie Calculator",
    description:
      "Estimate daily calorie needs (TDEE) to maintain, lose, or gain weight.",
    icon: CalculatorIcon,
    iconBg: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600",
  },
  {
    href: "/time-calculator",
    title: "Duration Calculator",
    description:
      "Calculate duration between two dates and times in days, hours, minutes, and seconds.",
    icon: CalculatorIcon,
    iconBg: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600",
  },
  {
    href: "/age-calculator",
    title: "Age Calculator",
    description:
      "Calculate age in years, months, and days from birth date. Optional as-of date.",
    icon: CalculatorIcon,
    iconBg: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600",
  },
  {
    href: "/picker-wheel",
    title: "Picker Wheel",
    description:
      "Add choices with weights and spin the wheel to pick randomly. Default: yes / no.",
    icon: ChartPieIcon,
    iconBg: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600",
  },
  {
    href: "/win-probability-calculator",
    title: "Win Probability Calculator",
    description:
      "Win rate from wins/losses or implied probability from decimal odds.",
    icon: CalculatorIcon,
    iconBg: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600",
  },
  {
    href: "/compound-interest-calculator",
    title: "Compound Interest Calculator",
    description:
      "Future value and total interest with customizable compounding frequency.",
    icon: BanknotesIcon,
    iconBg: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600",
  },
  {
    href: "/loan-payment-calculator",
    title: "Loan Payment Calculator",
    description:
      "Monthly payment, total interest, and total cost for any loan.",
    icon: BanknotesIcon,
    iconBg: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600",
  },
  {
    href: "/forex-position-size-calculator",
    title: "Forex Position Size Calculator",
    description:
      "Lot size from account balance, risk %, and stop loss in pips.",
    icon: ChartBarIcon,
    iconBg: "bg-amber-100 dark:bg-amber-900/30 text-amber-600",
  },
  {
    href: "/leverage-margin-calculator",
    title: "Leverage & Margin Calculator",
    description:
      "Required margin from position size and leverage ratio.",
    icon: CalculatorIcon,
    iconBg: "bg-violet-100 dark:bg-violet-900/30 text-violet-600",
  },
  {
    href: "/roi-calculator",
    title: "ROI Calculator",
    description:
      "Return on investment from initial and final value.",
    icon: ChartBarIcon,
    iconBg: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600",
  },
  {
    href: "/breakeven-calculator",
    title: "Break-even Calculator",
    description:
      "Find how many units you need to sell to cover fixed and variable costs.",
    icon: CalculatorIcon,
    iconBg: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600",
  },
  {
    href: "/probability-calculator",
    title: "Probability Calculator",
    description:
      "Single probability, P(A and B) / P(A or B), or combinations (n choose k).",
    icon: CalculatorIcon,
    iconBg: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600",
  },
  {
    href: "/discount-calculator",
    title: "Discount & Sale Price",
    description:
      "Calculate sale price from discount % or discount % from original and sale price.",
    icon: CalculatorIcon,
    iconBg: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600",
  },
  {
    href: "/wealth-comparison-calculator",
    title: "Wealth Comparison Calculator",
    description:
      "Compare your net worth to global percentiles. See where you stand (USD).",
    icon: BanknotesIcon,
    iconBg: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600",
  },
  {
    href: "/life-in-weeks",
    title: "Life in Weeks Visualizer",
    description:
      "One square per week of your life. See how many you've used and how many remain.",
    icon: CalculatorIcon,
    iconBg: "bg-violet-100 dark:bg-violet-900/30 text-violet-600",
  },
  {
    href: "/habit-streak-tracker",
    title: "Habit Streak Tracker",
    description:
      "Track your habit start date and last completed date to see your current streak.",
    icon: ChartPieIcon,
    iconBg: "bg-amber-100 dark:bg-amber-900/30 text-amber-600",
  },
  {
    href: "/goal-progress-tracker",
    title: "Goal Progress Tracker",
    description:
      "Set a target and current value. See progress as a percentage and bar.",
    icon: ChartBarIcon,
    iconBg: "bg-blue-100 dark:bg-blue-900/30 text-blue-600",
  },
  {
    href: "/salary-after-tax-calculator",
    title: "Salary After Tax Calculator",
    description:
      "Estimate take-home pay from gross salary and effective tax rate (yearly or monthly).",
    icon: BanknotesIcon,
    iconBg: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600",
  },
  {
    href: "/startup-valuation-calculator",
    title: "Startup Valuation Calculator",
    description:
      "Estimate valuation from revenue, growth rate, margin, and multiple.",
    icon: BanknotesIcon,
    iconBg: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600",
  },
  {
    href: "/ad-roi-calculator",
    title: "Ad ROI Calculator",
    description:
      "Calculate ROI and ROAS from ad spend and revenue from ads.",
    icon: ChartBarIcon,
    iconBg: "bg-violet-100 dark:bg-violet-900/30 text-violet-600",
  },
  {
    href: "/saas-pricing-simulator",
    title: "SaaS Pricing Simulator",
    description:
      "Simulate MRR, churn impact, and ARPU from your key metrics.",
    icon: BanknotesIcon,
    iconBg: "bg-sky-100 dark:bg-sky-900/30 text-sky-600",
  },
  {
    href: "/clv-calculator",
    title: "Customer Lifetime Value Calculator",
    description:
      "Estimate CLV from average revenue per user and monthly churn rate.",
    icon: ChartPieIcon,
    iconBg: "bg-teal-100 dark:bg-teal-900/30 text-teal-600",
  },
  {
    href: "/churn-rate-calculator",
    title: "Churn Rate Calculator",
    description:
      "Calculate customer churn rate from period start, end, and new customers.",
    icon: ChartPieIcon,
    iconBg: "bg-rose-100 dark:bg-rose-900/30 text-rose-600",
  },
];

const developerTools = [
  {
    href: "/json-to-csv",
    title: "JSON → CSV Converter",
    description:
      "Paste JSON (array of objects) and convert to CSV for export or spreadsheets.",
    icon: CodeBracketSquareIcon,
    iconBg: "bg-sky-100 dark:bg-sky-900/30 text-sky-600",
  },
  {
    href: "/api-response-formatter",
    title: "API Response Formatter",
    description:
      "Format or minify JSON — pretty-print or compact API responses.",
    icon: CodeBracketSquareIcon,
    iconBg: "bg-violet-100 dark:bg-violet-900/30 text-violet-600",
  },
  {
    href: "/regex-tester",
    title: "Regex Tester",
    description:
      "Test regular expressions against sample text and see matches.",
    icon: CodeBracketSquareIcon,
    iconBg: "bg-amber-100 dark:bg-amber-900/30 text-amber-600",
  },
  {
    href: "/cron-generator",
    title: "Cron Expression Generator",
    description:
      "Build cron expressions for minute, hour, day, month, weekday with presets.",
    icon: CodeBracketSquareIcon,
    iconBg: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
  },
  {
    href: "/jwt-decoder",
    title: "JWT Token Decoder",
    description:
      "Paste a JWT to decode header and payload. Signature is not verified.",
    icon: KeyIcon,
    iconBg: "bg-amber-100 dark:bg-amber-900/30 text-amber-600",
  },
];

export default function HomeDashboard() {
  const searchParams = useSearchParams();
  const [showVerifiedBanner, setShowVerifiedBanner] = useState(false);

  useEffect(() => {
    if (searchParams.get("verified") !== "1") return;
    window.history.replaceState({}, "", window.location.pathname);
    queueMicrotask(() => setShowVerifiedBanner(true));
  }, [searchParams]);

  return (
    <DashboardLayout>
      {showVerifiedBanner && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-3 text-emerald-800 dark:text-emerald-200">
          <CheckCircleIcon className="size-6 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <p className="text-sm font-medium">
            Email verified. Your 1 day free subscription (from sign up) is active for all productivity tools.
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
          Productivity AI Tools
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
      <section className="mb-14">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-10 rounded-xl bg-dashboard-primary/10 flex items-center justify-center text-dashboard-primary">
            <ArrowTrendingUpIcon className="size-5" />
          </div>
          <h3 className="text-xl font-bold">Popular Tools</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularTools.map(
            ({ href, title, description, icon: Icon, iconBg, comingSoon }) =>
              comingSoon ? (
                <div
                  key={title}
                  className="group flex flex-col p-6 rounded-4xl bg-slate-50/50 dark:bg-slate-900/40 text-left border border-slate-200 dark:border-slate-700 cursor-not-allowed opacity-90"
                >
                  <div
                    className={`size-14 rounded-2xl flex items-center justify-center mb-6 ${iconBg}`}
                  >
                    <Icon className="size-8" />
                  </div>
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
              ) : (
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

      {/* Calculator */}
      <section className="mb-14">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-10 rounded-xl bg-cyan-100 dark:bg-cyan-900/20 flex items-center justify-center text-cyan-600">
            <CalculatorIcon className="size-5" />
          </div>
          <h3 className="text-xl font-bold">Calculator</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {calculatorTools.map(({ href, title, description, icon: Icon, iconBg }) => (
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

      {/* AI Writing & Social */}
      <section className="mb-14">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-10 rounded-xl bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center text-amber-600">
            <PencilIcon className="size-5" />
          </div>
          <h3 className="text-xl font-bold">AI Writing & Social</h3>
          <span className="bg-amber-600 text-white text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-widest ml-2">
            Premium
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {aiWritingTools.map(({ href, title, description, icon: Icon, iconBg }) => (
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

      {/* Productivity & Utilities */}
      <section className="mb-14">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-10 rounded-xl bg-teal-100 dark:bg-teal-900/20 flex items-center justify-center text-teal-600">
            <GlobeAltIcon className="size-5" />
          </div>
          <h3 className="text-xl font-bold">Productivity & Utilities</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {productivityTools.map(({ href, title, description, icon: Icon, iconBg }) => (
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
          ))}
        </div>
      </section>

      {/* Developer Tools */}
      <section className="mb-14">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">
            <CodeBracketSquareIcon className="size-5" />
          </div>
          <h3 className="text-xl font-bold">Developer Tools</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {developerTools.map(({ href, title, description, icon: Icon, iconBg }) => (
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
          ))}
        </div>
      </section>

      {/* AI Image Tool */}
      <section className="mb-14">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-10 rounded-xl bg-violet-100 dark:bg-violet-900/20 flex items-center justify-center text-violet-600">
            <PhotoIcon className="size-5" />
          </div>
          <h3 className="text-xl font-bold">AI Image Tool</h3>
          <span className="bg-violet-600 text-white text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-widest ml-2">
            Premium
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {aiImageTools.map(({ href, title, description, icon: Icon, iconBg }) => (
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
