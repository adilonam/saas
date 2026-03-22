import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Water Intake Calculator – eProd",
  description:
    "Estimate daily water intake from body weight and activity level.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
