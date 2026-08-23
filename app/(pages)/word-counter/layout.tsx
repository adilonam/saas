import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Word Counter – eProd",
  description:
    "Count words, characters, lines, and paragraphs in your text. Free productivity tool.",
};

export default function WordCounterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
