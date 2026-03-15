import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Probability Calculator – Anycode",
  description:
    "Single probability, P(A and B) / P(A or B), or combinations (n choose k). Free online probability calculator.",
};

export default function ProbabilityCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
