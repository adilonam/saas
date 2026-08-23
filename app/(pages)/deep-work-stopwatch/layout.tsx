import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Deep Work Stopwatch – eProd",
  description:
    "Count-up stopwatch for deep-work blocks with optional session log in your browser.",
};

export default function DeepWorkStopwatchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
