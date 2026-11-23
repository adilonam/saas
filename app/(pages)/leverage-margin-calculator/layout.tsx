import { generateToolMetadata, generateJsonLd } from '@/lib/metadata-utils';
import { Metadata } from 'next';

const toolName = "Leverage Calculator – Margin, Profit & Trading (Free)";
const toolDescription = "Free leverage and margin calculator for trading. Find required margin, understand leverage ratios for forex, CFDs, options-style exposure, and portfolios. No signup required.";
const toolPath = "/leverage-margin-calculator";

export const metadata: Metadata = generateToolMetadata({
  title: toolName,
  description: toolDescription,
  path: toolPath,
  keywords: [
    "leverage calculator",
    "calculate leverage",
    "leverage trading calculator",
    "leverage profit calculator",
    "portfolio leverage calculator",
    "options leverage calculator",
    "cfd leverage ratio calculator",
    "margin calculator",
    "leverage rechner",
    "leverage berekenen",
  ],
  category: "Calculators",
});

export default function LeverageMarginCalculatorLayout({
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
