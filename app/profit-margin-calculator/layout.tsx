import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profit Margin Calculator – eProd",
  description:
    "Gross profit, margin %, and markup % from cost and selling price.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
