import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Daily Time Block Planner – eProd",
  description:
    "Plan your day with labeled time blocks. Data stays in your browser.",
};

export default function DailyTimeBlockPlannerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
