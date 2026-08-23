import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BMI Calculator – eProd",
  description:
    "Calculate your Body Mass Index (BMI) from weight and height. See your category and healthy weight range.",
};

export default function BMICalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
