import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forex Trading Web App – eProd",
  description:
    "Production-ready forex trading web application. Watch the preview and purchase the full license for $999 USD.",
  alternates: {
    canonical: "https://www.eprod.io/forex-trading-app",
  },
  openGraph: {
    title: "Forex Trading Web App – eProd",
    url: "https://www.eprod.io/forex-trading-app",
    description:
      "Production-ready forex trading web application. Preview the demo and buy the full license for $999 USD.",
  },
};

export default function ForexTradingAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
