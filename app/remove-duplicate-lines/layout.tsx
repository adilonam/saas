import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Remove Duplicate Lines – eProd",
  description:
    "Remove repeated lines from text while keeping first occurrence order.",
};

export default function RemoveDuplicateLinesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
