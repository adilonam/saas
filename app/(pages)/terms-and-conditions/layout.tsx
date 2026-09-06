import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms and Conditions – eProd",
  description:
    "Terms and Conditions for using eprod.io services operated by APEXRIDGELYTICS CONSULTING LLC.",
  alternates: {
    canonical: "https://www.eprod.io/terms-and-conditions",
  },
  openGraph: {
    title: "Terms and Conditions – eProd",
    url: "https://www.eprod.io/terms-and-conditions",
  },
};

export default function TermsAndConditionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
