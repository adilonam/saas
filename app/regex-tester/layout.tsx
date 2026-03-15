import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Regex Tester Online – Anycode",
  description:
    "Test regular expressions against sample text. See matches and debug regex patterns.",
};

export default function RegexTesterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
