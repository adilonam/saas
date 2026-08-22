import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Text Diff Checker – eProd",
  description:
    "Compare two texts line by line. See added, removed, and unchanged lines.",
};

export default function TextDiffCheckerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
