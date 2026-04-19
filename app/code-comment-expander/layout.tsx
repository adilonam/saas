import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Code comment expander – eProd",
  description:
    "Turn a one-line comment into a clearer block comment; optional AI adapts to your language.",
};

export default function CodeCommentExpanderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
