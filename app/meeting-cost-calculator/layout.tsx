import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Meeting Cost Calculator – eProd",
  description:
    "Estimate the cost of a meeting from hourly rates, headcount, and duration.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
