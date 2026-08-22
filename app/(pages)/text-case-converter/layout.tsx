import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Text Case Converter – eProd",
  description:
    "Convert text to UPPER, lower, Title Case, or sentence case instantly.",
};

export default function TextCaseConverterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
