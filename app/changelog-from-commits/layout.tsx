import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Changelog from commits – eProd",
  description:
    "Paste conventional commit lines and generate a Markdown changelog grouped by commit type.",
};

export default function ChangelogFromCommitsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
