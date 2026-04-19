import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Deep-Work Quota Tracker – eProd",
  description: "Set a weekly deep-work target and log hours; progress stays in your browser.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
