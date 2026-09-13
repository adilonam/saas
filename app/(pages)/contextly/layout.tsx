import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contextly – Chrome Writing Assistant",
  description:
    "Contextly is a Chrome extension that helps you improve writing anywhere on the web. Select text, choose a prompt, preview the result, then apply or copy it.",
  alternates: {
    canonical: "https://www.eprod.io/contextly",
  },
  openGraph: {
    title: "Contextly – Chrome Writing Assistant",
    url: "https://www.eprod.io/contextly",
    description:
      "Select text on any page, choose a prompt, preview an AI rewrite, then apply or copy it. Manage personal prompts in the extension popup.",
  },
};

export default function ContextlyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
