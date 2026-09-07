import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy – eProd",
  description:
    "Privacy Policy for eprod.io. Learn how APEXRIDGELYTICS CONSULTING LLC collects, uses, and protects your information.",
  alternates: {
    canonical: "https://www.eprod.io/privacy",
  },
  openGraph: {
    title: "Privacy Policy – eProd",
    url: "https://www.eprod.io/privacy",
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
