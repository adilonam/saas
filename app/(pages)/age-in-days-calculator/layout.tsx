import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Age in Days Calculator – eProd",
  description:
    "How many days old you are from a birth date to today or a chosen date.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
