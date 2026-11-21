import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog – eProd",
  description: "Tips, guides, and insights on productivity tools, PDF management, calculators, and more. Learn how to get more done with free online tools.",
  keywords: "productivity blog, productivity tips, PDF tools guide, calculator tutorials, free online tools",
  alternates: {
    canonical: "https://www.eprod.io/blog",
  },
  openGraph: {
    title: "Blog – eProd",
    description: "Tips, guides, and insights on productivity tools, PDF management, calculators, and more.",
    url: "https://www.eprod.io/blog",
    siteName: "eProd",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Blog – eProd",
    description: "Tips, guides, and insights on productivity tools, PDF management, calculators, and more.",
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
