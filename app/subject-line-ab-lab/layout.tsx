import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Subject Line A/B Idea Lab – eProd",
  description: "Compare two email subject lines and optionally generate A/B pairs with AI.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
