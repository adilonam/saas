import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Random Decision Maker – eProd",
  description:
    "Enter options (one per line) and pick one at random — quick tie-breaker or choice picker.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
