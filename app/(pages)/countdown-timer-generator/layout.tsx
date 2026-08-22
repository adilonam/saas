import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Countdown Timer Generator – eProd",
  description:
    "Set a target date and time and see a live countdown in days, hours, minutes, and seconds.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
