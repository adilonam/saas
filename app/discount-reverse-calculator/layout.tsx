import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reverse Discount Calculator – eProd",
  description:
    "Find the original list price before a percent discount when you know the sale price.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
