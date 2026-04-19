import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Utilization Calculator – eProd",
  description: "Calculate utilization as billable hours divided by available hours.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
