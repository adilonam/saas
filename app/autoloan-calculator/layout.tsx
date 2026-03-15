import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Auto Loan Calculator – Anycode",
  description:
    "Calculate monthly payment, total interest, and total cost for a car loan. Enter loan amount, APR, and term.",
};

export default function AutoLoanCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
