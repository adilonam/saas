import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Meeting-Free Day Planner – eProd",
  description:
    "See what share of your workweek is in meetings and how many hours stay meeting-free.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
