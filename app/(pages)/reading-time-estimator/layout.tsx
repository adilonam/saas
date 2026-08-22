import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reading Time Estimator – eProd",
  description:
    "Estimate how long it takes to read your text using custom words per minute.",
};

export default function ReadingTimeEstimatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
