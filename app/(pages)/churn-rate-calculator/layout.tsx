import { generateToolMetadata, generateJsonLd } from "@/lib/metadata-utils";
import { Metadata } from "next";

const toolName = "Churn Rate Calculator – Free Churn Calculator";
const toolDescription =
  "Free churn rate calculator and churn calculator. Measure customer or membership churn, estimate churn impact on revenue, and see retention—works for SaaS, gyms, and subscriptions. No signup.";
const toolPath = "/churn-rate-calculator";

export const metadata: Metadata = generateToolMetadata({
  title: toolName,
  description: toolDescription,
  path: toolPath,
  keywords: [
    "churn rate calculator",
    "churn calculator",
    "gym churn rate calculator",
    "churn impact calculator",
    "customer churn calculator",
    "membership churn calculator",
    "churn rate berekenen",
    "churn rate rechner",
    "retention rate calculator",
  ],
  category: "Business Calculators",
});

export default function ChurnRateCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = generateJsonLd({
    name: toolName,
    description: toolDescription,
    url: `https://www.eprod.io${toolPath}`,
    applicationCategory: "FinanceApplication",
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
