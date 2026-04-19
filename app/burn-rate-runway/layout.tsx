import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Burn Rate Runway – eProd",
  description:
    "Estimate how long cash lasts from balance and average monthly net burn (simple runway, not startup valuation).",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
