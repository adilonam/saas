import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cron Expression Generator – Anycode",
  description:
    "Build cron expressions for minute, hour, day, month, weekday. Presets for common schedules.",
};

export default function CronGeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
