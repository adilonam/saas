import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Work Hours Calculator – eProd",
  description:
    "Calculate net working hours from start time, end time, and break minutes.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
