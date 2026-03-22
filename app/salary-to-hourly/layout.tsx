import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Salary to Hourly Calculator – eProd",
  description:
    "Convert annual salary to an equivalent hourly rate using hours per week and weeks per year.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
