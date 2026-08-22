import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "IQ Test – eProd",
  description:
    "Take a 38-question IQ assessment with visual puzzles, mindset prompts, and a detailed cognitive score report.",
};

export default function IqTestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
