import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GPA Calculator – eProd",
  description:
    "Calculate your Grade Point Average (GPA) from letter grades and credit hours. Add multiple courses and see your cumulative GPA.",
};

export default function GPACalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
