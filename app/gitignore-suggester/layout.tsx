import type { Metadata } from "next";

export const metadata: Metadata = {
  title: ".gitignore by stack – eProd",
  description:
    "Build a .gitignore from curated stack templates (Node, Next.js, Python, and more). Optional AI suggests extra patterns.",
};

export default function GitignoreSuggesterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
