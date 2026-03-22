import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Break-even Calculator – eProd",
  description:
    "Find how many units you need to sell to cover fixed and variable costs. Break-even point and revenue.",
};

export default function BreakevenCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
