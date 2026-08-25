"use client";

import { useState, useRef, useEffect, useId, type KeyboardEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MagnifyingGlassIcon, DocumentTextIcon } from "@heroicons/react/24/outline";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "components/hooks/use-mobile";
import { TRADING_TOOLS } from "@/lib/trading-tools";
import { getTradingCalculatorSearchEntries } from "components/tradingToolsConfig";
import { ADS_TOOLS } from "components/tools/adsToolsConfig";

const SEARCHABLE_FEATURES = [
  { title: "Home", href: "/", keywords: "home dashboard main eprod tools" },
  { title: "Legal & Business", href: "/legal", keywords: "legal business apexridgelytics consulting llc operator company" },
  { title: "Contact us", href: "/contact", keywords: "contact support email info eprod" },
  { title: "AI Summarize", href: "/summarize-pdf", keywords: "summarize pdf ai extract insights" },
  { title: "Generate PDF", href: "/generate-pdf", keywords: "generate pdf latex ai document compile report" },
  { title: "Markdown to PDF", href: "/markdown-to-pdf", keywords: "markdown to pdf convert render weasyprint" },
  { title: "HTML to PDF", href: "/html-to-pdf", keywords: "html to pdf convert render weasyprint" },
  { title: "PDF OCR + Translate", href: "/pdf-ocr-translate", keywords: "pdf ocr translate text extraction translation" },
  { title: "PDF Keyword Extractor", href: "/pdf-keyword-extractor", keywords: "pdf keyword extractor ocr keywords ai" },
  { title: "PDF Q&A Assistant", href: "/pdf-qa-assistant", keywords: "pdf qa assistant question answer document ai" },
  { title: "PDF to Markdown", href: "/pdf-to-markdown", keywords: "pdf to markdown ocr text convert markdown" },
  { title: "PDF Outline Generator", href: "/pdf-outline-generator", keywords: "pdf outline headings structure ai" },
  { title: "PDF Action Items Extractor", href: "/pdf-action-items", keywords: "pdf action items tasks owner due date" },
  { title: "Multi-PDF Compare", href: "/multi-pdf-compare", keywords: "multi pdf compare differences similarities" },
  { title: "PDF Compliance Checker", href: "/pdf-compliance-checker", keywords: "pdf compliance metadata checker policy" },
  { title: "PDF Page Range Splitter", href: "/pdf-range-splitter", keywords: "pdf page range splitter extract pages" },
  { title: "PDF Rotate + Compress", href: "/pdf-rotate-compress", keywords: "pdf rotate compress pipeline optimize" },
  { title: "Image Batch to PDF", href: "/image-batch-to-pdf", keywords: "image batch to pdf zip create" },
  { title: "Markdown to Branded PDF", href: "/markdown-brand-pdf", keywords: "markdown branded pdf brand report" },
  { title: "HTML Invoice to PDF", href: "/html-invoice-to-pdf", keywords: "html invoice to pdf invoice generator" },
  { title: "Trading Signal", href: "/trading-signal", keywords: "trading signal chart analyze bitcoin crypto entry stop loss take profit" },
  { title: "Forex Trading Web App", href: "/forex-trading-app", keywords: "forex trading web app buy purchase license platform demo video 499" },
  { title: "Sign PDF", href: "/sign-pdf", keywords: "sign signature sign pdf" },
  { title: "Merge PDFs", href: "/merge-pdf", keywords: "merge combine pdf multiple" },
  { title: "Convert PDF", href: "/pdf-to-word", keywords: "convert word docx excel image" },
  { title: "CSV to JSON", href: "/csv-to-json", keywords: "csv to json convert rows delimiter" },
  { title: "CSV Cleaner", href: "/csv-cleaner", keywords: "csv cleaner trim blank rows clean data" },
  { title: "CSV Column Mapper", href: "/csv-column-mapper", keywords: "csv column mapper rename headers mapping" },
  { title: "CSV Deduplicator", href: "/csv-deduplicator", keywords: "csv deduplicator remove duplicate rows" },
  { title: "CSV Merge Assistant", href: "/csv-merge-assistant", keywords: "csv merge assistant merge multiple csv files" },
  { title: "CSV to Markdown Table", href: "/csv-to-markdown-table", keywords: "csv to markdown table convert markdown" },
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
  { title: "Position Size Calculator", href: "/position-size-calculator", keywords: "position size calculator trading risk entry stop loss units" },
  { title: "Risk per Trade Calculator", href: "/risk-per-trade-calculator", keywords: "risk per trade calculator account risk percentage amount" },
  { title: "R-Multiple Tracker", href: "/r-multiple-tracker", keywords: "r multiple tracker trade performance net pnl risk amount" },
  { title: "Risk-Reward Ratio Calculator", href: "/risk-reward-ratio-calculator", keywords: "risk reward ratio calculator rr entry stop target long short" },
  { title: "Break-Even Win Rate Calculator", href: "/break-even-win-rate-calculator", keywords: "break even win rate calculator reward risk expectancy" },
  { title: "Drawdown Recovery Calculator", href: "/drawdown-recovery-calculator", keywords: "drawdown recovery calculator required gain" },
  { title: "Max Daily Loss Guardrail Calculator", href: "/max-daily-loss-guardrail-calculator", keywords: "max daily loss guardrail calculator trading rules risk cap" },
  { title: "Kelly Criterion Calculator", href: "/kelly-criterion-calculator", keywords: "kelly criterion calculator position sizing bankroll win rate edge" },
  { title: "Fixed Fractional Sizing Tool", href: "/fixed-fractional-sizing-tool", keywords: "fixed fractional sizing tool equity risk stop distance units" },
  { title: "ATR Position Sizing Tool", href: "/atr-position-sizing-tool", keywords: "atr position sizing tool risk atr stop multiple" },
  { title: "Volatility-Based Stop Loss Calculator", href: "/volatility-based-stop-loss-calculator", keywords: "volatility based stop loss calculator atr multiple" },
  { title: "Trailing Stop Planner", href: "/trailing-stop-planner", keywords: "trailing stop planner trailing stop loss long short" },
  { title: "Forex Position Size Calculator", href: "/forex-position-size-calculator", keywords: "forex position size lot size pip risk calculator" },
  { title: "Leverage & Margin Calculator", href: "/leverage-margin-calculator", keywords: "leverage margin required margin calculator trading" },
  { title: "Multi-Target Take-Profit Planner", href: "/multi-target-take-profit-planner", keywords: "multi target take profit planner rr weighted reward trading" },
  { title: "Partial Exit Optimizer", href: "/partial-exit-optimizer", keywords: "partial exit optimizer scale out weighted rr trading" },
  { title: "Breakeven Stop Trigger Planner", href: "/breakeven-stop-trigger-planner", keywords: "breakeven stop trigger planner move stop to breakeven r multiple" },
  { title: "Slippage Impact Calculator", href: "/slippage-impact-calculator", keywords: "slippage impact calculator expected fill execution cost bps" },
  { title: "Spread Cost Calculator", href: "/spread-cost-calculator", keywords: "spread cost calculator bid ask spread pips lot size" },
  { title: "Commission Impact Calculator", href: "/commission-impact-calculator", keywords: "commission impact calculator round turn fees trading" },
  { title: "Overnight Swap/Funding Calculator", href: "/overnight-swap-funding-calculator", keywords: "overnight swap funding calculator carry cost days held" },
  { title: "Leverage Safety Calculator", href: "/leverage-safety-calculator", keywords: "leverage safety calculator max safe leverage drawdown risk" },
  { title: "Margin Call Price Calculator", href: "/margin-call-price-calculator", keywords: "margin call price calculator equity maintenance margin" },
  { title: "Liquidation Price Calculator", href: "/liquidation-price-calculator", keywords: "liquidation price calculator isolated margin leverage entry" },
  { title: "ROI Calculator", href: "/roi-calculator", keywords: "roi return on investment gain loss calculator" },
  { title: "Portfolio Risk Heatmap", href: "/portfolio-risk-heatmap", keywords: "portfolio risk heatmap exposure weight volatility trading" },
  { title: "Correlation Matrix Tool", href: "/correlation-matrix-tool", keywords: "correlation matrix asset returns risk trading" },
  { title: "Beta Exposure Calculator", href: "/beta-exposure-calculator", keywords: "beta exposure market beta portfolio trading" },
  { title: "Sector Exposure Analyzer", href: "/sector-exposure-analyzer", keywords: "sector exposure concentration allocation trading" },
  { title: "Currency Exposure Analyzer", href: "/currency-exposure-analyzer", keywords: "currency exposure fx allocation trading" },
  { title: "Concentration Risk Analyzer", href: "/concentration-risk-analyzer", keywords: "concentration risk hhi largest position trading" },
  { title: "VaR (Value at Risk) Calculator", href: "/var-calculator", keywords: "var value at risk confidence portfolio volatility" },
  { title: "Expected Shortfall Calculator", href: "/expected-shortfall-calculator", keywords: "expected shortfall cvar tail risk" },
  { title: "Monte Carlo Equity Simulator", href: "/monte-carlo-equity-simulator", keywords: "monte carlo equity simulation trading returns volatility" },
  { title: "Equity Curve Analyzer", href: "/equity-curve-analyzer", keywords: "equity curve max drawdown trading analytics" },
  { title: "Streak Probability Calculator", href: "/streak-probability-calculator", keywords: "streak probability winning streak trades" },
  { title: "Win/Loss Streak Risk Estimator", href: "/win-loss-streak-risk-estimator", keywords: "loss streak risk estimator probability trading" },
  { title: "Risk of Ruin Calculator", href: "/risk-of-ruin-calculator", keywords: "risk of ruin edge risk per trade drawdown" },
  { title: "Expectancy Calculator", href: "/expectancy-calculator", keywords: "expectancy average win average loss win rate" },
  { title: "Profit Factor Calculator", href: "/profit-factor-calculator", keywords: "profit factor gross profit gross loss" },
  { title: "Sharpe Ratio Calculator", href: "/sharpe-ratio-calculator", keywords: "sharpe ratio risk adjusted return volatility" },
  { title: "Sortino Ratio Calculator", href: "/sortino-ratio-calculator", keywords: "sortino ratio downside deviation risk adjusted" },
  { title: "Image to Prompt", href: "/image-to-prompt", keywords: "image to prompt midjourney flux stable diffusion" },
  { title: "Video to Prompt", href: "/video-to-prompt", keywords: "video to prompt midjourney flux stable diffusion" },
  { title: "Break-even Calculator", href: "/breakeven-calculator", keywords: "break even breakeven fixed costs variable price units calculator" },
  { title: "Probability Calculator", href: "/probability-calculator", keywords: "probability P(A) P(B) combinations n choose k calculator" },
  { title: "Discount Calculator", href: "/discount-calculator", keywords: "discount sale price percent off original price calculator" },
  { title: "JSON to CSV", href: "/json-to-csv", keywords: "json csv convert array objects export" },
  { title: ".gitignore by stack", href: "/gitignore-suggester", keywords: "gitignore stack node nextjs python templates ignore rules" },
  { title: "Conventional commit helper", href: "/conventional-commit-helper", keywords: "conventional commits commit message scope feat fix" },
  { title: "Changelog from commits", href: "/changelog-from-commits", keywords: "changelog conventional commits markdown release notes" },
  { title: "Release notes polisher", href: "/release-notes-polisher", keywords: "release notes polish tone ai changelog" },
  { title: "Semantic version bump suggester", href: "/semver-bump-suggester", keywords: "semver semantic version bump major minor patch" },
  { title: "Code comment expander", href: "/code-comment-expander", keywords: "comment expand docstring block comment ai" },
  { title: "Variable renamer suggestions", href: "/variable-renamer", keywords: "rename variable function identifier naming ai" },
  { title: "Regex plain-English explainer", href: "/regex-plain-english", keywords: "regex explain plain english pattern" },
  { title: "Log line parser", href: "/log-line-parser", keywords: "log json key value table parse logfmt" },
  { title: "API Response Formatter", href: "/api-response-formatter", keywords: "api json format pretty minify formatter" },
  { title: "Regex Tester", href: "/regex-tester", keywords: "regex regular expression test match online" },
  { title: "Cron Generator", href: "/cron-generator", keywords: "cron expression generator schedule job" },
  { title: "Wealth Comparison Calculator", href: "/wealth-comparison-calculator", keywords: "wealth net worth comparison percentile calculator" },
  { title: "Life in Weeks Visualizer", href: "/life-in-weeks", keywords: "life in weeks calendar weeks lived visualizer" },
  { title: "Habit Streak Tracker", href: "/habit-streak-tracker", keywords: "habit streak tracker daily habit days" },
  { title: "Goal Progress Tracker", href: "/goal-progress-tracker", keywords: "goal progress tracker target percentage" },
  { title: "Salary After Tax Calculator", href: "/salary-after-tax-calculator", keywords: "salary after tax take home pay gross net tax calculator" },
  { title: "Hourly to Salary Calculator", href: "/hourly-to-salary", keywords: "hourly to salary annual monthly wage convert rate" },
  { title: "Salary to Hourly Calculator", href: "/salary-to-hourly", keywords: "salary to hourly rate convert annual gross equivalent" },
  { title: "Reverse Discount Calculator", href: "/discount-reverse-calculator", keywords: "reverse discount original list price sale percent off" },
  { title: "Simple Tax Calculator", href: "/tax-calculator-simple", keywords: "tax calculator subtotal included VAT sales tax percent" },
  { title: "Profit Margin Calculator", href: "/profit-margin-calculator", keywords: "profit margin markup COGS selling price gross margin" },
  { title: "Meeting Cost Calculator", href: "/meeting-cost-calculator", keywords: "meeting cost hourly rate attendees duration estimate" },
  { title: "Priority Score Calculator", href: "/priority-score-calculator", keywords: "priority score calculator impact urgency confidence effort" },
  { title: "RICE Score Calculator", href: "/rice-score-calculator", keywords: "rice score calculator reach impact confidence effort product roadmap" },
  { title: "ICE Score Calculator", href: "/ice-score-calculator", keywords: "ice score calculator impact confidence ease prioritization" },
  { title: "Meeting Minutes Formatter", href: "/meeting-minutes-formatter", keywords: "meeting minutes formatter notes decisions action items" },
  { title: "SOP Version Diff Checker", href: "/sop-version-diff", keywords: "sop version diff checker compare policy procedure changes" },
  { title: "Policy Rewrite Assistant", href: "/policy-rewrite-assistant", keywords: "policy rewrite assistant simplify tone compliance language" },
  { title: "Email Thread Summarizer", href: "/email-thread-summarizer", keywords: "email thread summarizer inbox summary key points action items" },
  { title: "Follow-up Email Drafter", href: "/followup-email-drafter", keywords: "follow up email drafter reminder response template" },
  { title: "Project Kickoff Brief Generator", href: "/project-kickoff-brief", keywords: "project kickoff brief generator objective scope stakeholders timeline" },
  { title: "Work Hours Calculator", href: "/work-hours-calculator", keywords: "work hours net shift break start end time calculator" },
  { title: "Freelance Rate ↔ Annual Income", href: "/freelance-rate-converter", keywords: "freelance hourly rate annual income salary converter utilization billable" },
  { title: "Utilization Calculator", href: "/utilization-calculator", keywords: "utilization billable hours available hours percentage freelance agency" },
  { title: "Burn Rate Runway", href: "/burn-rate-runway", keywords: "burn rate runway months cash savings monthly expenses freelance simple" },
  { title: "Meeting-Free Day Planner", href: "/meeting-free-day-planner", keywords: "meeting free calendar deep work meeting percentage week planner" },
  { title: "Deep-Work Quota Tracker", href: "/deep-work-quota-tracker", keywords: "deep work hours week target quota tracker focus" },
  { title: "Email Follow-Up Snooze List", href: "/email-followup-snooze", keywords: "email follow up snooze reminder local browser list" },
  { title: "Cold Email Opener Library", href: "/cold-email-opener-library", keywords: "cold email opener intro template outreach sales" },
  { title: "Subject Line A/B Idea Lab", href: "/subject-line-ab-lab", keywords: "subject line ab test email marketing open rate ideas" },
  { title: "Sleep Cycle Calculator", href: "/sleep-cycle-calculator", keywords: "sleep cycle bedtime wake 90 minutes REM" },
  { title: "Water Intake Calculator", href: "/water-intake-calculator", keywords: "water intake daily hydration ml kg activity" },
  { title: "Tip Split Calculator", href: "/tip-split-calculator", keywords: "tip split bill restaurant per person percentage" },
  { title: "Age in Days Calculator", href: "/age-in-days-calculator", keywords: "age in days birth date days old calculator" },
  { title: "Countdown Timer", href: "/countdown-timer-generator", keywords: "countdown timer target date time live" },
  { title: "Random Decision Maker", href: "/random-decision-maker", keywords: "random decision picker choose option tie breaker" },
  { title: "Smart Task Prioritizer (Eisenhower Matrix)", href: "/task-prioritizer", keywords: "smart task prioritizer eisenhower matrix urgent important" },
  { title: "Daily Planner Generator", href: "/daily-planner", keywords: "daily planner generator schedule day planning" },
  { title: "Meeting Agenda Builder", href: "/meeting-agenda-builder", keywords: "meeting agenda builder topics duration template" },
  { title: "SOP / Checklist Builder", href: "/checklist-builder", keywords: "sop checklist builder steps process" },
  { title: "Batch Rename Utility", href: "/batch-rename", keywords: "batch rename utility file rename mapping" },
  { title: "Coin Flip", href: "/coin-flip", keywords: "coin flip heads tails random chance decision" },
  { title: "IQ Test", href: "/iq-test", keywords: "iq test intelligence quotient cognitive assessment puzzle score report" },
  { title: "EQ Test", href: "/eq-test", keywords: "eq test emotional intelligence empathy self awareness social skills score report" },
  { title: "DNA Test", href: "/dna-test", keywords: "dna test ancestry selfie ethnicity country origins flag fun entertainment" },
  { title: "Dice Roller", href: "/dice-roller", keywords: "dice roll d6 d20 tabletop rpg game random" },
  { title: "Random Name Picker", href: "/random-name-picker", keywords: "random name picker winner draw list raffle" },
  { title: "Truth or Dare Generator", href: "/truth-or-dare-generator", keywords: "truth or dare party game generator prompts" },
  { title: "Would You Rather Generator", href: "/would-you-rather-generator", keywords: "would you rather icebreaker game questions prompts" },
  { title: "AI Product Description", href: "/ai-product-description", keywords: "product description ecommerce copywriting" },
  { title: "AI Resume Bullet", href: "/ai-resume-bullet", keywords: "resume bullet points cv experience" },
  { title: "AI Meeting Notes Summarizer", href: "/ai-meeting-notes-summarizer", keywords: "meeting notes summary action items" },
  { title: "Hashtag Generator", href: "/hashtag-generator", keywords: "hashtag instagram tiktok social media" },
  { title: "YouTube Title Generator", href: "/youtube-title-generator", keywords: "youtube title video seo" },
  { title: "Tweet/Post Formatter", href: "/tweet-post-formatter", keywords: "tweet formatter thread twitter post" },
  { title: "Inclusive Language Linter", href: "/inclusive-language-linter", keywords: "inclusive language bias wording accessibility plain respectful" },
  { title: "Plain Language Rewriter", href: "/plain-language-rewriter", keywords: "plain language simplify readability clear writing federal" },
  { title: "Reading Level Estimator", href: "/reading-level-estimator", keywords: "reading level flesch kincaid syllables grade audience" },
  { title: "Keyword → Blog Outline", href: "/keyword-blog-outline", keywords: "keyword blog outline seo sections scaffold" },
  { title: "Social Thread Splitter", href: "/social-thread-splitter", keywords: "thread splitter bluesky threads numbered long post" },
  { title: "Social Character Counter", href: "/social-character-counter", keywords: "character count bluesky threads limit grapheme" },
  { title: "Poll Option Balancer", href: "/poll-option-balancer", keywords: "poll options shuffle dedupe trim survey" },
  { title: "Team Shuffler", href: "/team-shuffler", keywords: "team shuffle breakout groups random workshop" },
  { title: "Name Tag Print Layout", href: "/name-tag-print", keywords: "name tag table tent print badge event" },
  { title: "Personal Dashboard", href: "/personal-dashboard", keywords: "dashboard weather todos focus quote widgets" },
  { title: "JWT Token Decoder", href: "/jwt-decoder", keywords: "jwt token decode json web token header payload" },
  { title: "Stack trace normalizer", href: "/stack-trace-normalizer", keywords: "stack trace normalize duplicate fold path log error" },
  { title: "cURL to snippets", href: "/curl-to-fetch", keywords: "curl fetch axios python requests convert snippet http" },
  { title: "HTTP request builder", href: "/http-request-builder", keywords: "http request builder headers body curl copy fetch" },
  { title: "Webhook tester", href: "/webhook-tester", keywords: "webhook test receiver debug payload inbound http" },
  { title: "HMAC SHA-256", href: "/hmac-playground", keywords: "hmac sha256 signature digest secret body hex" },
  { title: "TOTP generator", href: "/totp-generator", keywords: "totp authenticator code base32 rfc6238 otp" },
  { title: "Secret encoder", href: "/secret-encoder", keywords: "base32 hex encode decode secret utf8 bytes" },
  { title: "PEM prettifier", href: "/pem-prettifier", keywords: "pem certificate prettify format base64 wrap x509" },
  { title: "Startup Valuation Calculator", href: "/startup-valuation-calculator", keywords: "startup valuation revenue growth multiple" },
  { title: "Ad ROI Calculator", href: "/ad-roi-calculator", keywords: "ad roi roas ad spend revenue calculator" },
  { title: "SaaS Pricing Simulator", href: "/saas-pricing-simulator", keywords: "saas mrr churn arpu pricing simulator" },
  { title: "Customer Lifetime Value Calculator", href: "/clv-calculator", keywords: "clv ltv customer lifetime value arpu churn" },
  { title: "Churn Rate Calculator", href: "/churn-rate-calculator", keywords: "churn rate customers lost retention" },
  ...getTradingCalculatorSearchEntries(),
  { title: "B2B Pipeline ROAS Calculator", href: "/b2b-pipeline-roas-calculator", keywords: "b2b pipeline roas calculator ad spend win rate gross margin" },
  { title: "Agency Client Reporting Generator", href: "/agency-client-reporting-generator", keywords: "agency client reporting generator ctr cpc cpl cvr cpa roas" },
  { title: "Weekly Performance Narrative AI", href: "/weekly-performance-narrative-ai", keywords: "weekly performance narrative ai report week over week paid ads" },
  { title: "Account Health Scorecard", href: "/account-health-scorecard", keywords: "account health scorecard ads roas ctr cvr frequency impression share" },
  { title: "Campaign Naming Convention Generator", href: "/campaign-naming-convention-generator", keywords: "campaign naming convention generator ads channel objective audience date" },
  { title: "Ads SOP Generator", href: "/ads-sop-generator", keywords: "ads sop generator standard operating procedure paid media workflow" },
  { title: "Creative Testing Roadmap Planner", href: "/creative-testing-roadmap-planner", keywords: "creative testing roadmap planner concepts variants cpm budget" },
  { title: "AI Email Subject Line Generator", href: "/ai-email-subject-line", keywords: "email subject line generator ai marketing" },
  { title: "AI Cold Outreach Writer", href: "/ai-cold-outreach", keywords: "cold email outreach sales ai writer" },
  { title: "Social Media Bio Generator", href: "/social-media-bio", keywords: "social media bio instagram twitter linkedin profile bio generator" },
  { title: "Content Idea Generator", href: "/content-idea-generator", keywords: "content ideas blog social video newsletter topic generator" },
  { title: "Meeting Notes to Action Plan", href: "/meeting-notes-action-plan", keywords: "meeting notes action plan tasks owners priorities next steps" },
  { title: "Weekly Review Generator", href: "/weekly-review-generator", keywords: "weekly review wins lessons priorities reflection" },
  { title: "Goal Breakdown Planner", href: "/goal-breakdown-planner", keywords: "goal breakdown planner milestones tasks timeline roadmap" },
  { title: "Habit Reflection Coach", href: "/habit-reflection-coach", keywords: "habit reflection coach weekly habits consistency blockers improvements" },
  { title: "Focus Session Planner", href: "/focus-session-planner", keywords: "focus session planner pomodoro deep work sessions break schedule" },
  { title: "Time Blocking Builder", href: "/time-blocking-builder", keywords: "time blocking builder schedule calendar blocks productivity" },
  { title: "Decision Matrix Tool", href: "/decision-matrix-tool", keywords: "decision matrix tool score options impact effort risk" },
  { title: "Pros and Cons Analyzer", href: "/pros-cons-analyzer", keywords: "pros cons analyzer decision helper recommendation tradeoffs" },
  { title: "Screenshot to PDF Reporter", href: "/screenshot-to-pdf-reporter", keywords: "screenshot to pdf reporter image to pdf batch report zip" },
  { title: "Smart QR Batch Generator", href: "/smart-qr-batch-generator", keywords: "smart qr batch generator qr bulk zip export" },
  { title: "Time Zone Meeting Planner", href: "/timezone-meeting-planner", keywords: "timezone meeting planner world clock convert time zones" },
  { title: "Pomodoro Timer", href: "/pomodoro-timer", keywords: "pomodoro timer focus work break session history" },
  { title: "Deep Work Stopwatch", href: "/deep-work-stopwatch", keywords: "deep work stopwatch count up focus block timer" },
  { title: "Daily Time Block Planner", href: "/daily-time-block-planner", keywords: "daily planner time blocks schedule day" },
  { title: "Weekly Calendar Notes", href: "/weekly-calendar-notes", keywords: "weekly calendar notes monday sunday grid" },
  { title: "Eisenhower Matrix", href: "/eisenhower-matrix", keywords: "eisenhower matrix urgent important quadrants tasks" },
  { title: "PARA Inbox", href: "/para-inbox", keywords: "para method projects areas resources archive inbox" },
  { title: "Personal Kanban", href: "/personal-kanban", keywords: "personal kanban todo doing done board" },
  { title: "File Size Compressor", href: "/file-size-compressor", keywords: "compress image file size reduce resize jpeg" },
  { title: "Screenshot Annotation Tool", href: "/screenshot-annotation", keywords: "screenshot annotation draw arrow highlight annotate image" },
  { title: "PDF to Image Converter", href: "/pdf-to-image", keywords: "pdf to image convert png jpeg page export" },
  { title: "Split PDF", href: "/split-pdf", keywords: "split pdf pages extract page range zip" },
  { title: "Rotate PDF", href: "/rotate-pdf", keywords: "rotate pdf rotation pages 90 180 -90 -180" },
  { title: "PDF Metadata", href: "/pdf-metadata", keywords: "pdf metadata title producer author page count" },
  { title: "PDF to Text (OCR Extractor)", href: "/pdf-to-text", keywords: "pdf to text ocr extractor pdf text recognition" },
  { title: "PDF Metadata Inspector + JSON Export", href: "/pdf-metadata-inspector", keywords: "pdf metadata inspector json export title author producer" },
  { title: "CSV/XLSX Quick Profiler", href: "/data-profiler", keywords: "csv xlsx quick profiler data columns rows preview" },
  { title: "Batch File Archive Builder", href: "/bulk-zip-builder", keywords: "batch file archive builder zip create files" },
  { title: "Markdown Report Packager", href: "/markdown-report-bundle", keywords: "markdown report packager bundle pdf zip create" },
  { title: "Extract PDF Images", href: "/pdf-extract-images", keywords: "extract pdf images embedded png zip" },
  { title: "Image to PDF", href: "/image-to-pdf", keywords: "image to pdf convert png jpg quality strip metadata" },
  { title: "Compress PDF", href: "/compress-pdf", keywords: "compress pdf shrink ebook ghostscript" },
  { title: "Image Convert Tool", href: "/image-convert", keywords: "image convert png jpeg webp resize quality strip metadata" },
  { title: "Compress Image", href: "/compress-image", keywords: "compress image jpeg png webp resize quality strip metadata" },
  { title: "Text QR Generator", href: "/qr-generate", keywords: "qr code generator text box size border" },
  { title: "Zip Create", href: "/zip-create", keywords: "zip create archive compress multiple files" },
  { title: "XLSX to JSON", href: "/xlsx-to-json", keywords: "xlsx excel to json rows worksheet" },
  { title: "Habit chain calendar", href: "/habit-chain-calendar", keywords: "habit streak calendar chain daily tracker local" },
  { title: "One big thing", href: "/one-big-thing", keywords: "one big thing daily focus priority MIT most important task" },
  { title: "Energy journal", href: "/energy-journal", keywords: "energy journal focus hourly rating 1 to 10 productivity" },
  { title: "Meeting cost timer", href: "/meeting-cost-timer", keywords: "meeting cost timer burn rate attendees hourly rate" },
  { title: "Standup formatter", href: "/standup-formatter", keywords: "standup formatter yesterday today blockers scrum slack" },
  { title: "Retrospective board", href: "/retrospective-board", keywords: "retrospective went well improve actions sprint retro" },
  { title: "Decision log", href: "/decision-log", keywords: "decision log context options chosen revisit adr" },
  { title: "Pros / cons matrix", href: "/pros-cons-matrix", keywords: "pros cons weighted criteria matrix decision comparison" },
  { title: "XLSX Sheet Explorer", href: "/xlsx-sheet-explorer", keywords: "xlsx sheet explorer inspect rows table" },
  { title: "XLSX to Chart JSON", href: "/xlsx-chart-json", keywords: "xlsx to chart json labels datasets" },
  { title: "ZIP Notes Packager", href: "/zip-notes-packager", keywords: "zip notes packager notes archive txt files" },
  { title: "Word Counter", href: "/word-counter", keywords: "word counter character count lines paragraphs text" },
  { title: "Reading Time Estimator", href: "/reading-time-estimator", keywords: "reading time wpm minutes estimate article" },
  { title: "Reading Speed Test", href: "/reading-speed-test", keywords: "reading speed test wpm words per minute timed passage article time" },
  { title: "Syllabus Week Generator", href: "/syllabus-week-generator", keywords: "syllabus week calendar dates holidays course schedule generator" },
  { title: "Grade Needed on Final", href: "/grade-needed-calculator", keywords: "grade needed final exam calculator weighted average target" },
  { title: "Study Topic Picker", href: "/study-topic-picker", keywords: "study topic random picker pool choose session" },
  { title: "Vocabulary Quiz", href: "/vocabulary-quiz", keywords: "vocabulary quiz words definitions paste text ai multiple choice" },
  { title: "Mind-Map Outliner", href: "/mind-map-outliner", keywords: "mind map outline indent tree export bullets nested" },
  { title: "Meeting Agenda Timer", href: "/meeting-agenda-timer", keywords: "meeting agenda timer countdown per topic minutes" },
  { title: "Meeting Parking Lot", href: "/meeting-parking-lot", keywords: "meeting parking lot list later topics capture export" },
  { title: "Action Item Extractor", href: "/action-items-extractor", keywords: "action items extractor meeting notes todo checkbox ai" },
  { title: "Tone Checker", href: "/tone-checker", keywords: "tone checker slack email draft ai workplace message" },
  { title: "Text Case Converter", href: "/text-case-converter", keywords: "case converter uppercase lowercase title sentence" },
  { title: "Remove Duplicate Lines", href: "/remove-duplicate-lines", keywords: "duplicate lines dedupe unique rows text" },
  { title: "Text Diff Checker", href: "/text-diff-checker", keywords: "text diff compare lines difference" },
  { title: "Password Generator", href: "/password-generator", keywords: "password generator random strong secure" },
  { title: "Password Strength Checker", href: "/password-strength-checker", keywords: "password strength score security check" },
  { title: "YouTube Title Length Checker", href: "/youtube-title-length-checker", keywords: "youtube title length character limit 100 checker" },
  { title: "YouTube Description Length Checker", href: "/youtube-description-length-checker", keywords: "youtube description length 5000 characters checker" },
  { title: "Hashtag Counter", href: "/hashtag-counter", keywords: "hashtag count instagram tiktok caption unique" },
  { title: "Emoji Copy Tool", href: "/emoji-copy-tool", keywords: "emoji copy paste picker social caption" },
  { title: "Caption Formatter", href: "/caption-formatter", keywords: "caption format instagram tiktok line breaks trim" },
  { title: "Hook Generator", href: "/hook-generator", keywords: "hook generator short form video viral opener" },
  { title: "Template Bio Generator", href: "/template-bio-generator", keywords: "bio template instagram profile creator fill in" },
  { title: "Meta Tag Preview", href: "/meta-tag-preview", keywords: "meta tag preview title description serp google seo" },
  { title: "Open Graph Preview", href: "/open-graph-preview", keywords: "open graph og preview social share facebook linkedin" },
  { title: "Keyword Density Checker", href: "/keyword-density-checker", keywords: "keyword density seo content frequency" },
  { title: "Slug Generator", href: "/slug-generator", keywords: "url slug permalink generator seo" },
  { title: "UTM Builder", href: "/utm-builder", keywords: "utm campaign url builder tracking analytics" },
  { title: "Robots.txt Generator", href: "/robots-txt-generator", keywords: "robots.txt generator crawler disallow sitemap" },
  { title: "Sitemap Validator", href: "/sitemap-validator", keywords: "sitemap xml validator seo urls loc" },
  { title: "Canonical URL Checker", href: "/canonical-url-checker", keywords: "canonical url duplicate href seo" },
  { title: "UUID Generator", href: "/uuid-generator", keywords: "uuid guid v4 random unique identifier" },
  { title: "Timestamp Converter", href: "/timestamp-converter", keywords: "timestamp unix epoch milliseconds iso date convert" },
  { title: "Base64 Encoder Decoder", href: "/base64-encoder-decoder", keywords: "base64 encode decode utf-8" },
  { title: "JSON Minify Beautify", href: "/json-minify-beautify", keywords: "json minify beautify pretty print compact" },
  { title: "XML Formatter", href: "/xml-formatter", keywords: "xml format pretty print indent" },
  { title: "SQL Formatter", href: "/sql-formatter", keywords: "sql format pretty print dialect mysql postgres" },
  {
    title: "Runbook checklist runner",
    href: "/runbook-checklist-runner",
    keywords: "runbook checklist incident steps timestamps log",
  },
  {
    title: "On-call handoff notes",
    href: "/on-call-handoff",
    keywords: "on call handoff shift template engineering",
  },
  { title: "ADR writer", href: "/adr-writer", keywords: "architecture decision record adr markdown template" },
  {
    title: "API design sketch",
    href: "/api-design-sketch",
    keywords: "api design rest resources verbs error model",
  },
  {
    title: "OpenAPI outline",
    href: "/openapi-outline",
    keywords: "openapi swagger yaml json outline narrate",
  },
  {
    title: "JSON Schema form mockup",
    href: "/json-schema-form-mockup",
    keywords: "json schema form fields ui mockup",
  },
  {
    title: "GraphQL prettifier",
    href: "/graphql-prettifier",
    keywords: "graphql format prettify complexity query",
  },
  {
    title: "SQL EXPLAIN formatter",
    href: "/sql-explain-formatter",
    keywords: "sql explain plan postgres format tidy",
  },
  {
    title: "Query cost estimator",
    href: "/query-cost-estimator",
    keywords: "query cost rows bytes estimate educational",
  },
  {
    title: "Database naming linter",
    href: "/database-naming-linter",
    keywords: "database naming snake_case sql plural table column",
  },
  {
    title: "Environment variable diff",
    href: "/env-var-diff",
    keywords: "env diff compare dotenv redact secrets",
  },
  { title: "HTTP Status Code Explainer", href: "/http-status-code-explainer", keywords: "http status code 404 500 rest api" },
  { title: "URL Encoder Decoder", href: "/url-encoder-decoder", keywords: "url encode decode percent encoding uri" },
  { title: "Color Converter", href: "/color-converter", keywords: "color hex rgb hsl convert" },
  { title: "CSS Gradient Generator", href: "/css-gradient-generator", keywords: "css linear gradient generator background" },
  { title: "CIDR Calculator", href: "/cidr-calculator", keywords: "cidr subnet mask network ipv4 usable hosts broadcast" },
  { title: "IP Integer Converter", href: "/ip-integer-converter", keywords: "ip address integer 32 bit dotted decimal convert" },
  { title: "Common Ports Reference", href: "/common-ports-reference", keywords: "tcp udp port list cheat sheet ssh http https dns" },
  { title: "User-Agent Parser", href: "/user-agent-parser", keywords: "user agent browser os device parse header" },
  { title: "Locale BCP-47 Helper", href: "/locale-bcp47-helper", keywords: "locale bcp47 language tag intl canonicalize" },
  { title: "Time Zone Now Grid", href: "/timezone-now-grid", keywords: "timezone world clock now grid multiple zones" },
  { title: "World Meeting Overlap Finder", href: "/meeting-overlap-finder", keywords: "meeting overlap slots time zone working hours scan" },
  { title: "Working-Days Countdown", href: "/working-days-countdown", keywords: "working days countdown deadline business days holidays" },
  { title: "Fiscal Week Calculator", href: "/fiscal-week-calculator", keywords: "fiscal week year accounting week number" },
  { title: "Invoice Line Builder", href: "/invoice-line-builder", keywords: "invoice line items tax discount subtotal builder" },
  { title: "Wi‑Fi QR Generator", href: "/wifi-qr-generator", keywords: "wifi qr code wpa network ssid scan connect" },
  { title: "vCard QR Generator", href: "/vcard-qr-generator", keywords: "vcard qr contact card business phone email" },
  { title: "Barcode Generator", href: "/barcode-generator", keywords: "barcode code128 ean upc generate image" },
  { title: "Time Zone Overlap Checker", href: "/timezone-overlap-checker", keywords: "timezone overlap meeting availability working hours remote" },
  { title: "Text Summarizer", href: "/text-summarizer", keywords: "summarize text ai shorten tl dr" },
  { title: "Sentence Rewriter", href: "/sentence-rewriter", keywords: "rewrite sentence paraphrase tone clarity" },
  { title: "Bullet Point Extractor", href: "/bullet-point-extractor", keywords: "bullet points list extract notes" },
  { title: "Headline Improver", href: "/headline-improver", keywords: "headline title ideas copywriting" },
  { title: "Email Polisher", href: "/email-polisher", keywords: "polish email grammar professional draft" },
  { title: "Blog Outline Generator", href: "/blog-outline-generator", keywords: "blog outline structure sections ai" },
  { title: "Product Description Generator", href: "/product-description-generator", keywords: "product description ecommerce copy ai" },
  { title: "Meta Description Generator", href: "/meta-description-generator", keywords: "meta description seo serp snippet" },
  { title: "Cold Email Generator", href: "/cold-email-generator", keywords: "cold email outreach subject sales ai" },
  { title: "SQL Query Generator", href: "/sql-query-generator", keywords: "sql natural language query generate schema" },
  { title: "Regex Generator", href: "/regex-generator", keywords: "regex generator pattern from english" },
  { title: "Code Explainer", href: "/code-explainer", keywords: "explain code snippet what does it do" },
  { title: "Keyword Generator", href: "/keyword-generator", keywords: "seo keywords long tail topic clusters" },
  { title: "App Palette Generator", href: "/palette-generator", keywords: "color palette hex ui brand app theme swatch design" },
  { title: "RACI chart builder", href: "/raci-chart-builder", keywords: "raci chart responsible accountable consulted informed project roles matrix" },
  { title: "OKR tree writer", href: "/okr-tree-writer", keywords: "okr objective key results tree outline quarterly goals" },
  { title: "SMART goal checker", href: "/smart-goal-checker", keywords: "smart goal specific measurable achievable relevant time bound worksheet" },
  { title: "Backlog prioritizer", href: "/backlog-prioritizer", keywords: "backlog prioritize rice moscow scoring product owner" },
  { title: "Roadmap quarter planner", href: "/roadmap-quarter-planner", keywords: "roadmap quarter themes initiatives planning product" },
  { title: "User story splitter", href: "/user-story-splitter", keywords: "user story as a i want so that agile backlog" },
  { title: "Acceptance criteria generator", href: "/acceptance-criteria-generator", keywords: "acceptance criteria given when then checklist engineering qa" },
  { title: "Bug report templater", href: "/bug-report-templater", keywords: "bug report template repro steps environment expected actual defect" },
  { title: "Incident timeline builder", href: "/incident-timeline-builder", keywords: "incident timeline postmortem utc roles links outage" },
  { title: "LinkedIn Headline Combiner", href: "/linkedin-headline-combiner", keywords: "linkedin headline combine role keywords constraints ai" },
  { title: "Resume Skills Gap Suggester", href: "/resume-skills-gap", keywords: "resume job description skills gap keywords interview prep ai" },
  { title: "Job Application Tracker", href: "/job-application-tracker", keywords: "job applications tracker stage interview contact csv export" },
  { title: "Interview Question Bank", href: "/interview-question-bank", keywords: "interview questions spaced repetition sm2 flashcards behavioral" },
  { title: "Flashcard Maker", href: "/flashcard-maker", keywords: "flashcards bullets study expand ai front back" },
  { title: "Spaced Repetition Scheduler", href: "/spaced-repetition-scheduler", keywords: "spaced repetition sm2 scheduler interval ease factor anki" },
  { title: "Cornell Notes Template", href: "/cornell-notes-template", keywords: "cornell notes template cues summary lecture study" },
  { title: "Outline Flashcards Converter", href: "/outline-flashcards", keywords: "outline flashcards convert study notes front back ai" },
  { title: "Citation Formatter", href: "/citation-formatter", keywords: "citation apa mla bibliography format doi journal" },
  { title: "Bibliography Deduper", href: "/bibliography-deduper", keywords: "bibliography dedupe duplicate doi title fuzzy references" },
  ...ADS_TOOLS.map((tool) => ({
    title: tool.title,
    href: `/${tool.slug}`,
    keywords: `${tool.title.toLowerCase()} ads marketing ppc performance calculator`,
  })),
  { title: "Trading Tools", href: "/trading-tools", keywords: "trading tools risk execution journal futures forex stocks crypto" },
  ...TRADING_TOOLS.map((tool) => ({
    title: tool.title,
    href: `/${tool.path}`,
    keywords: `${tool.keywords} trading tool`,
  })),
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
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const listboxId = useId();
  const router = useRouter();
  const isMobile = useIsMobile();

  const results = query.trim().length >= 1
    ? SEARCHABLE_FEATURES.filter((f) => matchQuery(f.title, f.keywords, query))
    : [];

  const resultsKey = results.map((r) => r.href).join("\0");

  useEffect(() => {
    setActiveIndex(-1);
  }, [resultsKey]);

  useEffect(() => {
    if (activeIndex < 0) return;
    optionRefs.current[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setActiveIndex(-1);
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
    setActiveIndex(-1);
  };

  const navigateToResult = (href: string) => {
    closeMobilePanel();
    router.push(href);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const dropdownVisible = isOpen && query.trim().length >= 1 && results.length > 0;

    if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      setActiveIndex(-1);
      if (isMobile === true) setMobilePanelOpen(false);
      return;
    }

    if (!dropdownVisible) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i < results.length - 1 ? i + 1 : 0));
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? results.length - 1 : i - 1));
      return;
    }

    if (e.key === "Enter" && activeIndex >= 0 && activeIndex < results.length) {
      e.preventDefault();
      navigateToResult(results[activeIndex].href);
    }
  };

  const activeOptionId =
    activeIndex >= 0 && activeIndex < results.length
      ? `${listboxId}-option-${activeIndex}`
      : undefined;

  const resultsList = (
    <>
      {results.length > 0 ? (
        <ul
          id={listboxId}
          role="listbox"
          className="py-2 max-h-[min(280px,60vh)] overflow-y-auto"
        >
          {results.map(({ title, href }, index) => {
            const isActive = index === activeIndex;
            return (
              <li key={href} role="presentation">
                <Link
                  id={`${listboxId}-option-${index}`}
                  ref={(el) => {
                    optionRefs.current[index] = el;
                  }}
                  href={href}
                  role="option"
                  aria-selected={isActive}
                  onClick={closeMobilePanel}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 transition-colors text-left ${
                    isActive
                      ? "bg-slate-200 dark:bg-slate-700"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <div className="size-8 sm:size-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                    <DocumentTextIcon className="size-4 sm:size-5 text-slate-500 dark:text-slate-400" />
                  </div>
                  <span className="font-medium text-sm sm:text-base text-slate-900 dark:text-white truncate">
                    {title}
                  </span>
                </Link>
              </li>
            );
          })}
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

  const inputAriaProps = {
    role: "combobox" as const,
    "aria-expanded": isOpen && query.trim().length >= 1,
    "aria-controls": listboxId,
    "aria-activedescendant": activeOptionId,
    "aria-autocomplete": "list" as const,
    onKeyDown: handleKeyDown,
  };

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
                  {...inputAriaProps}
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
          {...inputAriaProps}
        />
      </div>

      {dropdownContent}
    </div>
  );
}
