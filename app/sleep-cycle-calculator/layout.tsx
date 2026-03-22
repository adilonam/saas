import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sleep Cycle Calculator – eProd",
  description:
    "Suggested bedtimes based on 90-minute sleep cycles and your wake-up time.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
