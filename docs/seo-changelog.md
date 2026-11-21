# SEO Changelog

This file tracks SEO improvements and optimizations made to eprod.io.

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
