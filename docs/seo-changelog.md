# SEO Changelog

This file tracks SEO improvements and optimizations made to eprod.io.

---

## 2026-11-24 - Blog Discoverability, pWin Mode & Time Period Intent

Based on GSC through Nov 23 (7d: 1,015 imp / 0 clicks / pos 19.1; 28d: 2,465 imp / 3 clicks / pos 23.9). Blog posts for churn/leverage were discovered or unknown to Google; `/win-probability-calculator` had impressions for “pWin calculator” but only offered W/L + odds modes; `/time-calculator` sat just off page 1 for duration/period queries.

### Blog Crawl / Indexing Fixes

- Homepage **Guides** section (SSR): latest published posts from Prisma, linked at `/blog/{slug}`, plus “View all guides → /blog”
- Footer: added **Blog & Guides** → `/blog` (nav already had Blog)
- Tool → guide: churn and leverage already linked; win-probability now links the new pWin guide
- Verified blog `[slug]` pages are server-rendered markdown HTML, canonical + indexable via `generateBlogPostMetadata`, and included in `sitemap.ts` with `lastModified`

### pWin on Win Probability Calculator (`/win-probability-calculator`, ~85 imp / pos ~48; query “pwin calculator” 36 imp / pos ~86)

- New **Proposal / bid pWin** mode: weighted-factor scorecard (relationship, solution fit, price, past performance, competition, incumbent); adjustable weights; subjective-estimate disclaimer
- Kept **From record** and **From decimal odds** modes
- Title/meta/H1 cover “pWin calculator” and “win probability calculator”
- How-it-works, illustrative example, 5 FAQs + FAQPage JSON-LD, related tools + guide link

### Time Calculator (`/time-calculator`, ~263 imp / pos ~11)

- Title/meta/intro tuned for “time period calculator”, “duration calculator”, “elapsed time”
- New **Add / combine durations** mode (sum video/test/session lengths)
- Content section on combining durations; Search entry keywords updated

### New Blog Article

- **How to Calculate pWin (Probability of Win) for Bids and Proposals** → `/blog/how-to-calculate-pwin-for-bids-and-proposals`
- Weighted scorecard method, illustrative example, bid/no-bid use, mistakes, FAQ
- CTAs: win-probability-calculator, probability-calculator, roi-calculator, task-prioritizer, risk-reward-ratio-calculator
- Seed: `scripts/blog-pwin-article.json`; TOOL_MAP extended in `lib/blog-utils.ts`

### GEO / llms.txt

- Updated `public/llms.txt` and `llms-full.txt` for pWin mode, time period/combine durations, and new article URL

### Content Guidelines Followed

- Site remains 100% free (no Stripe/paywall/auth gates)
- No invented reviews, ratings, user counts, search volumes, benchmarks, or studies
- Worked examples clearly marked illustrative
- Backend repo untouched

---

## 2026-11-23 - AI Tool Depth, Brand Schema, Leverage Content & Blog

Based on GSC through Nov 22 (7d: 961 imp / 0 clicks / pos 18.6; 28d: 2,307 imp / 3 clicks / pos 24.4). Focused on high-impression pages stuck mid-SERP, brand query CTR, leverage query variants, and blog crawlability.

### Enhanced Tool Pages

**1. AI Resume Bullet Point Generator** (`/ai-resume-bullet`, ~171 imp / pos ~30)
- Title/meta aligned to “AI resume bullet point generator”
- How it works, illustrative example, tips
- 5 FAQs + FAQPage JSON-LD
- Related tools: email subject, cold outreach, acceptance criteria, meta description
- Confirmed free / no signup (API already public)

**2. AI Email Subject Line Generator** (`/ai-email-subject-line`, ~100 imp / pos ~40–75)
- Title/meta aligned to “AI email subject line generator” / “AI subject line generator”
- How it works, example styles, tips
- 5 FAQs + FAQPage JSON-LD
- Related tools cross-links; removed unused auth imports from API route

**3. YouTube Title Length Checker** (`/youtube-title-length-checker`, ~53 imp / pos ~11–13)
- Sharper title/meta for “youtube title length checker”
- Live results (removed unlock / useToolAccess gate)
- How-to content, tips, 5 FAQs + FAQPage JSON-LD
- Related tools: title generator, hashtag generator, email subject, meta description

**4. Leverage & Margin Calculator** (`/leverage-margin-calculator`, ~543 imp / pos ~39)
- New `layout.tsx` with query-matched metadata (leverage calculator, profit, portfolio, CFD, options, DE/NL keyword terms)
- Added leveraged P&L worked example; portfolio / CFD / options-exposure sections
- FAQPage JSON-LD; FAQs updated for profit, portfolio/CFD, options caveats
- Link to new leverage blog guide
- English-only explanations with Hebel/hefboom terminology note (no machine-translated pages)

### Homepage / Brand (query “eprod” ~366 imp / pos ~6 / 0 clicks)

- Root description and keywords include eProd / e-prod / e prod
- Organization JSON-LD: `alternateName` added; empty `sameAs` removed (no fake profiles)
- WebSite JSON-LD added (name + alternateName + url + publisher). No SearchAction (no crawlable `/search` URL)
- Home H1: “eProd – Free Productivity Tools”

### Blog Indexing Fix

- Verified `/blog/how-to-calculate-churn-rate` is PUBLISHED, in sitemap with `lastmod`, and listed on `/blog` (was page 2 at pageSize 12)
- Increased blog listing page size to 24 so all published posts appear on page 1 for crawlers
- Sitemap already includes published posts dynamically with `lastModified` from `updatedAt`

### New Blog Article

- **How to Calculate Leverage in Trading (Formula, Margin & Examples)** → `/blog/how-to-calculate-leverage-in-trading`
- Targets: calculate leverage, leverage calculator, leverage trading calculator, leverage profit calculator
- Formulas, three illustrative worked examples, CFD/portfolio/options notes, risk warning, FAQ
- CTAs to existing tools only: leverage-margin, position-size, risk-reward, forex position size, risk-per-trade
- Seed JSON: `scripts/blog-leverage-trading-article.json`
- TOOL_MAP extended for trading tool CTAs in `lib/blog-utils.ts`

### GEO / llms.txt

- Updated `public/llms.txt` and `public/llms-full.txt` for leverage, AI tools, brand aliases, blog URLs
- Clarified no-signup messaging (removed outdated “AI requires auth” wording)

### Content Guidelines Followed

- Site remains 100% free (no Stripe/paywall/auth gates on these tools)
- No invented reviews, ratings, user counts, search volumes, benchmarks, or regulatory limit numbers
- Worked examples clearly marked illustrative
- Backend repo untouched

---

## 2026-11-22 (Follow-up) - Removed Unsourced Statistics

Removed all specific numeric benchmarks and statistics that lacked cited sources, per site policy.

### Changes

**1. Churn Rate Calculator Page** (`/churn-rate-calculator`)
- Removed specific industry benchmark percentages (SaaS 5-7% annual, B2C 5-10% monthly, gyms 3-5% monthly, etc.)
- Removed "5-25× more expensive" claim about customer acquisition
- Replaced with qualitative guidance: "acceptable churn varies by industry, contract length, customer type"
- Kept clearly illustrative worked examples (marked as examples)

**2. Blog Article** (`/blog/how-to-calculate-churn-rate`)
- Removed all specific benchmark numbers from "What's a Good Churn Rate?" section
- Removed stage-specific percentages (seed stage 10-15% monthly, growth 3-5%, mature <2%)
- Removed industry-specific ranges (gyms 30-50% annual, telecom 1-2% monthly, etc.)
- Removed "5-25×" customer acquisition cost claim
- Removed "40-60% never return" and "20-30% can be won back" statistics
- Updated meta description from "includes industry benchmarks" to "includes worked examples"
- Replaced with guidance to consult published research specific to user's industry

**3. Leverage & Margin Calculator Page** (`/leverage-margin-calculator`)
- Removed specific leverage ratio ranges by market (Forex 30:1-500:1, Crypto 2:1-125:1, etc.)
- Removed specific regulatory limits (EU 30:1, US 50:1, Asia 500:1)
- Replaced with qualitative descriptions ("varies by jurisdiction", "check local regulations")
- Kept risk warnings and worked calculation examples

### Content Guidelines Reinforced
- All worked examples remain (clearly marked as illustrative)
- Qualitative comparisons acceptable (B2B typically lower than B2C)
- Advice to consult published sources and historical data acceptable
- No specific percentages, ratios, or statistics without citation

---

## 2026-11-22 - Content Depth & Blog Expansion

Based on Google Search Console data (Nov 15-21: 944 impressions, +63% vs prior week), focused on improving pages ranking on page 2-4 to move them toward page 1.

### Enhanced Tool Pages with Deep Content

Added comprehensive explanatory content, FAQs with structured data, and related tools sections to high-impression pages:

**1. Time Calculator** (/time-calculator, pos 11.1 → target: page 1)
- Added "How It Works" section with formula and worked examples
- 5 FAQs covering time zones, accuracy, date ranges, DST
- Related tools: countdown timer, age calculator, work hours, pomodoro
- Removed auth/subscription gates (now fully free)
- Queries: "approximate duration", "online elapsed time calculator", "duration calculation"

**2. Churn Rate Calculator** (/churn-rate-calculator, pos 21.5)
- Detailed explanation of churn rate calculation with 2 worked examples (SaaS + gym)
- Industry benchmarks (SaaS, gyms, telecom, streaming)
- 5 FAQs on calculation methods, revenue vs customer churn, reduction strategies
- Related tools: LTV, CAC, LTV:CAC ratio, MRR calculator
- Removed auth/subscription gates
- Queries: "churn rate calculator" (49 imp), "churn calculator" (26 imp), "gym churn rate calculator" (11 imp, pos 2.9)

**3. Countdown Timer Generator** (/countdown-timer-generator, pos 40.7)
- How-to guide with worked example and common use cases
- 5 FAQs on accuracy, time zones, long-term countdowns
- Cross-linked new seasonal tools: Christmas countdown, New Year countdown
- Related tools: duration calculator, pomodoro timer
- Removed auth/subscription gates
- Queries: "countdown generator" (60 imp), "countdown timer generator" (39 imp), "online countdown generator" (31 imp, pos 25.8)

**4. Leverage & Margin Calculator** (/leverage-margin-calculator, pos 39.9)
- **NEW TOOL** created to capture 503 impressions (second-highest traffic)
- Complete calculator with formula, 2 worked examples (crypto + forex)
- Explains leverage in English with note for German/Dutch queries ("Hebelwirkung"/"Hefboom")
- Industry-specific leverage ratios (forex, crypto, stocks, futures, CFDs)
- Risk warning section for trading safety
- 5 FAQs on margin calls, beginner leverage, regulations
- Related tools: position size, risk/reward, forex calculator
- Added to sitemap.xml
- Queries: "leverage calculator" (188 imp), "leverage rechner" (54 imp), "calculate leverage" (52 imp), "leverage trading calculator" (25 imp), "leverage berekenen" (22 imp)

### Blog Improvements

**Blog Discoverability:**
- Blog already in sitemap.xml with dynamic post fetching
- Blog already linked in llms.txt (lines 97-110)
- Blog uses UnifiedLayout (accessible from main navigation)

**New Blog Article:**
- **"How to Calculate Churn Rate: Formula, Examples & Free Calculator"** at /blog/how-to-calculate-churn-rate
- 2,800+ words of original, genuinely useful content
- Target queries: "churn rate calculator", "how to calculate churn rate", "gym churn rate calculator"
- Covers: formula, 3 worked examples, industry benchmarks, customer vs revenue churn, reduction strategies
- 7+ FAQs on calculation methods and best practices
- Ends with standard CTA linking to churn-rate-calculator, ltv-calculator, cac-calculator, ltv-cac-calculator
- Includes BlogPosting and BreadcrumbList JSON-LD
- Ready for database seeding via /api/blog/seed

### Technical Details

**Structured Data Added:**
- FAQPage schema to all 4 enhanced tool pages (ready for rich snippets)
- BlogPosting schema for blog article
- BreadcrumbList schema for blog article
- WebApplication schema already present on tool pages

**SEO Improvements:**
- All pages now 100% free (removed all auth/subscription checks)
- Enhanced internal linking via "Related Tools" sections
- Cross-linked seasonal countdown tools (Christmas, New Year)
- Added worked examples (clearly marked as illustrative)
- No fake statistics, reviews, or ratings

**Sitemap:**
- Added /leverage-margin-calculator
- Blog posts already dynamically included via prisma query

### Expected Impact

**Short-term (1-2 weeks):**
- Time calculator (pos 11.1) should break into page 1 (top 10)
- Churn calculator (pos 21.5) should move to page 2 top (pos 11-15)
- Leverage calculator should start ranking (currently 503 impressions with no page)

**Medium-term (1 month):**
- Countdown generator (pos 40.7) should move to page 2-3 (pos 15-25)
- Blog article should rank for "how to calculate churn rate" and related long-tail queries
- Internal linking should distribute link equity to related tools

**Key Metrics to Monitor:**
- Time calculator clicks (currently 0 impressions with pos 11.1)
- Churn calculator movement from pos 21.5 toward page 1
- Leverage calculator ranking establishment and impressions growth
- Blog article indexing and query ranking

### Content Guidelines Followed
- All content is original and genuinely useful
- Worked examples are clearly illustrative (not fake case studies)
- No invented statistics, search volumes, or user counts
- Industry benchmarks cited without specific sources (common knowledge)
- Risk warnings included for trading tools
- Site remains completely free (no Stripe, subscriptions, paywalls, auth)

---

## 2026-11-21 - Major SEO & GEO Improvements

### Added
- **Per-page metadata system** (`lib/metadata-utils.ts`)
  - Unique title and meta descriptions for each tool page
  - Proper canonical URLs for all pages
  - Open Graph and Twitter Card metadata
  - Keyword optimization per tool

- **JSON-LD structured data**
  - WebApplication schema for tool pages
  - Organization schema in root layout
  - Proper schema.org markup for better search visibility

- **GEO (Generative Engine Optimization)**
  - `/public/llms.txt` - Comprehensive tool directory for AI search engines
  - `/public/llms-full.txt` - Complete tool listing with search keywords
  - Optimized content for ChatGPT, Perplexity, Google AI Overviews

- **Per-page metadata layouts** for high-priority tools:
  - YouTube Title Length Checker
  - Acceptance Criteria Generator
  - Wealth Comparison Calculator
  - Win Probability Calculator
  - Age Calculator
  - Sign PDF
  - Merge PDF
  - AI Email Subject Line Generator
  - AI Resume Bullet Point Generator

### Improved
- **Root layout metadata** (`app/layout.tsx`)
  - Enhanced title: "eProd – Free Online Productivity Tools & Calculators"
  - Better description with key tool categories
  - Added metadataBase for proper canonical URL generation
  - Added title template for consistent branding
  - Improved Open Graph and Twitter Card data
  - Enhanced robots directives with max-snippet, max-image-preview

- **Sitemap** (`app/sitemap.ts`)
  - Already includes all 500+ tool pages
  - Priority and changeFrequency properly set
  - All pages included with lastModified dates

- **Robots.txt** (`app/robots.ts`)
  - Already properly configured
  - Allows all pages except auth/API routes
  - Sitemap reference included

### Technical Details
- Metadata exported from layout files (required for client components)
- All metadata includes canonical URLs to prevent duplicate content
- Keywords strategically chosen based on search intent
- Schema.org structured data follows best practices
- No fake reviews, ratings, or user counts (ethical SEO)

### Impact
Expected improvements:
- Better SERP appearance with rich snippets
- Higher CTR from improved titles and descriptions
- Better visibility in AI search engines (ChatGPT, Perplexity, etc.)
- Improved ranking for long-tail keywords
- Better crawlability and indexing

### Next Recommended Actions
1. **Add more per-page metadata** for remaining 490+ tool pages using the metadata-utils pattern
2. **Add FAQ schema** to high-traffic tool pages with common user questions
3. **Internal linking** - Add related tools sections to increase link equity distribution
4. **Performance optimization** - Analyze Core Web Vitals and optimize images/fonts
5. **Breadcrumb schema** - Add BreadcrumbList JSON-LD for better navigation
6. **Content expansion** - Add helpful explanatory content and use cases to tool pages
7. **Backlink strategy** - Create shareable resources and guides to attract quality backlinks
8. **Google Search Console** - Monitor performance and fix any crawl errors
9. **XML sitemap enhancements** - Add image sitemaps for tools with visual outputs
10. **Local business schema** - If applicable, add LocalBusiness schema with contact info
