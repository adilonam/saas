import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log line parser – eProd",
  description:
    "Parse JSON or key=value log lines into a table for quick scanning in the browser.",
};

export default function LogLineParserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
