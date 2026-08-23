import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EQ Test – Emotional Intelligence – eProd",
  description:
    "Take a 30-scenario emotional intelligence assessment covering self-awareness, regulation, empathy, social skills, and motivation — with a detailed EQ score report.",
};

export default function EqTestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
