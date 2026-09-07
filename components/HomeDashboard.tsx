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
  ArrowUturnLeftIcon,
  ReceiptPercentIcon,
  PresentationChartLineIcon,
  ClockIcon,
  UserGroupIcon,
  MoonIcon,
  BeakerIcon,
  ArrowsRightLeftIcon,
  WrenchScrewdriverIcon,
  CalendarDaysIcon,
  CalendarIcon,
  CubeIcon,
  ChatBubbleBottomCenterTextIcon,
  ScaleIcon,
  VideoCameraIcon,
  FaceSmileIcon,
  BoltIcon,
  ListBulletIcon,
  MegaphoneIcon,
  TagIcon,
  ShareIcon,
  LinkIcon,
  MapIcon,
  LinkSlashIcon,
  Cog6ToothIcon,
  Bars3BottomLeftIcon,
  BookOpenIcon,
  QueueListIcon,
  DocumentDuplicateIcon,
  ShieldCheckIcon,
  CpuChipIcon,
  CircleStackIcon,
  SignalIcon,
  FunnelIcon,
  SwatchIcon,
  PaintBrushIcon,
  QrCodeIcon,
  CommandLineIcon,
  BriefcaseIcon,
  RectangleStackIcon,
  FolderIcon,
  ViewColumnsIcon,
  TableCellsIcon,
  FlagIcon,
  BugAntIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentCheckIcon,
  BellAlertIcon,
  DocumentChartBarIcon,
  IdentificationIcon,
  HomeModernIcon,
  MapPinIcon,
  ServerStackIcon,
  DevicePhoneMobileIcon,
} from "@heroicons/react/24/outline";
import DashboardLayout from "components/DashboardLayout";
import { ADS_TOOLS } from "components/tools/adsToolsConfig";
import { TRADING_TOOLS } from "@/lib/trading-tools";
import { LEGAL_BUSINESS_NAME, SITE_BRAND } from "@/lib/business";

const agencyServices = [
  {
    href: "/apexridgelytics",
    title: "ApexRidgeLytics Consulting",
    description:
      "AI software agency — custom apps, SaaS, and LLM integrations. 4.8★ on Upwork, Fiverr, and more.",
    icon: SparklesIcon,
    iconBg: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600",
  },
];

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
    href: "/markdown-to-pdf",
    title: "Markdown to PDF",
    description: "Render Markdown and download a PDF instantly.",
    icon: DocumentTextIcon,
    iconBg: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600",
  },
  {
    href: "/html-to-pdf",
    title: "HTML to PDF",
    description: "Render HTML and download a PDF instantly.",
    icon: DocumentTextIcon,
    iconBg: "bg-amber-100 dark:bg-amber-900/30 text-amber-600",
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

const tradingTools = TRADING_TOOLS.slice(0, 8).map((tool) => ({
  href: `/${tool.path}`,
  title: tool.title,
  description: tool.shortDescription,
  icon: ChartBarIcon,
  iconBg: "bg-amber-100 dark:bg-amber-900/30 text-amber-600",
}));

const tradingProduct = {
  href: "/forex-trading-app",
  title: "Forex Trading Web App",
  description:
    "Production-ready trading platform with live charts and risk tools. Preview the demo — $499 one-time license.",
  icon: ComputerDesktopIcon,
  iconBg: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600",
  price: "$499",
};

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
  {
    href: "/meeting-notes-action-plan",
    title: "Meeting Notes to Action Plan",
    description:
      "Turn meeting notes into a practical action plan with owners, priorities, and next steps.",
    icon: ClipboardDocumentListIcon,
    iconBg: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600",
  },
  {
    href: "/weekly-review-generator",
    title: "Weekly Review Generator",
    description:
      "Generate a concise weekly review from your raw notes, metrics, and outcomes.",
    icon: BookOpenIcon,
    iconBg: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600",
  },
  {
    href: "/goal-breakdown-planner",
    title: "Goal Breakdown Planner",
    description:
      "Break a large goal into milestones, tasks, and an actionable timeline.",
    icon: PresentationChartLineIcon,
    iconBg: "bg-sky-100 dark:bg-sky-900/30 text-sky-600",
  },
  {
    href: "/habit-reflection-coach",
    title: "Habit Reflection Coach",
    description:
      "Reflect on your weekly habit performance and get practical improvement steps.",
    icon: SparklesIcon,
    iconBg: "bg-amber-100 dark:bg-amber-900/30 text-amber-600",
  },
  {
    href: "/pros-cons-analyzer",
    title: "Pros and Cons Analyzer",
    description:
      "Analyze decisions with balanced pros, cons, assumptions, and recommendations.",
    icon: ScaleIcon,
    iconBg: "bg-violet-100 dark:bg-violet-900/30 text-violet-600",
  },
  {
    href: "/text-summarizer",
    title: "Text Summarizer",
    description: "Paste long text and get a concise summary with key facts preserved.",
    icon: DocumentMagnifyingGlassIcon,
    iconBg: "bg-sky-100 dark:bg-sky-900/30 text-sky-600",
  },
  {
    href: "/sentence-rewriter",
    title: "Sentence Rewriter",
    description: "Rewrite for clarity and optional tone while keeping your meaning.",
    icon: PencilSquareIcon,
    iconBg: "bg-teal-100 dark:bg-teal-900/30 text-teal-600",
  },
  {
    href: "/bullet-point-extractor",
    title: "Bullet Point Extractor",
    description: "Turn paragraphs into a clean bullet list from your source text.",
    icon: ListBulletIcon,
    iconBg: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600",
  },
  {
    href: "/headline-improver",
    title: "Headline Improver",
    description: "Generate many headline options from a topic or draft line.",
    icon: MegaphoneIcon,
    iconBg: "bg-orange-100 dark:bg-orange-900/30 text-orange-600",
  },
  {
    href: "/email-polisher",
    title: "Email Polisher",
    description: "Polish grammar, structure, and tone of professional email drafts.",
    icon: EnvelopeIcon,
    iconBg: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600",
  },
  {
    href: "/blog-outline-generator",
    title: "Blog Outline Generator",
    description: "Turn a topic into a structured outline with sections and subsections.",
    icon: BookOpenIcon,
    iconBg: "bg-violet-100 dark:bg-violet-900/30 text-violet-600",
  },
  {
    href: "/product-description-generator",
    title: "Product Description Generator",
    description: "Store-ready product copy from features, benefits, and audience.",
    icon: DocumentTextIcon,
    iconBg: "bg-amber-100 dark:bg-amber-900/30 text-amber-600",
  },
  {
    href: "/meta-description-generator",
    title: "Meta Description Generator",
    description: "SEO-friendly meta descriptions from page title and content summary.",
    icon: TagIcon,
    iconBg: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600",
  },
  {
    href: "/cold-email-generator",
    title: "Cold Email Generator",
    description: "Short cold outreach drafts with subject line from your context.",
    icon: ChatBubbleLeftRightIcon,
    iconBg: "bg-lime-100 dark:bg-lime-900/30 text-lime-700",
  },
  {
    href: "/sql-query-generator",
    title: "SQL Query Generator",
    description: "Natural language to SQL with optional schema for accuracy.",
    icon: CommandLineIcon,
    iconBg: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
  },
  {
    href: "/regex-generator",
    title: "Regex Generator",
    description: "Describe a match in English; get a regex pattern and explanation.",
    icon: CodeBracketSquareIcon,
    iconBg: "bg-amber-100 dark:bg-amber-900/30 text-amber-600",
  },
  {
    href: "/code-explainer",
    title: "Code Explainer",
    description: "Paste a snippet and read a clear explanation of behavior and structure.",
    icon: CodeBracketSquareIcon,
    iconBg: "bg-violet-100 dark:bg-violet-900/30 text-violet-600",
  },
  {
    href: "/keyword-generator",
    title: "Keyword Generator",
    description: "Basic SEO-style keyword clusters and questions from a seed topic.",
    icon: HashtagIcon,
    iconBg: "bg-rose-100 dark:bg-rose-900/30 text-rose-600",
  },
  {
    href: "/policy-rewrite-assistant",
    title: "Policy Rewrite Assistant",
    description: "Rewrite policy text with cleaner language and selectable tone.",
    icon: DocumentTextIcon,
    iconBg: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600",
  },
  {
    href: "/email-thread-summarizer",
    title: "Email Thread Summarizer",
    description: "Summarize long email threads into key points and action items.",
    icon: ChatBubbleLeftRightIcon,
    iconBg: "bg-sky-100 dark:bg-sky-900/30 text-sky-600",
  },
  {
    href: "/followup-email-drafter",
    title: "Follow-up Email Drafter",
    description: "Generate a concise follow-up email from context and requested update.",
    icon: EnvelopeIcon,
    iconBg: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600",
  },
  {
    href: "/project-kickoff-brief",
    title: "Project Kickoff Brief Generator",
    description: "Build a kickoff brief with objective, scope, stakeholders, and timeline.",
    icon: ClipboardDocumentListIcon,
    iconBg: "bg-amber-100 dark:bg-amber-900/30 text-amber-600",
  },
  {
    href: "/palette-generator",
    title: "App Palette Generator",
    description:
      "Describe your app; get three UI color palettes with hex codes, roles, and previews.",
    icon: SwatchIcon,
    iconBg: "bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-600",
  },
  {
    href: "/inclusive-language-linter",
    title: "Inclusive Language Linter",
    description: "Starter rules for biased or charged wording, plus optional AI nuance.",
    icon: ShieldCheckIcon,
    iconBg: "bg-violet-100 dark:bg-violet-900/30 text-violet-600",
  },
  {
    href: "/plain-language-rewriter",
    title: "Plain Language Rewriter",
    description: "Simplify dense copy into clear, short sentences while preserving facts.",
    icon: ChatBubbleBottomCenterTextIcon,
    iconBg: "bg-teal-100 dark:bg-teal-900/30 text-teal-600",
  },
  {
    href: "/reading-level-estimator",
    title: "Reading Level Estimator",
    description: "Syllable heuristics and Flesch-style scores with optional AI coaching.",
    icon: BookOpenIcon,
    iconBg: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600",
  },
  {
    href: "/keyword-blog-outline",
    title: "Keyword → Blog Outline",
    description: "Fast scaffold from keyword lists plus optional AI outline (no PDF).",
    icon: QueueListIcon,
    iconBg: "bg-orange-100 dark:bg-orange-900/30 text-orange-600",
  },
];

const qrAndCodeTools = [
  {
    href: "/wifi-qr-generator",
    title: "Wi‑Fi QR Generator",
    description: "QR code for WPA/WPA2 or open networks using the standard WIFI: format.",
    icon: QrCodeIcon,
    iconBg: "bg-sky-100 dark:bg-sky-900/30 text-sky-600",
  },
  {
    href: "/vcard-qr-generator",
    title: "vCard QR Generator",
    description: "Encode contact details as a scannable vCard for phones and events.",
    icon: QrCodeIcon,
    iconBg: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600",
  },
  {
    href: "/barcode-generator",
    title: "Barcode Generator",
    description: "CODE128, EAN, UPC, and more — render a barcode to copy or save.",
    icon: QrCodeIcon,
    iconBg: "bg-teal-100 dark:bg-teal-900/30 text-teal-600",
  },
  {
    href: "/timezone-overlap-checker",
    title: "Time Zone Overlap Checker",
    description: "See when everyone’s local working hours overlap on a chosen date.",
    icon: GlobeAltIcon,
    iconBg: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600",
  },
  {
    href: "/qr-generate",
    title: "Text QR Generator",
    description: "Generate a QR code from any text and download it as a PNG.",
    icon: QrCodeIcon,
    iconBg: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600",
  },
];

const creatorTools = [
  {
    href: "/youtube-title-length-checker",
    title: "YouTube Title Length Checker",
    description:
      "Count graphemes against the 100-character YouTube title limit, including emoji.",
    icon: PlayCircleIcon,
    iconBg: "bg-red-100 dark:bg-red-900/30 text-red-600",
  },
  {
    href: "/youtube-description-length-checker",
    title: "YouTube Description Length Checker",
    description:
      "Check your description against the 5,000-character limit with line and byte stats.",
    icon: DocumentTextIcon,
    iconBg: "bg-red-100 dark:bg-red-900/30 text-red-600",
  },
  {
    href: "/hashtag-counter",
    title: "Hashtag Counter",
    description: "Count total and unique hashtags in any caption or bio.",
    icon: HashtagIcon,
    iconBg: "bg-rose-100 dark:bg-rose-900/30 text-rose-600",
  },
  {
    href: "/emoji-copy-tool",
    title: "Emoji Copy Tool",
    description:
      "One-tap copy for common emojis used in titles, descriptions, and posts.",
    icon: FaceSmileIcon,
    iconBg: "bg-amber-100 dark:bg-amber-900/30 text-amber-600",
  },
  {
    href: "/caption-formatter",
    title: "Caption Formatter",
    description:
      "Trim lines and collapse extra blank lines for cleaner social captions.",
    icon: ListBulletIcon,
    iconBg: "bg-sky-100 dark:bg-sky-900/30 text-sky-600",
  },
  {
    href: "/hook-generator",
    title: "Hook Generator",
    description:
      "Generate simple fill-in hooks from your topic for short-form content.",
    icon: BoltIcon,
    iconBg: "bg-violet-100 dark:bg-violet-900/30 text-violet-600",
  },
  {
    href: "/template-bio-generator",
    title: "Template Bio Generator",
    description:
      "Build three profile bios from your details using fixed templates (no AI).",
    icon: UserCircleIcon,
    iconBg: "bg-pink-100 dark:bg-pink-900/30 text-pink-600",
  },
  {
    href: "/social-thread-splitter",
    title: "Social Thread Splitter",
    description: "Numbered thread chunks for Bluesky, Threads, or X length limits.",
    icon: ListBulletIcon,
    iconBg: "bg-sky-100 dark:bg-sky-900/30 text-sky-600",
  },
  {
    href: "/social-character-counter",
    title: "Social Character Counter",
    description: "Compare one draft against Bluesky, Threads, X, and LinkedIn ceilings.",
    icon: DocumentChartBarIcon,
    iconBg: "bg-rose-100 dark:bg-rose-900/30 text-rose-600",
  },
  {
    href: "/poll-option-balancer",
    title: "Poll Option Balancer",
    description: "Dedupe, shuffle, and trim poll lines for cleaner surveys and posts.",
    icon: ArrowsRightLeftIcon,
    iconBg: "bg-amber-100 dark:bg-amber-900/30 text-amber-600",
  },
];

const workshopDeskTools = [
  {
    href: "/team-shuffler",
    title: "Team Shuffler",
    description: "Randomize names into balanced breakout groups for workshops.",
    icon: UserGroupIcon,
    iconBg: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600",
  },
  {
    href: "/name-tag-print",
    title: "Name Tag Print Layout",
    description: "Two-column printable cards for table tents or simple badges.",
    icon: IdentificationIcon,
    iconBg: "bg-pink-100 dark:bg-pink-900/30 text-pink-600",
  },
  {
    href: "/personal-dashboard",
    title: "Personal Dashboard",
    description: "Weather, local todos, and an optional AI focus line in one view.",
    icon: HomeModernIcon,
    iconBg: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700",
  },
];

const funViralTools = [
  {
    href: "/coin-flip",
    title: "Coin Flip",
    description:
      "Instant fair heads or tails — one tap when you need a quick decision.",
    icon: SparklesIcon,
    iconBg: "bg-amber-100 dark:bg-amber-900/30 text-amber-600",
  },
  {
    href: "/dice-roller",
    title: "Dice Roller",
    description:
      "Roll multiple dice with custom sides — great for games and tabletop.",
    icon: CubeIcon,
    iconBg: "bg-violet-100 dark:bg-violet-900/30 text-violet-600",
  },
  {
    href: "/random-name-picker",
    title: "Random Name Picker",
    description:
      "Paste a list of names and pick one winner at random for giveaways or turns.",
    icon: UserGroupIcon,
    iconBg: "bg-sky-100 dark:bg-sky-900/30 text-sky-600",
  },
  {
    href: "/truth-or-dare-generator",
    title: "Truth or Dare Generator",
    description:
      "Generate light party prompts — choose truth, dare, or either.",
    icon: ChatBubbleBottomCenterTextIcon,
    iconBg: "bg-rose-100 dark:bg-rose-900/30 text-rose-600",
  },
  {
    href: "/would-you-rather-generator",
    title: "Would You Rather Generator",
    description:
      "Random either-or dilemmas for icebreakers, streams, and group chats.",
    icon: ScaleIcon,
    iconBg: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600",
  },
  {
    href: "/iq-test",
    title: "IQ Test",
    description:
      "38-question cognitive assessment with visual puzzles, mindset prompts, and a detailed score report.",
    icon: LightBulbIcon,
    iconBg: "bg-blue-100 dark:bg-blue-900/30 text-blue-600",
  },
  {
    href: "/eq-test",
    title: "EQ Test",
    description:
      "30-scenario emotional intelligence assessment across self-awareness, empathy, regulation, social skills, and motivation.",
    icon: FaceSmileIcon,
    iconBg: "bg-teal-100 dark:bg-teal-900/30 text-teal-600",
  },
  {
    href: "/dna-test",
    title: "DNA Test",
    description:
      "Upload or take a selfie for a fun ancestry-style country estimate with flags and percentages (entertainment only).",
    icon: BeakerIcon,
    iconBg: "bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-600",
  },
];

const seoMarketingTools = [
  {
    href: "/meta-tag-preview",
    title: "Meta Tag Preview",
    description:
      "Preview title and meta description as an approximate Google search snippet.",
    icon: TagIcon,
    iconBg: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600",
  },
  {
    href: "/open-graph-preview",
    title: "Open Graph Preview",
    description:
      "See a link-style card from og:title, description, image, and URL fields.",
    icon: ShareIcon,
    iconBg: "bg-blue-100 dark:bg-blue-900/30 text-blue-600",
  },
  {
    href: "/keyword-density-checker",
    title: "Keyword Density Checker",
    description:
      "Measure how often a keyword or phrase appears versus total word count.",
    icon: ChartBarIcon,
    iconBg: "bg-violet-100 dark:bg-violet-900/30 text-violet-600",
  },
  {
    href: "/slug-generator",
    title: "Slug Generator",
    description: "Convert headings or titles into clean, URL-friendly slugs.",
    icon: LinkIcon,
    iconBg: "bg-teal-100 dark:bg-teal-900/30 text-teal-600",
  },
  {
    href: "/utm-builder",
    title: "UTM Builder",
    description:
      "Build campaign URLs with utm_source, medium, campaign, term, and content.",
    icon: ArrowTrendingUpIcon,
    iconBg: "bg-amber-100 dark:bg-amber-900/30 text-amber-600",
  },
  {
    href: "/robots-txt-generator",
    title: "Robots.txt Generator",
    description:
      "Generate a basic robots.txt with allow/disallow rules and sitemap line.",
    icon: Cog6ToothIcon,
    iconBg: "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300",
  },
  {
    href: "/sitemap-validator",
    title: "Sitemap Validator",
    description:
      "Paste XML to check structure, url entries, and loc URLs (basic, offline).",
    icon: MapIcon,
    iconBg: "bg-sky-100 dark:bg-sky-900/30 text-sky-600",
  },
  {
    href: "/canonical-url-checker",
    title: "Canonical URL Checker",
    description:
      "Normalize and compare a page URL to a canonical href or rel=canonical HTML.",
    icon: LinkSlashIcon,
    iconBg: "bg-rose-100 dark:bg-rose-900/30 text-rose-600",
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
  {
    href: "/split-pdf",
    title: "Split PDF",
    description:
      "Split a PDF into one page per file (downloads as ZIP).",
    icon: DocumentPlusIcon,
    iconBg: "bg-teal-100 dark:bg-teal-900/30 text-teal-600",
  },
  {
    href: "/rotate-pdf",
    title: "Rotate PDF",
    description:
      "Rotate an entire PDF or specific pages by 90-degree increments.",
    icon: ArrowsRightLeftIcon,
    iconBg: "bg-sky-100 dark:bg-sky-900/30 text-sky-600",
  },
  {
    href: "/pdf-metadata",
    title: "PDF Metadata",
    description:
      "Extract page count and document metadata (title, author, producer, etc.).",
    icon: DocumentTextIcon,
    iconBg: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600",
  },
  {
    href: "/pdf-to-text",
    title: "PDF to Text (OCR Extractor)",
    description:
      "Extract OCR text from uploaded PDFs and download the result as plain text.",
    icon: DocumentMagnifyingGlassIcon,
    iconBg: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600",
  },
  {
    href: "/pdf-metadata-inspector",
    title: "PDF Metadata Inspector + JSON Export",
    description:
      "Inspect PDF metadata and page count, then export structured JSON.",
    icon: DocumentTextIcon,
    iconBg: "bg-sky-100 dark:bg-sky-900/30 text-sky-600",
  },
  {
    href: "/pdf-extract-images",
    title: "Extract PDF Images",
    description:
      "Download embedded images from a PDF as a ZIP archive.",
    icon: PhotoIcon,
    iconBg: "bg-amber-100 dark:bg-amber-900/30 text-amber-600",
  },
  {
    href: "/image-to-pdf",
    title: "Image to PDF",
    description:
      "Convert an image (PNG/JPG/WebP/etc.) into a single-page PDF.",
    icon: DocumentArrowDownIcon,
    iconBg: "bg-violet-100 dark:bg-violet-900/30 text-violet-600",
  },
  {
    href: "/compress-pdf",
    title: "Compress PDF",
    description:
      "Shrink PDF size using Ghostscript PDF settings and download the optimized result.",
    icon: DocumentIcon,
    iconBg: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
  },
  {
    href: "/image-convert",
    title: "Image Convert Tool",
    description:
      "Convert images between PNG/JPEG/WebP with optional resizing, quality, and metadata stripping.",
    icon: PhotoIcon,
    iconBg: "bg-violet-100 dark:bg-violet-900/30 text-violet-600",
  },
  {
    href: "/compress-image",
    title: "Compress Image",
    description:
      "Compress an image by resizing and reducing quality, then download the smaller file.",
    icon: DocumentArrowDownIcon,
    iconBg: "bg-teal-100 dark:bg-teal-900/30 text-teal-600",
  },
  {
    href: "/zip-create",
    title: "Zip Create",
    description:
      "Combine multiple files into a single ZIP archive for easy sharing.",
    icon: CubeIcon,
    iconBg: "bg-amber-100 dark:bg-amber-900/30 text-amber-600",
  },
  {
    href: "/screenshot-to-pdf-reporter",
    title: "Screenshot to PDF Reporter",
    description:
      "Convert multiple screenshots to PDF and download all converted files in one ZIP package.",
    icon: DocumentArrowDownIcon,
    iconBg: "bg-violet-100 dark:bg-violet-900/30 text-violet-600",
  },
  {
    href: "/smart-qr-batch-generator",
    title: "Smart QR Batch Generator",
    description:
      "Generate many QR codes from line-separated values and export as a ZIP archive.",
    icon: QrCodeIcon,
    iconBg: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600",
  },
  {
    href: "/xlsx-to-json",
    title: "XLSX to JSON",
    description:
      "Convert the first sheet of an XLSX workbook into JSON rows.",
    icon: CodeBracketSquareIcon,
    iconBg: "bg-sky-100 dark:bg-sky-900/30 text-sky-600",
  },
  {
    href: "/data-profiler",
    title: "CSV/XLSX Quick Profiler",
    description:
      "Upload CSV/XLSX and get a quick profile of rows, columns, and empty cells.",
    icon: ChartBarIcon,
    iconBg: "bg-violet-100 dark:bg-violet-900/30 text-violet-600",
  },
  {
    href: "/bulk-zip-builder",
    title: "Batch File Archive Builder",
    description:
      "Select many files and package them into a single ZIP download.",
    icon: CubeIcon,
    iconBg: "bg-amber-100 dark:bg-amber-900/30 text-amber-600",
  },
  {
    href: "/markdown-report-bundle",
    title: "Markdown Report Packager",
    description:
      "Split markdown sections, render each to PDF, and bundle everything into one ZIP.",
    icon: DocumentArrowDownIcon,
    iconBg: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600",
  },
  {
    href: "/csv-cleaner",
    title: "CSV Cleaner",
    description:
      "Trim whitespace and remove blank rows from CSV files.",
    icon: CodeBracketSquareIcon,
    iconBg: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600",
  },
  {
    href: "/csv-column-mapper",
    title: "CSV Column Mapper",
    description:
      "Rename CSV headers quickly with your own column mapping.",
    icon: CodeBracketSquareIcon,
    iconBg: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600",
  },
  {
    href: "/csv-deduplicator",
    title: "CSV Deduplicator",
    description:
      "Remove duplicate rows while preserving original order.",
    icon: CodeBracketSquareIcon,
    iconBg: "bg-amber-100 dark:bg-amber-900/30 text-amber-600",
  },
  {
    href: "/csv-merge-assistant",
    title: "CSV Merge Assistant",
    description:
      "Merge multiple CSV files into one combined table.",
    icon: CodeBracketSquareIcon,
    iconBg: "bg-violet-100 dark:bg-violet-900/30 text-violet-600",
  },
  {
    href: "/csv-to-markdown-table",
    title: "CSV to Markdown Table",
    description:
      "Convert CSV rows into markdown table format for docs.",
    icon: DocumentTextIcon,
    iconBg: "bg-rose-100 dark:bg-rose-900/30 text-rose-600",
  },
  {
    href: "/xlsx-sheet-explorer",
    title: "XLSX Sheet Explorer",
    description:
      "Inspect the first worksheet rows with a quick table preview.",
    icon: CodeBracketSquareIcon,
    iconBg: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600",
  },
  {
    href: "/xlsx-chart-json",
    title: "XLSX to Chart JSON",
    description:
      "Generate labels and dataset JSON from XLSX columns.",
    icon: ChartBarIcon,
    iconBg: "bg-lime-100 dark:bg-lime-900/30 text-lime-700",
  },
  {
    href: "/zip-notes-packager",
    title: "ZIP Notes Packager",
    description:
      "Split text notes into files and download one ZIP package.",
    icon: CubeIcon,
    iconBg: "bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-600",
  },
  {
    href: "/pdf-ocr-translate",
    title: "PDF OCR + Translate",
    description:
      "Extract PDF text with OCR and translate into a cleaner readable version.",
    icon: LanguageIcon,
    iconBg: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600",
  },
  {
    href: "/pdf-keyword-extractor",
    title: "PDF Keyword Extractor",
    description:
      "Extract key terms and keyword phrases from PDF content.",
    icon: HashtagIcon,
    iconBg: "bg-rose-100 dark:bg-rose-900/30 text-rose-600",
  },
  {
    href: "/pdf-qa-assistant",
    title: "PDF Q&A Assistant",
    description:
      "Ask a question and get an answer based on your uploaded PDF.",
    icon: ChatBubbleLeftRightIcon,
    iconBg: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600",
  },
  {
    href: "/pdf-to-markdown",
    title: "PDF to Markdown",
    description:
      "Extract OCR text and reformat it to markdown-ready output.",
    icon: DocumentTextIcon,
    iconBg: "bg-violet-100 dark:bg-violet-900/30 text-violet-600",
  },
  {
    href: "/pdf-outline-generator",
    title: "PDF Outline Generator",
    description:
      "Generate section-by-section outline bullets from PDF text.",
    icon: QueueListIcon,
    iconBg: "bg-amber-100 dark:bg-amber-900/30 text-amber-600",
  },
  {
    href: "/pdf-action-items",
    title: "PDF Action Items Extractor",
    description:
      "Turn document text into actionable tasks, owners, and due dates.",
    icon: ClipboardDocumentListIcon,
    iconBg: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600",
  },
  {
    href: "/multi-pdf-compare",
    title: "Multi-PDF Compare",
    description:
      "Compare multiple PDF files and summarize key differences.",
    icon: ArrowsRightLeftIcon,
    iconBg: "bg-sky-100 dark:bg-sky-900/30 text-sky-600",
  },
  {
    href: "/pdf-compliance-checker",
    title: "PDF Compliance Checker",
    description:
      "Run quick metadata and page-limit checks before document delivery.",
    icon: ShieldCheckIcon,
    iconBg: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600",
  },
  {
    href: "/pdf-range-splitter",
    title: "PDF Page Range Splitter",
    description:
      "Extract a custom page range like 1-3,5 into a new PDF.",
    icon: DocumentPlusIcon,
    iconBg: "bg-teal-100 dark:bg-teal-900/30 text-teal-600",
  },
  {
    href: "/pdf-rotate-compress",
    title: "PDF Rotate + Compress Pipeline",
    description:
      "Rotate first, then compress the same PDF in one workflow.",
    icon: ArrowsRightLeftIcon,
    iconBg: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600",
  },
  {
    href: "/image-batch-to-pdf",
    title: "Image Batch to PDF",
    description:
      "Convert many images into PDFs and package all outputs in a ZIP.",
    icon: PhotoIcon,
    iconBg: "bg-rose-100 dark:bg-rose-900/30 text-rose-600",
  },
  {
    href: "/markdown-brand-pdf",
    title: "Markdown to Branded PDF",
    description:
      "Apply simple brand metadata to markdown then export as PDF.",
    icon: DocumentArrowDownIcon,
    iconBg: "bg-violet-100 dark:bg-violet-900/30 text-violet-600",
  },
  {
    href: "/html-invoice-to-pdf",
    title: "HTML Invoice to PDF",
    description:
      "Generate invoice HTML and export directly to a PDF file.",
    icon: ReceiptPercentIcon,
    iconBg: "bg-amber-100 dark:bg-amber-900/30 text-amber-600",
  },
];

const focusPlanningTools = [
  {
    href: "/pomodoro-timer",
    title: "Pomodoro Timer",
    description:
      "Work and break intervals with session history saved in your browser.",
    icon: ClockIcon,
    iconBg: "bg-rose-100 dark:bg-rose-900/30 text-rose-600",
  },
  {
    href: "/deep-work-stopwatch",
    title: "Deep Work Stopwatch",
    description: "Count-up timer for focus blocks with optional session log.",
    icon: BoltIcon,
    iconBg: "bg-violet-100 dark:bg-violet-900/30 text-violet-600",
  },
  {
    href: "/daily-time-block-planner",
    title: "Daily Time Block Planner",
    description: "Plan labeled start and end times for each part of your day.",
    icon: CalendarDaysIcon,
    iconBg: "bg-sky-100 dark:bg-sky-900/30 text-sky-600",
  },
  {
    href: "/weekly-calendar-notes",
    title: "Weekly Calendar Notes",
    description: "Monday–Sunday notes grid with local persistence.",
    icon: CalendarIcon,
    iconBg: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600",
  },
  {
    href: "/eisenhower-matrix",
    title: "Eisenhower Matrix",
    description: "Sort tasks across urgent and important quadrants.",
    icon: Squares2X2Icon,
    iconBg: "bg-amber-100 dark:bg-amber-900/30 text-amber-600",
  },
  {
    href: "/para-inbox",
    title: "PARA Inbox",
    description: "Projects, Areas, Resources, and Archive capture lists.",
    icon: FolderIcon,
    iconBg: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600",
  },
  {
    href: "/personal-kanban",
    title: "Personal Kanban",
    description: "To do, Doing, and Done columns with local storage.",
    icon: ViewColumnsIcon,
    iconBg: "bg-teal-100 dark:bg-teal-900/30 text-teal-600",
  },
];

const workHabitsTools = [
  {
    href: "/habit-chain-calendar",
    title: "Habit chain calendar",
    description:
      "Mark completed days on a month grid and track your current streak locally.",
    icon: CalendarDaysIcon,
    iconBg: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600",
  },
  {
    href: "/one-big-thing",
    title: "One big thing",
    description:
      "Pick one daily focus and keep a short log of what mattered each day.",
    icon: LightBulbIcon,
    iconBg: "bg-amber-100 dark:bg-amber-900/30 text-amber-600",
  },
  {
    href: "/energy-journal",
    title: "Energy journal",
    description:
      "Rate focus from 1–10 for every hour to see when you peak and dip.",
    icon: BoltIcon,
    iconBg: "bg-violet-100 dark:bg-violet-900/30 text-violet-600",
  },
  {
    href: "/meeting-cost-timer",
    title: "Meeting cost timer",
    description:
      "Run a timer with attendees and hourly rate to watch estimated meeting burn.",
    icon: ClockIcon,
    iconBg: "bg-rose-100 dark:bg-rose-900/30 text-rose-600",
  },
  {
    href: "/standup-formatter",
    title: "Standup formatter",
    description:
      "Turn yesterday / today / blockers into a tidy snippet for Slack or tickets.",
    icon: ListBulletIcon,
    iconBg: "bg-sky-100 dark:bg-sky-900/30 text-sky-600",
  },
  {
    href: "/retrospective-board",
    title: "Retrospective board",
    description:
      "Capture went well, improve, and actions — then export markdown for the team.",
    icon: ViewColumnsIcon,
    iconBg: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600",
  },
  {
    href: "/decision-log",
    title: "Decision log",
    description:
      "Record context, options, the choice, and a revisit date in the browser.",
    icon: ClipboardDocumentListIcon,
    iconBg: "bg-teal-100 dark:bg-teal-900/30 text-teal-600",
  },
  {
    href: "/pros-cons-matrix",
    title: "Pros / cons matrix",
    description:
      "Weight criteria and score options 0–10 for a quick weighted comparison.",
    icon: ScaleIcon,
    iconBg: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
  },
];

const textProductivityTools = [
  {
    href: "/word-counter",
    title: "Word Counter",
    description:
      "Count words, characters with or without spaces, lines, and paragraphs.",
    icon: Bars3BottomLeftIcon,
    iconBg: "bg-teal-100 dark:bg-teal-900/30 text-teal-600",
  },
  {
    href: "/reading-time-estimator",
    title: "Reading Time Estimator",
    description:
      "Estimate read time from word count and your words-per-minute setting.",
    icon: BookOpenIcon,
    iconBg: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600",
  },
  {
    href: "/text-case-converter",
    title: "Text Case Converter",
    description:
      "Switch between uppercase, lowercase, title case, and sentence case.",
    icon: ArrowsRightLeftIcon,
    iconBg: "bg-amber-100 dark:bg-amber-900/30 text-amber-600",
  },
  {
    href: "/remove-duplicate-lines",
    title: "Remove Duplicate Lines",
    description:
      "Drop repeated lines while keeping order and optional trim or case rules.",
    icon: QueueListIcon,
    iconBg: "bg-sky-100 dark:bg-sky-900/30 text-sky-600",
  },
  {
    href: "/text-diff-checker",
    title: "Text Diff Checker",
    description:
      "Compare two texts line by line to see additions, removals, and unchanged lines.",
    icon: DocumentDuplicateIcon,
    iconBg: "bg-violet-100 dark:bg-violet-900/30 text-violet-600",
  },
  {
    href: "/password-generator",
    title: "Password Generator",
    description:
      "Create random passwords with length and character set options.",
    icon: KeyIcon,
    iconBg: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
  },
  {
    href: "/password-strength-checker",
    title: "Password Strength Checker",
    description:
      "Score password strength and get quick tips to improve security.",
    icon: ShieldCheckIcon,
    iconBg: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600",
  },
];

const studyMeetingTools = [
  {
    href: "/reading-speed-test",
    title: "Reading Speed Test",
    description:
      "Time a fixed passage for WPM and estimate minutes to finish pasted text at your pace.",
    icon: BoltIcon,
    iconBg: "bg-amber-100 dark:bg-amber-900/30 text-amber-600",
  },
  {
    href: "/syllabus-week-generator",
    title: "Syllabus Week Generator",
    description:
      "Build week-by-week date ranges from a start date and highlight holidays (YYYY-MM-DD).",
    icon: CalendarDaysIcon,
    iconBg: "bg-sky-100 dark:bg-sky-900/30 text-sky-600",
  },
  {
    href: "/grade-needed-calculator",
    title: "Grade Needed on Final",
    description:
      "Weighted course average: see the exam score required to hit your target grade.",
    icon: CalculatorIcon,
    iconBg: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600",
  },
  {
    href: "/study-topic-picker",
    title: "Study Topic Picker",
    description: "Random line from your pool — pick what to study next without debate.",
    icon: QueueListIcon,
    iconBg: "bg-violet-100 dark:bg-violet-900/30 text-violet-600",
  },
  {
    href: "/vocabulary-quiz",
    title: "Vocabulary Quiz",
    description:
      "Build a word list from pasted text; optional AI definitions for multiple-choice practice.",
    icon: BookOpenIcon,
    iconBg: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600",
  },
  {
    href: "/mind-map-outliner",
    title: "Mind-Map Outliner",
    description: "Indented bullets to a clean tree you can copy for docs or slides.",
    icon: Bars3BottomLeftIcon,
    iconBg: "bg-teal-100 dark:bg-teal-900/30 text-teal-600",
  },
  {
    href: "/meeting-agenda-timer",
    title: "Meeting Agenda Timer",
    description: "Agenda rows with minutes each and a simple countdown per topic.",
    icon: ClockIcon,
    iconBg: "bg-sky-100 dark:bg-sky-900/30 text-sky-600",
  },
  {
    href: "/meeting-parking-lot",
    title: "Meeting Parking Lot",
    description: "List ideas to revisit later and copy a numbered export for notes.",
    icon: ClipboardDocumentListIcon,
    iconBg: "bg-violet-100 dark:bg-violet-900/30 text-violet-600",
  },
  {
    href: "/action-items-extractor",
    title: "Action Item Extractor",
    description:
      "Pull TODO and checkbox lines from notes, or use AI for unstructured meeting text.",
    icon: CheckCircleIcon,
    iconBg: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600",
  },
  {
    href: "/tone-checker",
    title: "Tone Checker",
    description:
      "Quick caps and punctuation signals plus AI feedback for Slack or email drafts.",
    icon: ChatBubbleBottomCenterTextIcon,
    iconBg: "bg-amber-100 dark:bg-amber-900/30 text-amber-600",
  },
];

const projectManagementTools = [
  {
    href: "/raci-chart-builder",
    title: "RACI chart builder",
    description: "Map tasks to Responsible, Accountable, Consulted, and Informed roles.",
    icon: TableCellsIcon,
    iconBg: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600",
  },
  {
    href: "/okr-tree-writer",
    title: "OKR tree writer",
    description: "One objective plus key results in a clean outline you can paste anywhere.",
    icon: FlagIcon,
    iconBg: "bg-violet-100 dark:bg-violet-900/30 text-violet-600",
  },
  {
    href: "/smart-goal-checker",
    title: "SMART goal checker",
    description: "Guided prompts for Specific, Measurable, Achievable, Relevant, and Time-bound.",
    icon: LightBulbIcon,
    iconBg: "bg-amber-100 dark:bg-amber-900/30 text-amber-600",
  },
  {
    href: "/backlog-prioritizer",
    title: "Backlog prioritizer",
    description: "RICE scoring or MoSCoW buckets to compare backlog items.",
    icon: FunnelIcon,
    iconBg: "bg-teal-100 dark:bg-teal-900/30 text-teal-600",
  },
  {
    href: "/roadmap-quarter-planner",
    title: "Roadmap quarter planner",
    description: "Themes and initiatives for a quarter, with optional theme tags per line.",
    icon: CalendarDaysIcon,
    iconBg: "bg-sky-100 dark:bg-sky-900/30 text-sky-600",
  },
  {
    href: "/user-story-splitter",
    title: "User story splitter",
    description: "Format As a / I want / So that stories for your backlog.",
    icon: ChatBubbleBottomCenterTextIcon,
    iconBg: "bg-rose-100 dark:bg-rose-900/30 text-rose-600",
  },
  {
    href: "/acceptance-criteria-generator",
    title: "Acceptance criteria generator",
    description: "Given/When/Then skeleton plus a practical engineering checklist.",
    icon: ClipboardDocumentCheckIcon,
    iconBg: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600",
  },
  {
    href: "/bug-report-templater",
    title: "Bug report templater",
    description: "Repro steps, environment, expected vs actual for issue trackers.",
    icon: BugAntIcon,
    iconBg: "bg-red-100 dark:bg-red-900/30 text-red-600",
  },
  {
    href: "/incident-timeline-builder",
    title: "Incident timeline builder",
    description: "UTC-ordered events with roles and links for postmortems.",
    icon: ExclamationTriangleIcon,
    iconBg: "bg-orange-100 dark:bg-orange-900/30 text-orange-600",
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
    href: "/position-size-calculator",
    title: "Position Size Calculator",
    description:
      "Size your position from account risk, entry, and stop distance.",
    icon: ChartBarIcon,
    iconBg: "bg-amber-100 dark:bg-amber-900/30 text-amber-600",
  },
  {
    href: "/risk-per-trade-calculator",
    title: "Risk per Trade Calculator",
    description:
      "Convert a risk percentage into the exact dollar risk per trade.",
    icon: CalculatorIcon,
    iconBg: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600",
  },
  {
    href: "/r-multiple-tracker",
    title: "R-Multiple Tracker",
    description:
      "Track your trade outcomes in standardized R units.",
    icon: ChartBarIcon,
    iconBg: "bg-violet-100 dark:bg-violet-900/30 text-violet-600",
  },
  {
    href: "/risk-reward-ratio-calculator",
    title: "Risk-Reward Ratio Calculator",
    description:
      "Measure reward versus risk from entry, stop, and target.",
    icon: CalculatorIcon,
    iconBg: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600",
  },
  {
    href: "/break-even-win-rate-calculator",
    title: "Break-Even Win Rate Calculator",
    description:
      "Find the minimum win rate needed for break-even expectancy.",
    icon: CalculatorIcon,
    iconBg: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600",
  },
  {
    href: "/drawdown-recovery-calculator",
    title: "Drawdown Recovery Calculator",
    description:
      "See the gain required to recover from a given drawdown.",
    icon: ChartBarIcon,
    iconBg: "bg-rose-100 dark:bg-rose-900/30 text-rose-600",
  },
  {
    href: "/max-daily-loss-guardrail-calculator",
    title: "Max Daily Loss Guardrail Calculator",
    description:
      "Set a daily loss cap and estimate max full-R losses.",
    icon: CalculatorIcon,
    iconBg: "bg-rose-100 dark:bg-rose-900/30 text-rose-600",
  },
  {
    href: "/kelly-criterion-calculator",
    title: "Kelly Criterion Calculator",
    description:
      "Estimate optimal bankroll fraction from win rate and edge.",
    icon: ChartPieIcon,
    iconBg: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600",
  },
  {
    href: "/fixed-fractional-sizing-tool",
    title: "Fixed Fractional Sizing Tool",
    description:
      "Position sizing with a fixed equity risk percentage model.",
    icon: CalculatorIcon,
    iconBg: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600",
  },
  {
    href: "/atr-position-sizing-tool",
    title: "ATR Position Sizing Tool",
    description:
      "Use ATR-based stop distance to size each trade position.",
    icon: ChartBarIcon,
    iconBg: "bg-amber-100 dark:bg-amber-900/30 text-amber-600",
  },
  {
    href: "/volatility-based-stop-loss-calculator",
    title: "Volatility-Based Stop Loss Calculator",
    description:
      "Build stop loss levels from ATR and market direction.",
    icon: CalculatorIcon,
    iconBg: "bg-violet-100 dark:bg-violet-900/30 text-violet-600",
  },
  {
    href: "/trailing-stop-planner",
    title: "Trailing Stop Planner",
    description:
      "Plan dynamic trailing stop levels and locked-in P/L.",
    icon: ChartBarIcon,
    iconBg: "bg-amber-100 dark:bg-amber-900/30 text-amber-600",
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
    href: "/multi-target-take-profit-planner",
    title: "Multi-Target Take-Profit Planner",
    description:
      "Plan up to 4 take-profit targets and estimate weighted reward-to-risk.",
    icon: ChartBarIcon,
    iconBg: "bg-amber-100 dark:bg-amber-900/30 text-amber-600",
  },
  {
    href: "/partial-exit-optimizer",
    title: "Partial Exit Optimizer",
    description:
      "Model scale-out percentages and compare effective R multiple outcomes.",
    icon: ChartPieIcon,
    iconBg: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600",
  },
  {
    href: "/breakeven-stop-trigger-planner",
    title: "Breakeven Stop Trigger Planner",
    description:
      "Choose when to move stop to breakeven based on reward multiples.",
    icon: CalculatorIcon,
    iconBg: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600",
  },
  {
    href: "/slippage-impact-calculator",
    title: "Slippage Impact Calculator",
    description:
      "Estimate execution drag from slippage in pips/points and position size.",
    icon: CalculatorIcon,
    iconBg: "bg-violet-100 dark:bg-violet-900/30 text-violet-600",
  },
  {
    href: "/spread-cost-calculator",
    title: "Spread Cost Calculator",
    description:
      "Calculate spread cost per trade from spread and pip value assumptions.",
    icon: CalculatorIcon,
    iconBg: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600",
  },
  {
    href: "/commission-impact-calculator",
    title: "Commission Impact Calculator",
    description:
      "Measure one-way and round-turn commission impact on your trade plan.",
    icon: BanknotesIcon,
    iconBg: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600",
  },
  {
    href: "/overnight-swap-funding-calculator",
    title: "Overnight Swap/Funding Calculator",
    description:
      "Estimate overnight holding cost or credit across holding days.",
    icon: BanknotesIcon,
    iconBg: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600",
  },
  {
    href: "/leverage-safety-calculator",
    title: "Leverage Safety Calculator",
    description:
      "Estimate max safer leverage from stop distance and tolerated loss.",
    icon: ScaleIcon,
    iconBg: "bg-violet-100 dark:bg-violet-900/30 text-violet-600",
  },
  {
    href: "/margin-call-price-calculator",
    title: "Margin Call Price Calculator",
    description:
      "Approximate margin call trigger price from margin and position inputs.",
    icon: CalculatorIcon,
    iconBg: "bg-amber-100 dark:bg-amber-900/30 text-amber-600",
  },
  {
    href: "/liquidation-price-calculator",
    title: "Liquidation Price Calculator",
    description:
      "Estimate isolated-margin liquidation level for long or short positions.",
    icon: CalculatorIcon,
    iconBg: "bg-rose-100 dark:bg-rose-900/30 text-rose-600",
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
    href: "/priority-score-calculator",
    title: "Priority Score Calculator",
    description:
      "Rank initiatives using impact, urgency, confidence, and effort.",
    icon: CalculatorIcon,
    iconBg: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600",
  },
  {
    href: "/rice-score-calculator",
    title: "RICE Score Calculator",
    description:
      "Compute RICE score from reach, impact, confidence, and effort.",
    icon: CalculatorIcon,
    iconBg: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600",
  },
  {
    href: "/ice-score-calculator",
    title: "ICE Score Calculator",
    description:
      "Prioritize ideas quickly using impact, confidence, and ease.",
    icon: CalculatorIcon,
    iconBg: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600",
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
  {
    href: "/b2b-pipeline-roas-calculator",
    title: "B2B Pipeline ROAS Calculator",
    description:
      "Estimate closed-revenue and profit ROAS from spend, pipeline, win rate, and margin.",
    icon: ChartBarIcon,
    iconBg: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600",
  },
  {
    href: "/agency-client-reporting-generator",
    title: "Agency Client Reporting Generator",
    description:
      "Generate CTR, CPC, CPL, CVR, CPA, and ROAS reporting metrics from campaign totals.",
    icon: DocumentTextIcon,
    iconBg: "bg-sky-100 dark:bg-sky-900/30 text-sky-600",
  },
  {
    href: "/weekly-performance-narrative-ai",
    title: "Weekly Performance Narrative AI",
    description:
      "Turn weekly KPI changes into a ready-to-use performance narrative and recommendations.",
    icon: SparklesIcon,
    iconBg: "bg-violet-100 dark:bg-violet-900/30 text-violet-600",
  },
  {
    href: "/account-health-scorecard",
    title: "Account Health Scorecard",
    description:
      "Score account health using efficiency, delivery, and auction pressure signals.",
    icon: ChartPieIcon,
    iconBg: "bg-amber-100 dark:bg-amber-900/30 text-amber-600",
  },
  {
    href: "/campaign-naming-convention-generator",
    title: "Campaign Naming Convention Generator",
    description:
      "Generate standardized campaign names from channel, objective, audience, and date tags.",
    icon: TagIcon,
    iconBg: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600",
  },
  {
    href: "/ads-sop-generator",
    title: "Ads SOP Generator",
    description:
      "Create a practical SOP template for recurring paid media operations.",
    icon: ClipboardDocumentListIcon,
    iconBg: "bg-teal-100 dark:bg-teal-900/30 text-teal-600",
  },
  {
    href: "/creative-testing-roadmap-planner",
    title: "Creative Testing Roadmap Planner",
    description:
      "Plan test volume and coverage from weekly budget, CPM, concepts, and variants.",
    icon: LightBulbIcon,
    iconBg: "bg-rose-100 dark:bg-rose-900/30 text-rose-600",
  },
  {
    href: "/portfolio-risk-heatmap",
    title: "Portfolio Risk Heatmap",
    description: "Estimate each position's contribution to portfolio risk.",
    icon: ChartBarIcon,
    iconBg: "bg-amber-100 dark:bg-amber-900/30 text-amber-600",
  },
  {
    href: "/correlation-matrix-tool",
    title: "Correlation Matrix Tool",
    description: "Calculate pairwise correlations from historical asset returns.",
    icon: ChartBarIcon,
    iconBg: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600",
  },
  {
    href: "/beta-exposure-calculator",
    title: "Beta Exposure Calculator",
    description: "Measure portfolio market beta from position values and betas.",
    icon: ChartBarIcon,
    iconBg: "bg-violet-100 dark:bg-violet-900/30 text-violet-600",
  },
  {
    href: "/sector-exposure-analyzer",
    title: "Sector Exposure Analyzer",
    description: "See sector concentration and identify overexposure quickly.",
    icon: ChartPieIcon,
    iconBg: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600",
  },
  {
    href: "/currency-exposure-analyzer",
    title: "Currency Exposure Analyzer",
    description: "Break down currency allocation and FX concentration risk.",
    icon: ChartPieIcon,
    iconBg: "bg-sky-100 dark:bg-sky-900/30 text-sky-600",
  },
  {
    href: "/concentration-risk-analyzer",
    title: "Concentration Risk Analyzer",
    description: "Use HHI and largest-position share to assess concentration.",
    icon: ChartPieIcon,
    iconBg: "bg-rose-100 dark:bg-rose-900/30 text-rose-600",
  },
  {
    href: "/var-calculator",
    title: "VaR (Value at Risk) Calculator",
    description: "Parametric VaR from value, volatility, confidence, and horizon.",
    icon: CalculatorIcon,
    iconBg: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600",
  },
  {
    href: "/expected-shortfall-calculator",
    title: "Expected Shortfall Calculator",
    description: "Estimate average tail loss beyond VaR under normal assumptions.",
    icon: CalculatorIcon,
    iconBg: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600",
  },
  {
    href: "/monte-carlo-equity-simulator",
    title: "Monte Carlo Equity Simulator",
    description: "Project ending equity and uncertainty from trade return stats.",
    icon: ChartBarIcon,
    iconBg: "bg-amber-100 dark:bg-amber-900/30 text-amber-600",
  },
  {
    href: "/equity-curve-analyzer",
    title: "Equity Curve Analyzer",
    description: "Compute total return and max drawdown from an equity series.",
    icon: ChartBarIcon,
    iconBg: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600",
  },
  {
    href: "/streak-probability-calculator",
    title: "Streak Probability Calculator",
    description: "Probability of at least one winning streak over N trades.",
    icon: CalculatorIcon,
    iconBg: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600",
  },
  {
    href: "/win-loss-streak-risk-estimator",
    title: "Win/Loss Streak Risk Estimator",
    description: "Estimate likelihood of a losing streak given your win rate.",
    icon: CalculatorIcon,
    iconBg: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600",
  },
  {
    href: "/risk-of-ruin-calculator",
    title: "Risk of Ruin Calculator",
    description: "Approximate ruin probability from edge and risk sizing.",
    icon: CalculatorIcon,
    iconBg: "bg-rose-100 dark:bg-rose-900/30 text-rose-600",
  },
  {
    href: "/expectancy-calculator",
    title: "Expectancy Calculator",
    description: "Expected value per trade from win rate and average win/loss.",
    icon: CalculatorIcon,
    iconBg: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600",
  },
  {
    href: "/profit-factor-calculator",
    title: "Profit Factor Calculator",
    description: "Gross profit divided by gross loss for strategy quality.",
    icon: CalculatorIcon,
    iconBg: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600",
  },
  {
    href: "/sharpe-ratio-calculator",
    title: "Sharpe Ratio Calculator",
    description: "Risk-adjusted return using total volatility.",
    icon: CalculatorIcon,
    iconBg: "bg-violet-100 dark:bg-violet-900/30 text-violet-600",
  },
  {
    href: "/sortino-ratio-calculator",
    title: "Sortino Ratio Calculator",
    description: "Risk-adjusted return based on downside deviation only.",
    icon: CalculatorIcon,
    iconBg: "bg-violet-100 dark:bg-violet-900/30 text-violet-600",
  },
];

const tradingSystemTools = [
  { href: "/calmar-ratio-calculator", title: "Calmar Ratio Calculator", description: "Annual return divided by max drawdown.", icon: ChartBarIcon, iconBg: "bg-amber-100 dark:bg-amber-900/30 text-amber-600" },
  { href: "/trade-journal-manual", title: "Trade Journal (Manual)", description: "Summarize win rate, expectancy, and net from your notes.", icon: ClipboardDocumentListIcon, iconBg: "bg-sky-100 dark:bg-sky-900/30 text-sky-600" },
  { href: "/auto-trade-journal-csv", title: "Auto Trade Journal from CSV", description: "Use CSV-derived metrics to evaluate trading performance.", icon: DocumentTextIcon, iconBg: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600" },
  { href: "/screenshot-note-trade-journal", title: "Screenshot + Note Trade Journal", description: "Track screenshot-tagged setups and outcomes.", icon: PhotoIcon, iconBg: "bg-violet-100 dark:bg-violet-900/30 text-violet-600" },
  { href: "/setup-tag-performance-analyzer", title: "Setup Tag Performance Analyzer", description: "Analyze edge by setup tag.", icon: TagIcon, iconBg: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600" },
  { href: "/session-performance-analyzer", title: "Session Performance Analyzer", description: "Evaluate performance by market session.", icon: ClockIcon, iconBg: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600" },
  { href: "/day-of-week-performance-analyzer", title: "Day-of-Week Performance Analyzer", description: "Find your strongest weekdays.", icon: CalendarDaysIcon, iconBg: "bg-rose-100 dark:bg-rose-900/30 text-rose-600" },
  { href: "/time-of-day-edge-analyzer", title: "Time-of-Day Edge Analyzer", description: "Measure edge by intraday time block.", icon: CalendarIcon, iconBg: "bg-orange-100 dark:bg-orange-900/30 text-orange-600" },
  { href: "/long-vs-short-performance-analyzer", title: "Long vs Short Performance Analyzer", description: "Compare directional strategy performance.", icon: ArrowsRightLeftIcon, iconBg: "bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-600" },
  { href: "/ab-strategy-comparator", title: "A/B Strategy Comparator", description: "Compare two strategy variants side by side.", icon: ScaleIcon, iconBg: "bg-lime-100 dark:bg-lime-900/30 text-lime-700" },
  { href: "/strategy-backtest-lite", title: "Strategy Backtest Lite", description: "Estimate expectancy and projected P&L.", icon: PresentationChartLineIcon, iconBg: "bg-blue-100 dark:bg-blue-900/30 text-blue-600" },
  { href: "/walk-forward-backtest-tool", title: "Walk-Forward Backtest Tool", description: "Check in-sample vs out-of-sample robustness.", icon: ChartPieIcon, iconBg: "bg-teal-100 dark:bg-teal-900/30 text-teal-600" },
  { href: "/parameter-sensitivity-tester", title: "Parameter Sensitivity Tester", description: "Test robustness to parameter changes.", icon: WrenchScrewdriverIcon, iconBg: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400" },
  { href: "/regime-filter-tester", title: "Regime Filter Tester", description: "Quantify lift from regime filtering.", icon: FunnelIcon, iconBg: "bg-amber-100 dark:bg-amber-900/30 text-amber-600" },
  { href: "/volatility-regime-detector", title: "Volatility Regime Detector", description: "Classify low/normal/high volatility regimes.", icon: BoltIcon, iconBg: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700" },
  { href: "/trend-strength-detector", title: "Trend Strength Detector", description: "ADX-based trend strength and bias.", icon: ArrowTrendingUpIcon, iconBg: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600" },
  { href: "/mean-reversion-detector", title: "Mean Reversion Detector", description: "Detect stretched price conditions.", icon: ArrowUturnLeftIcon, iconBg: "bg-pink-100 dark:bg-pink-900/30 text-pink-600" },
  { href: "/breakout-probability-tool", title: "Breakout Probability Tool", description: "Estimate breakout confidence from pressure + volume.", icon: SignalIcon, iconBg: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600" },
  { href: "/range-compression-detector", title: "Range Compression Detector", description: "Flag range contraction before expansion.", icon: Bars3BottomLeftIcon, iconBg: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600" },
  { href: "/support-resistance-mapper", title: "Support/Resistance Mapper", description: "Map practical support and resistance zones.", icon: MapIcon, iconBg: "bg-violet-100 dark:bg-violet-900/30 text-violet-600" },
  { href: "/pivot-levels-calculator", title: "Pivot Levels Calculator", description: "Classic pivot, support, and resistance levels.", icon: CalculatorIcon, iconBg: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600" },
  { href: "/vwap-bands-calculator", title: "VWAP Bands Calculator", description: "Calculate upper/lower VWAP standard-deviation bands.", icon: ChartBarIcon, iconBg: "bg-teal-100 dark:bg-teal-900/30 text-teal-600" },
  { href: "/fibonacci-confluence-tool", title: "Fibonacci Confluence Tool", description: "Project key retracement levels for confluence.", icon: CommandLineIcon, iconBg: "bg-rose-100 dark:bg-rose-900/30 text-rose-600" },
  { href: "/market-structure-identifier", title: "Market Structure Identifier", description: "Classify HH/HL vs LH/LL conditions.", icon: Squares2X2Icon, iconBg: "bg-sky-100 dark:bg-sky-900/30 text-sky-600" },
  { href: "/swing-high-low-detector", title: "Swing High/Low Detector", description: "Locate swing context in a lookback range.", icon: QueueListIcon, iconBg: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600" },
  { href: "/supply-demand-zone-marker", title: "Supply/Demand Zone Marker", description: "Generate actionable supply/demand zones.", icon: CubeIcon, iconBg: "bg-amber-100 dark:bg-amber-900/30 text-amber-600" },
  { href: "/fair-value-gap-detector", title: "Fair Value Gap Detector", description: "Detect bullish or bearish FVG imbalances.", icon: SparklesIcon, iconBg: "bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-600" },
];

const adsMarketingTools = ADS_TOOLS.map((tool) => ({
  href: `/${tool.slug}`,
  title: tool.title,
  description: tool.description,
  icon: ChartBarIcon,
  iconBg: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600",
}));

const financeTools = [
  {
    href: "/hourly-to-salary",
    title: "Hourly to Salary",
    description:
      "Convert hourly pay to estimated annual and monthly salary from hours per week and weeks per year.",
    icon: ClockIcon,
    iconBg: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600",
  },
  {
    href: "/salary-to-hourly",
    title: "Salary to Hourly",
    description:
      "Convert gross annual salary to an equivalent hourly rate for your schedule.",
    icon: BanknotesIcon,
    iconBg: "bg-teal-100 dark:bg-teal-900/30 text-teal-600",
  },
  {
    href: "/discount-reverse-calculator",
    title: "Reverse Discount Calculator",
    description:
      "Find the original list price when you know the sale price and discount percentage.",
    icon: ArrowUturnLeftIcon,
    iconBg: "bg-amber-100 dark:bg-amber-900/30 text-amber-600",
  },
  {
    href: "/tax-calculator-simple",
    title: "Simple Tax Calculator",
    description:
      "Add tax to a subtotal or split a tax-included total into net and tax.",
    icon: ReceiptPercentIcon,
    iconBg: "bg-sky-100 dark:bg-sky-900/30 text-sky-600",
  },
  {
    href: "/profit-margin-calculator",
    title: "Profit Margin Calculator",
    description:
      "Gross profit, margin on revenue, and markup on cost from price and COGS.",
    icon: PresentationChartLineIcon,
    iconBg: "bg-violet-100 dark:bg-violet-900/30 text-violet-600",
  },
];

const careerStudyTools = [
  {
    href: "/linkedin-headline-combiner",
    title: "LinkedIn headline combiner",
    description:
      "Join headline segments with separators, enforce length, and optionally polish with AI.",
    icon: LinkIcon,
    iconBg: "bg-sky-100 dark:bg-sky-900/30 text-sky-600",
  },
  {
    href: "/resume-skills-gap",
    title: "Resume skills gap suggester",
    description:
      "Compare resume text to a pasted job description with keyword scan plus optional AI analysis.",
    icon: AcademicCapIcon,
    iconBg: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600",
  },
  {
    href: "/job-application-tracker",
    title: "Job application tracker",
    description:
      "Stages, applied dates, contacts, and notes — saved locally with CSV export.",
    icon: ClipboardDocumentListIcon,
    iconBg: "bg-violet-100 dark:bg-violet-900/30 text-violet-600",
  },
  {
    href: "/interview-question-bank",
    title: "Interview question bank (SRS)",
    description:
      "Store behavioral and technical Q/A and review with lightweight SM-2 scheduling.",
    icon: ChatBubbleBottomCenterTextIcon,
    iconBg: "bg-amber-100 dark:bg-amber-900/30 text-amber-600",
  },
  {
    href: "/flashcard-maker",
    title: "Flashcard maker",
    description:
      "Turn bullet lists into front/back cards; optional AI expansion for richer backs.",
    icon: RectangleStackIcon,
    iconBg: "bg-rose-100 dark:bg-rose-900/30 text-rose-600",
  },
  {
    href: "/spaced-repetition-scheduler",
    title: "Spaced repetition scheduler",
    description:
      "SM-2 lite: enter EF, interval, reps, and quality to get the next review interval.",
    icon: ClockIcon,
    iconBg: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600",
  },
  {
    href: "/cornell-notes-template",
    title: "Cornell notes template",
    description:
      "Generate a plain-text Cornell layout with cue/notes rows and a summary band.",
    icon: DocumentTextIcon,
    iconBg: "bg-teal-100 dark:bg-teal-900/30 text-teal-600",
  },
  {
    href: "/outline-flashcards",
    title: "Outline ↔ flashcards",
    description:
      "Convert outlines to Front/Back lines or the reverse; optional AI for structure.",
    icon: QueueListIcon,
    iconBg: "bg-orange-100 dark:bg-orange-900/30 text-orange-600",
  },
  {
    href: "/citation-formatter",
    title: "Citation formatter",
    description:
      "Fill author, title, journal, volume, pages, DOI — get APA- or MLA-style strings.",
    icon: BookOpenIcon,
    iconBg: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
  },
  {
    href: "/bibliography-deduper",
    title: "Bibliography deduper",
    description:
      "Paste references; dedupe by DOI and fuzzy title overlap with an adjustable threshold.",
    icon: DocumentDuplicateIcon,
    iconBg: "bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-600",
  },
];

const utilityTools = [
  {
    href: "/meeting-cost-calculator",
    title: "Meeting Cost Calculator",
    description:
      "Estimate total cost from hourly rate per person, headcount, and meeting duration.",
    icon: UserGroupIcon,
    iconBg: "bg-violet-100 dark:bg-violet-900/30 text-violet-600",
  },
  {
    href: "/work-hours-calculator",
    title: "Work Hours Calculator",
    description:
      "Net working time from start and end clock times minus unpaid break minutes.",
    icon: ClockIcon,
    iconBg: "bg-sky-100 dark:bg-sky-900/30 text-sky-600",
  },
  {
    href: "/sleep-cycle-calculator",
    title: "Sleep Cycle Calculator",
    description:
      "Suggested bedtimes for 4–6 sleep cycles before your target wake time.",
    icon: MoonIcon,
    iconBg: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600",
  },
  {
    href: "/water-intake-calculator",
    title: "Water Intake Calculator",
    description:
      "Daily fluid target from body weight and activity level (~35 ml/kg baseline).",
    icon: BeakerIcon,
    iconBg: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600",
  },
  {
    href: "/tip-split-calculator",
    title: "Tip Split Calculator",
    description:
      "Tip amount, bill total with tip, and fair split per person.",
    icon: ReceiptPercentIcon,
    iconBg: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600",
  },
  {
    href: "/age-in-days-calculator",
    title: "Age in Days Calculator",
    description:
      "How many days old from birth date to today or a date you choose.",
    icon: CalendarDaysIcon,
    iconBg: "bg-amber-100 dark:bg-amber-900/30 text-amber-600",
  },
  {
    href: "/countdown-timer-generator",
    title: "Countdown Timer",
    description:
      "Set a target date and time and watch a live countdown.",
    icon: CalendarIcon,
    iconBg: "bg-rose-100 dark:bg-rose-900/30 text-rose-600",
  },
  {
    href: "/timezone-now-grid",
    title: "Time Zone Now Grid",
    description: "Live local times across the regions you choose, in one table.",
    icon: GlobeAltIcon,
    iconBg: "bg-sky-100 dark:bg-sky-900/30 text-sky-600",
  },
  {
    href: "/meeting-overlap-finder",
    title: "World Meeting Overlap Finder",
    description:
      "Scan a date range for meeting slots when everyone’s local work hours overlap (browser-only).",
    icon: UserGroupIcon,
    iconBg: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600",
  },
  {
    href: "/working-days-countdown",
    title: "Working-Days Countdown",
    description:
      "Calendar days and Mon–Fri working days until a deadline, skipping optional holidays.",
    icon: CalendarIcon,
    iconBg: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600",
  },
  {
    href: "/fiscal-week-calculator",
    title: "Fiscal Week Calculator",
    description:
      "Fiscal year from a recurring start month/day plus week number using your week-start rule.",
    icon: CalendarDaysIcon,
    iconBg: "bg-orange-100 dark:bg-orange-900/30 text-orange-600",
  },
  {
    href: "/invoice-line-builder",
    title: "Invoice Line Builder",
    description:
      "Per-line discount and tax on subtotals with running totals — no PDF export.",
    icon: ReceiptPercentIcon,
    iconBg: "bg-lime-100 dark:bg-lime-900/30 text-lime-700",
  },
  {
    href: "/random-decision-maker",
    title: "Random Decision Maker",
    description:
      "List options one per line and pick one at random — quick tie-breaker.",
    icon: ArrowsRightLeftIcon,
    iconBg: "bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-600",
  },
  {
    href: "/task-prioritizer",
    title: "Smart Task Prioritizer",
    description:
      "Place tasks into Eisenhower matrix quadrants using urgency and importance.",
    icon: ChartPieIcon,
    iconBg: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600",
  },
  {
    href: "/daily-planner",
    title: "Daily Planner Generator",
    description:
      "Build a simple day schedule from wake/sleep times and task priorities.",
    icon: CalendarDaysIcon,
    iconBg: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600",
  },
  {
    href: "/meeting-agenda-builder",
    title: "Meeting Agenda Builder",
    description:
      "Create a structured meeting agenda with timed topics and clear flow.",
    icon: ClipboardDocumentListIcon,
    iconBg: "bg-teal-100 dark:bg-teal-900/30 text-teal-600",
  },
  {
    href: "/checklist-builder",
    title: "SOP / Checklist Builder",
    description:
      "Generate reusable SOP and checklist drafts from your process steps.",
    icon: QueueListIcon,
    iconBg: "bg-amber-100 dark:bg-amber-900/30 text-amber-600",
  },
  {
    href: "/batch-rename",
    title: "Batch Rename Utility",
    description:
      "Preview consistent bulk file naming and export a rename CSV map.",
    icon: ArrowsRightLeftIcon,
    iconBg: "bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-600",
  },
  {
    href: "/meeting-minutes-formatter",
    title: "Meeting Minutes Formatter",
    description:
      "Turn raw notes into structured minutes with summary, decisions, and actions.",
    icon: ClipboardDocumentListIcon,
    iconBg: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600",
  },
  {
    href: "/sop-version-diff",
    title: "SOP Version Diff Checker",
    description:
      "Compare two SOP versions and highlight added and removed lines.",
    icon: DocumentDuplicateIcon,
    iconBg: "bg-sky-100 dark:bg-sky-900/30 text-sky-600",
  },
  {
    href: "/focus-session-planner",
    title: "Focus Session Planner",
    description:
      "Plan deep-work sessions with focus/break blocks and total session timing.",
    icon: BoltIcon,
    iconBg: "bg-amber-100 dark:bg-amber-900/30 text-amber-600",
  },
  {
    href: "/time-blocking-builder",
    title: "Time Blocking Builder",
    description:
      "Create a simple day schedule by adding time blocks and priorities.",
    icon: CalendarDaysIcon,
    iconBg: "bg-sky-100 dark:bg-sky-900/30 text-sky-600",
  },
  {
    href: "/decision-matrix-tool",
    title: "Decision Matrix Tool",
    description:
      "Rank options using impact, effort, and risk scoring in a quick matrix.",
    icon: ScaleIcon,
    iconBg: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600",
  },
];

const freelanceWorkTools = [
  {
    href: "/freelance-rate-converter",
    title: "Freelance Rate ↔ Annual Income",
    description:
      "Convert hourly bill rate to expected annual income and back, using your weeks and utilization.",
    icon: BanknotesIcon,
    iconBg: "bg-teal-100 dark:bg-teal-900/30 text-teal-600",
  },
  {
    href: "/utilization-calculator",
    title: "Utilization Calculator",
    description:
      "Billable hours divided by available hours — see your utilization percentage.",
    icon: ChartPieIcon,
    iconBg: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600",
  },
  {
    href: "/burn-rate-runway",
    title: "Burn Rate Runway",
    description:
      "Simple runway from cash on hand and average monthly net burn (personal or small business).",
    icon: PresentationChartLineIcon,
    iconBg: "bg-rose-100 dark:bg-rose-900/30 text-rose-600",
  },
  {
    href: "/meeting-free-day-planner",
    title: "Meeting-Free Day Planner",
    description:
      "From meeting hours and workweek size, see meeting load and how many hours stay meeting-free.",
    icon: CalendarDaysIcon,
    iconBg: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600",
  },
  {
    href: "/deep-work-quota-tracker",
    title: "Deep-Work Quota Tracker",
    description:
      "Set a weekly deep-work target and log hours; progress is saved in your browser for this week.",
    icon: ClockIcon,
    iconBg: "bg-violet-100 dark:bg-violet-900/30 text-violet-600",
  },
  {
    href: "/email-followup-snooze",
    title: "Email Follow-Up Snooze List",
    description:
      "Local-only reminders: who to follow up with and when — stored in your browser.",
    icon: EnvelopeIcon,
    iconBg: "bg-sky-100 dark:bg-sky-900/30 text-sky-600",
  },
  {
    href: "/cold-email-opener-library",
    title: "Cold Email Opener Library",
    description:
      "Curated opening lines plus optional AI-generated variants for your situation.",
    icon: ChatBubbleBottomCenterTextIcon,
    iconBg: "bg-amber-100 dark:bg-amber-900/30 text-amber-600",
  },
  {
    href: "/subject-line-ab-lab",
    title: "Subject Line A/B Idea Lab",
    description:
      "Compare two subject lines side by side or ask AI for paired A/B ideas from a topic.",
    icon: SparklesIcon,
    iconBg: "bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-600",
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
    href: "/csv-to-json",
    title: "CSV → JSON Converter",
    description: "Upload a CSV file and convert it into a JSON `rows` array.",
    icon: CodeBracketSquareIcon,
    iconBg: "bg-rose-100 dark:bg-rose-900/30 text-rose-600",
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
  {
    href: "/uuid-generator",
    title: "UUID Generator",
    description: "Generate RFC 4122 version 4 UUIDs in the browser.",
    icon: CpuChipIcon,
    iconBg: "bg-sky-100 dark:bg-sky-900/30 text-sky-600",
  },
  {
    href: "/timestamp-converter",
    title: "Timestamp Converter",
    description: "Convert Unix seconds, milliseconds, and ISO date strings.",
    icon: ClockIcon,
    iconBg: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600",
  },
  {
    href: "/base64-encoder-decoder",
    title: "Base64 Encoder / Decoder",
    description: "Encode or decode text with UTF-8-safe Base64.",
    icon: ArrowsRightLeftIcon,
    iconBg: "bg-violet-100 dark:bg-violet-900/30 text-violet-600",
  },
  {
    href: "/json-minify-beautify",
    title: "JSON Minify / Beautify",
    description: "Pretty-print or minify JSON in one place.",
    icon: DocumentTextIcon,
    iconBg: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600",
  },
  {
    href: "/xml-formatter",
    title: "XML Formatter",
    description: "Pretty-print XML with indentation.",
    icon: CodeBracketSquareIcon,
    iconBg: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
  },
  {
    href: "/sql-formatter",
    title: "SQL Formatter",
    description: "Format SQL for readability with dialect-aware rules.",
    icon: CircleStackIcon,
    iconBg: "bg-teal-100 dark:bg-teal-900/30 text-teal-600",
  },
  {
    href: "/http-status-code-explainer",
    title: "HTTP Status Code Explainer",
    description: "Look up and filter common HTTP status codes.",
    icon: SignalIcon,
    iconBg: "bg-rose-100 dark:bg-rose-900/30 text-rose-600",
  },
  {
    href: "/url-encoder-decoder",
    title: "URL Encoder / Decoder",
    description: "encodeURIComponent and decodeURIComponent for query-safe strings.",
    icon: LinkIcon,
    iconBg: "bg-blue-100 dark:bg-blue-900/30 text-blue-600",
  },
  {
    href: "/color-converter",
    title: "Color Converter",
    description: "Convert between HEX, RGB, and HSL.",
    icon: SwatchIcon,
    iconBg: "bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-600",
  },
  {
    href: "/css-gradient-generator",
    title: "CSS Gradient Generator",
    description: "Build a two-stop linear gradient and copy the CSS.",
    icon: PaintBrushIcon,
    iconBg: "bg-pink-100 dark:bg-pink-900/30 text-pink-600",
  },
  {
    href: "/gitignore-suggester",
    title: ".gitignore by stack",
    description:
      "Merge curated ignore rules per stack; optional AI suggests extra patterns.",
    icon: CommandLineIcon,
    iconBg: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600",
  },
  {
    href: "/conventional-commit-helper",
    title: "Conventional commit helper",
    description: "Compose type, scope, breaking flag, body, and footers — copy ready.",
    icon: ClipboardDocumentListIcon,
    iconBg: "bg-violet-100 dark:bg-violet-900/30 text-violet-600",
  },
  {
    href: "/changelog-from-commits",
    title: "Changelog from commits",
    description: "Group conventional commits by type into Markdown changelog sections.",
    icon: DocumentDuplicateIcon,
    iconBg: "bg-sky-100 dark:bg-sky-900/30 text-sky-600",
  },
  {
    href: "/release-notes-polisher",
    title: "Release notes polisher",
    description: "Optional AI tightens tone and structure while keeping facts accurate.",
    icon: PencilSquareIcon,
    iconBg: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600",
  },
  {
    href: "/semver-bump-suggester",
    title: "Semantic version bump suggester",
    description: "From semver + commit list, suggest major, minor, or patch bump.",
    icon: TagIcon,
    iconBg: "bg-amber-100 dark:bg-amber-900/30 text-amber-600",
  },
  {
    href: "/code-comment-expander",
    title: "Code comment expander",
    description: "Optional AI turns a one-liner into a short block comment for your language.",
    icon: ChatBubbleBottomCenterTextIcon,
    iconBg: "bg-teal-100 dark:bg-teal-900/30 text-teal-600",
  },
  {
    href: "/variable-renamer",
    title: "Variable renamer suggestions",
    description: "Optional AI proposes clearer names using language conventions.",
    icon: ArrowsRightLeftIcon,
    iconBg: "bg-rose-100 dark:bg-rose-900/30 text-rose-600",
  },
  {
    href: "/regex-plain-english",
    title: "Regex plain-English explainer",
    description: "Optional AI explains your pattern in plain language with flavor context.",
    icon: FunnelIcon,
    iconBg: "bg-orange-100 dark:bg-orange-900/30 text-orange-600",
  },
  {
    href: "/log-line-parser",
    title: "Log line parser",
    description: "Parse JSON or key=value lines into a sortable table; copy as TSV.",
    icon: TableCellsIcon,
    iconBg: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600",
  },
  {
    href: "/runbook-checklist-runner",
    title: "Runbook checklist runner",
    description: "Tick steps with UTC timestamps and export a checklist log.",
    icon: ClipboardDocumentCheckIcon,
    iconBg: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600",
  },
  {
    href: "/on-call-handoff",
    title: "On-call handoff notes",
    description: "Structured markdown template for shift handoffs.",
    icon: BellAlertIcon,
    iconBg: "bg-amber-100 dark:bg-amber-900/30 text-amber-600",
  },
  {
    href: "/adr-writer",
    title: "ADR writer",
    description: "Architecture Decision Record template in markdown.",
    icon: BookOpenIcon,
    iconBg: "bg-violet-100 dark:bg-violet-900/30 text-violet-600",
  },
  {
    href: "/api-design-sketch",
    title: "API design sketch",
    description: "Outline resources, verbs, auth, and error model before OpenAPI.",
    icon: CodeBracketSquareIcon,
    iconBg: "bg-sky-100 dark:bg-sky-900/30 text-sky-600",
  },
  {
    href: "/openapi-outline",
    title: "OpenAPI outline",
    description: "JSON or YAML to human outline; optional AI narration.",
    icon: DocumentDuplicateIcon,
    iconBg: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600",
  },
  {
    href: "/json-schema-form-mockup",
    title: "JSON Schema form mockup",
    description: "Describe a form UI from a JSON Schema object.",
    icon: ViewColumnsIcon,
    iconBg: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300",
  },
  {
    href: "/graphql-prettifier",
    title: "GraphQL prettifier",
    description: "Format pasted queries and see shallow complexity hints.",
    icon: ShareIcon,
    iconBg: "bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-600",
  },
  {
    href: "/sql-explain-formatter",
    title: "SQL EXPLAIN formatter",
    description: "Tidy pasted EXPLAIN plans — read-only, no execution.",
    icon: CircleStackIcon,
    iconBg: "bg-teal-100 dark:bg-teal-900/30 text-teal-600",
  },
  {
    href: "/query-cost-estimator",
    title: "Query cost estimator",
    description: "Rough row-size math for teaching — not a real planner.",
    icon: CalculatorIcon,
    iconBg: "bg-orange-100 dark:bg-orange-900/30 text-orange-600",
  },
  {
    href: "/database-naming-linter",
    title: "Database naming linter",
    description: "snake_case checks and light pluralization hints.",
    icon: FunnelIcon,
    iconBg: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
  },
  {
    href: "/env-var-diff",
    title: "Environment variable diff",
    description: "Compare two env files with automatic redaction.",
    icon: ArrowsRightLeftIcon,
    iconBg: "bg-blue-100 dark:bg-blue-900/30 text-blue-600",
  },
  {
    href: "/cidr-calculator",
    title: "CIDR Calculator",
    description: "IPv4 network, mask, broadcast, and usable host range from CIDR.",
    icon: MapPinIcon,
    iconBg: "bg-teal-100 dark:bg-teal-900/30 text-teal-600",
  },
  {
    href: "/ip-integer-converter",
    title: "IP ↔ Integer Converter",
    description: "Convert dotted IPv4 to 32-bit unsigned decimal and back.",
    icon: CalculatorIcon,
    iconBg: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600",
  },
  {
    href: "/common-ports-reference",
    title: "Common Ports Reference",
    description: "Filterable cheat sheet of well-known TCP/UDP ports and what they mean.",
    icon: ServerStackIcon,
    iconBg: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
  },
  {
    href: "/user-agent-parser",
    title: "User-Agent Parser",
    description: "Best-effort browser, OS, and device hints from a classic User-Agent string.",
    icon: DevicePhoneMobileIcon,
    iconBg: "bg-violet-100 dark:bg-violet-900/30 text-violet-600",
  },
  {
    href: "/locale-bcp47-helper",
    title: "Locale / BCP-47 Helper",
    description: "Canonicalize language tags and inspect language, region, and script fields.",
    icon: LanguageIcon,
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
            Email verified. Your account is ready.
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

      {/* Agency & Services */}
      <section className="mb-14">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-10 rounded-xl bg-violet-100 dark:bg-violet-900/20 flex items-center justify-center text-violet-600">
            <BriefcaseIcon className="size-5" />
          </div>
          <h3 className="text-xl font-bold">Agency &amp; Services</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agencyServices.map(({ href, title, description, icon: Icon, iconBg }) => (
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

      {/* Trading Tools */}
      <section className="mb-14">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-10 rounded-xl bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center text-amber-600">
            <ChartBarIcon className="size-5" />
          </div>
          <h3 className="text-xl font-bold">Trading Tools</h3>
          <Link
            href="/trading-tools"
            className="ml-auto text-sm font-semibold text-dashboard-primary hover:underline"
          >
            View all
          </Link>
        </div>
        <Link
          href={tradingProduct.href}
          className="tool-card group mb-6 flex flex-col gap-4 rounded-4xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6 dark:border-emerald-900/40 dark:from-emerald-950/30 dark:to-slate-900/40 sm:flex-row sm:items-center"
        >
          <div
            className={`flex size-16 shrink-0 items-center justify-center rounded-2xl transition-transform group-hover:scale-110 ${tradingProduct.iconBg}`}
          >
            <ComputerDesktopIcon className="size-8" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-bold text-lg">{tradingProduct.title}</p>
              <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-semibold text-white">
                {tradingProduct.price}
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              {tradingProduct.description}
            </p>
          </div>
        </Link>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tradingTools.map(({ href, title, description, icon: Icon, iconBg }) => (
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

      {/* Fun & Viral */}
      <section className="mb-14">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-10 rounded-xl bg-fuchsia-100 dark:bg-fuchsia-900/20 flex items-center justify-center text-fuchsia-600">
            <SparklesIcon className="size-5" />
          </div>
          <h3 className="text-xl font-bold">Fun &amp; Viral</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {funViralTools.map(({ href, title, description, icon: Icon, iconBg }) => (
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

      {/* Trading Systems */}
      <section className="mb-14">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-10 rounded-xl bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center text-amber-600">
            <ChartBarIcon className="size-5" />
          </div>
          <h3 className="text-xl font-bold">Trading Systems</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tradingSystemTools.map(({ href, title, description, icon: Icon, iconBg }) => (
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

      {/* Ads & Marketing Performance */}
      <section className="mb-14">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600">
            <ChartBarIcon className="size-5" />
          </div>
          <h3 className="text-xl font-bold">Ads &amp; Marketing Performance</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adsMarketingTools.map(({ href, title, description, icon: Icon, iconBg }) => (
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

      {/* Freelance & work */}
      <section className="mb-14">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-10 rounded-xl bg-teal-100 dark:bg-teal-900/20 flex items-center justify-center text-teal-600">
            <BriefcaseIcon className="size-5" />
          </div>
          <h3 className="text-xl font-bold">Freelance &amp; work</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {freelanceWorkTools.map(({ href, title, description, icon: Icon, iconBg }) => (
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

      {/* Finance */}
      <section className="mb-14">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
            <BanknotesIcon className="size-5" />
          </div>
          <h3 className="text-xl font-bold">Finance</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {financeTools.map(({ href, title, description, icon: Icon, iconBg }) => (
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

      {/* Career & study */}
      <section className="mb-14">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-10 rounded-xl bg-sky-100 dark:bg-sky-900/20 flex items-center justify-center text-sky-600">
            <AcademicCapIcon className="size-5" />
          </div>
          <h3 className="text-xl font-bold">Career &amp; study</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {careerStudyTools.map(({ href, title, description, icon: Icon, iconBg }) => (
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

      {/* Utility */}
      <section className="mb-14">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-10 rounded-xl bg-fuchsia-100 dark:bg-fuchsia-900/20 flex items-center justify-center text-fuchsia-600">
            <WrenchScrewdriverIcon className="size-5" />
          </div>
          <h3 className="text-xl font-bold">Utility</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {utilityTools.map(({ href, title, description, icon: Icon, iconBg }) => (
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

      {/* Creator tools */}
      <section className="mb-14">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-10 rounded-xl bg-rose-100 dark:bg-rose-900/20 flex items-center justify-center text-rose-600">
            <VideoCameraIcon className="size-5" />
          </div>
          <h3 className="text-xl font-bold">Creator tools</h3>
          <span className="bg-rose-600 text-white text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-widest ml-2">
            Premium
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {creatorTools.map(({ href, title, description, icon: Icon, iconBg }) => (
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

      {/* Workshop & desk */}
      <section className="mb-14">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-10 rounded-xl bg-teal-100 dark:bg-teal-900/20 flex items-center justify-center text-teal-600">
            <TableCellsIcon className="size-5" />
          </div>
          <h3 className="text-xl font-bold">Workshop &amp; desk</h3>
          <span className="bg-teal-600 text-white text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-widest ml-2">
            Premium
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workshopDeskTools.map(({ href, title, description, icon: Icon, iconBg }) => (
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

      {/* SEO & Marketing */}
      <section className="mb-14">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
            <MegaphoneIcon className="size-5" />
          </div>
          <h3 className="text-xl font-bold">SEO & Marketing</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {seoMarketingTools.map(({ href, title, description, icon: Icon, iconBg }) => (
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

      {/* QR & codes */}
      <section className="mb-14">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-10 rounded-xl bg-sky-100 dark:bg-sky-900/20 flex items-center justify-center text-sky-600">
            <QrCodeIcon className="size-5" />
          </div>
          <h3 className="text-xl font-bold">QR & codes</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {qrAndCodeTools.map(({ href, title, description, icon: Icon, iconBg }) => (
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

      {/* Focus & planning */}
      <section className="mb-14">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-10 rounded-xl bg-violet-100 dark:bg-violet-900/20 flex items-center justify-center text-violet-600">
            <ClockIcon className="size-5" />
          </div>
          <h3 className="text-xl font-bold">Focus & planning</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {focusPlanningTools.map(({ href, title, description, icon: Icon, iconBg }) => (
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

      {/* Work habits & focus */}
      <section className="mb-14">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
            <CalendarDaysIcon className="size-5" />
          </div>
          <h3 className="text-xl font-bold">Work habits & focus</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {workHabitsTools.map(({ href, title, description, icon: Icon, iconBg }) => (
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

      {/* Text & Productivity */}
      <section className="mb-14">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-10 rounded-xl bg-teal-100 dark:bg-teal-900/20 flex items-center justify-center text-teal-600">
            <DocumentTextIcon className="size-5" />
          </div>
          <h3 className="text-xl font-bold">Text & Productivity</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {textProductivityTools.map(({ href, title, description, icon: Icon, iconBg }) => (
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

      {/* Study & meetings */}
      <section className="mb-14">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-10 rounded-xl bg-cyan-100 dark:bg-cyan-900/20 flex items-center justify-center text-cyan-600">
            <AcademicCapIcon className="size-5" />
          </div>
          <h3 className="text-xl font-bold">Study & meetings</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {studyMeetingTools.map(({ href, title, description, icon: Icon, iconBg }) => (
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
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">{description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Project management */}
      <section className="mb-14">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600">
            <BriefcaseIcon className="size-5" />
          </div>
          <h3 className="text-xl font-bold">Project management</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projectManagementTools.map(({ href, title, description, icon: Icon, iconBg }) => (
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

      <section
        className="mt-14 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900/40 px-6 py-5 sm:px-8 sm:py-6 text-center"
        aria-label="Business operator"
      >
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {SITE_BRAND} is operated by{" "}
          <Link
            href="/legal"
            className="font-semibold text-slate-900 dark:text-white hover:underline"
          >
            {LEGAL_BUSINESS_NAME}
          </Link>
        </p>
      </section>

      {/* CTA cards - fixed colors, do not change with theme */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8 pb-20">
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
