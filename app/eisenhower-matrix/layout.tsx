import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Eisenhower Matrix – eProd",
  description:
    "Sort tasks by urgent and important quadrants. Local storage only.",
};

export default function EisenhowerMatrixLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
