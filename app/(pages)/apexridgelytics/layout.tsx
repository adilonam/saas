import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ApexRidgeLytics Consulting LLC – AI Software Agency",
  description:
    "ApexRidgeLytics Consulting LLC builds software apps with AI. Rated 4.8 stars on Upwork, Freelancer, Fiverr, and more.",
  alternates: {
    canonical: "https://www.eprod.io/apexridgelytics",
  },
  openGraph: {
    title: "ApexRidgeLytics Consulting LLC – AI Software Agency",
    url: "https://www.eprod.io/apexridgelytics",
    description:
      "Agency specialized in building software apps with AI. Connect on Upwork, Freelancer, Fiverr, WhatsApp, or Telegram.",
  },
};

export default function ApexRidgeLyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
