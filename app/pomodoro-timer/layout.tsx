import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pomodoro Timer – eProd",
  description:
    "Focus timer with work and break intervals plus session history saved in your browser.",
};

export default function PomodoroTimerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
