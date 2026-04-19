import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Regex plain-English explainer – eProd",
  description:
    "Describe what a regular expression does in plain language with optional AI and flavor hints.",
};

export default function RegexPlainEnglishLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
