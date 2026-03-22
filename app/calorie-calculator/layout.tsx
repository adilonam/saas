import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calorie Calculator – eProd",
  description:
    "Estimate your daily calorie needs (TDEE) from age, sex, weight, height, and activity level. Maintain, lose, or gain weight.",
};

export default function CalorieCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
