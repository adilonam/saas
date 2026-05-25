import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Legal & Business Information – eProd",
  description:
    "Legal business information for eprod.io, operated by APEXRIDGELYTICS CONSULTING LLC.",
  alternates: {
    canonical: "https://www.eprod.io/legal",
  },
  openGraph: {
    title: "Legal & Business Information – eProd",
    url: "https://www.eprod.io/legal",
  },
};

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
