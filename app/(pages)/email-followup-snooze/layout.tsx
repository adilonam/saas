import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Email Follow-Up Snooze List – eProd",
  description: "Local-only follow-up reminders: who, when, and notes — stored in your browser.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
