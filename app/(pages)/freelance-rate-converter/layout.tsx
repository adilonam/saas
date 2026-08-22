import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Freelance Rate ↔ Annual Income – eProd",
  description:
    "Convert hourly bill rate to expected annual income and back, using work weeks and billable utilization.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
