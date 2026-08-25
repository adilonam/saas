import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DNA Test – Ancestry from Selfie – eProd",
  description:
    "Upload or take a selfie for a fun, entertainment-style ancestry estimate by country with flags and percentages. Not a real DNA test.",
};

export default function DnaTestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
