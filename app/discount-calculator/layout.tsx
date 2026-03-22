import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Discount & Sale Price Calculator – eProd",
  description:
    "Calculate sale price from discount percent or find discount percent from original and sale price.",
};

export default function DiscountCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
