import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Weekly Calendar Notes – eProd",
  description:
    "Seven-day grid with notes per day. Stored locally in your browser.",
};

export default function WeeklyCalendarNotesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
