import prisma from "./prisma";
import { Metadata } from "next";

const SITE_NAME = "eProd";
const SITE_URL = "https://www.eprod.io";

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  metaDescription: string | null;
  keywords: string | null;
  content: string;
  coverImage: string | null;
  relatedTools: string | null;
  category: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RelatedTool {
  slug: string;
  title: string;
  description?: string;
}

const TOOL_MAP: Record<string, RelatedTool> = {
  "youtube-title-length-checker": {
    slug: "youtube-title-length-checker",
    title: "YouTube Title Length Checker",
    description: "Check if your YouTube title fits within the optimal character limit"
  },
  "sign-pdf": {
    slug: "sign-pdf",
    title: "Sign PDF",
    description: "Add your signature to PDF documents online for free"
  },
  "merge-pdf": {
    slug: "merge-pdf",
    title: "Merge PDF",
    description: "Combine multiple PDF files into a single document"
  },
  "age-calculator": {
    slug: "age-calculator",
    title: "Age Calculator",
    description: "Calculate age from date of birth with precision"
  },
  "acceptance-criteria-generator": {
    slug: "acceptance-criteria-generator",
    title: "Acceptance Criteria Generator",
    description: "Generate clear acceptance criteria for user stories"
  },
  "ai-email-subject-line": {
    slug: "ai-email-subject-line",
    title: "AI Email Subject Line Generator",
    description: "Create compelling email subject lines with AI"
  },
  "ai-resume-bullet": {
    slug: "ai-resume-bullet",
    title: "AI Resume Bullet Generator",
    description: "Generate impactful resume bullet points with AI"
  },
  "wealth-comparison-calculator": {
    slug: "wealth-comparison-calculator",
    title: "Wealth Comparison Calculator",
    description: "Compare wealth and income across different demographics"
  },
  "win-probability-calculator": {
    slug: "win-probability-calculator",
    title: "pWin / Win Probability Calculator",
    description: "Proposal pWin scorecard, win rate from record, and odds-implied probability"
  },
  "probability-calculator": {
    slug: "probability-calculator",
    title: "Probability Calculator",
    description: "General probability calculations for events and combinations"
  },
  "roi-calculator": {
    slug: "roi-calculator",
    title: "ROI Calculator",
    description: "Estimate return on investment for projects and proposals"
  },
  "task-prioritizer": {
    slug: "task-prioritizer",
    title: "Task Prioritizer",
    description: "Rank work when deciding which opportunities to pursue"
  },
  "churn-rate-calculator": {
    slug: "churn-rate-calculator",
    title: "Churn Rate Calculator",
    description: "Calculate customer churn rate and retention metrics"
  },
  "ltv-calculator": {
    slug: "ltv-calculator",
    title: "Customer Lifetime Value Calculator",
    description: "Calculate LTV and customer profitability"
  },
  "cac-calculator": {
    slug: "cac-calculator",
    title: "Customer Acquisition Cost Calculator",
    description: "Calculate how much it costs to acquire each customer"
  },
  "ltv-cac-calculator": {
    slug: "ltv-cac-calculator",
    title: "LTV:CAC Ratio Calculator",
    description: "Measure customer acquisition efficiency"
  },
  "leverage-margin-calculator": {
    slug: "leverage-margin-calculator",
    title: "Leverage & Margin Calculator",
    description: "Calculate required margin and leverage ratios for trading"
  },
  "position-size-calculator": {
    slug: "position-size-calculator",
    title: "Position Size Calculator",
    description: "Calculate optimal position size based on risk tolerance"
  },
  "risk-reward-ratio-calculator": {
    slug: "risk-reward-ratio-calculator",
    title: "Risk/Reward Ratio Calculator",
    description: "Calculate risk/reward ratio for trades"
  },
  "forex-position-size-calculator": {
    slug: "forex-position-size-calculator",
    title: "Forex Position Size Calculator",
    description: "Calculate lot size for forex trading"
  },
  "risk-per-trade-calculator": {
    slug: "risk-per-trade-calculator",
    title: "Risk Per Trade Calculator",
    description: "Calculate how much to risk per trade"
  },
};

export async function getPublishedPosts(page = 1, pageSize = 12): Promise<{
  posts: BlogPost[];
  totalPages: number;
  totalPosts: number;
}> {
  try {
    const skip = (page - 1) * pageSize;

    const [posts, totalPosts] = await Promise.all([
      prisma.blogPost.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.blogPost.count({
        where: { status: "PUBLISHED" },
      }),
    ]);

    return {
      posts,
      totalPages: Math.ceil(totalPosts / pageSize),
      totalPosts,
    };
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    // Return empty state if table doesn't exist yet
    return {
      posts: [],
      totalPages: 0,
      totalPosts: 0,
    };
  }
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    return await prisma.blogPost.findUnique({
      where: { slug, status: "PUBLISHED" },
    });
  } catch (error) {
    console.error("Error fetching blog post:", error);
    return null;
  }
}

export async function getAllPostSlugs(): Promise<string[]> {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true },
    });
    return posts.map((p) => p.slug);
  } catch (error) {
    console.error("Error fetching blog post slugs:", error);
    return [];
  }
}

export function parseRelatedTools(relatedToolsString: string | null): RelatedTool[] {
  if (!relatedToolsString) return [];
  
  const slugs = relatedToolsString.split(",").map((s) => s.trim()).filter(Boolean);
  return slugs
    .map((slug) => TOOL_MAP[slug])
    .filter((tool): tool is RelatedTool => tool !== undefined);
}

export function generateBlogPostMetadata(post: BlogPost): Metadata {
  const url = `${SITE_URL}/blog/${post.slug}`;
  const title = post.title; // Root layout adds "| eProd" suffix
  const description = post.metaDescription || post.title;

  return {
    title,
    description,
    keywords: post.keywords || undefined,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale: "en_US",
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      images: post.coverImage ? [{ url: post.coverImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export function generateBlogPostJsonLd(post: BlogPost) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.metaDescription || post.title,
    image: post.coverImage || undefined,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/blog/${post.slug}`,
    },
  };
}

export function generateBreadcrumbJsonLd(post: BlogPost) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: `${SITE_URL}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: `${SITE_URL}/blog/${post.slug}`,
      },
    ],
  };
}
