import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hourly to Salary Calculator – eProd",
  description:
    "Convert an hourly wage to annual and monthly salary using hours per week and weeks per year.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
