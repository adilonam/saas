import { generateToolMetadata, generateJsonLd } from '@/lib/metadata-utils';
import { Metadata } from 'next';

const toolName = "Leverage Calculator – Free Leverage, Margin & Position Size Calculator";
const toolDescription = "Free leverage calculator for trading. Calculate leverage ratio, required margin, and position size for forex, CFDs, and crypto. No signup required.";
const toolPath = "/leverage-margin-calculator";

export const metadata: Metadata = generateToolMetadata({
  title: toolName,
  description: toolDescription,
  path: toolPath,
  keywords: [
    "leverage calculator",
    "calculate leverage",
    "leverage trading calculator",
    "leverage trade calculator",
    "cfd leverage ratio calculator",
    "leverage rechner",
    "leverage berekenen",
    "margin calculator",
    "leverage profit calculator",
    "portfolio leverage calculator",
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
