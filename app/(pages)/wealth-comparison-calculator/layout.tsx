import { generateToolMetadata, generateJsonLd } from '@/lib/metadata-utils';
import { Metadata } from 'next';

const toolName = "Wealth Comparison Calculator";
const toolDescription = "Free wealth comparison calculator. Compare your net worth to population percentiles and see where you stand. Calculate wealth distribution and financial standing relative to others.";
const toolPath = "/wealth-comparison-calculator";

export const metadata: Metadata = generateToolMetadata({
  title: toolName,
  description: toolDescription,
  path: toolPath,
  keywords: [
    "wealth calculator",
    "net worth calculator",
    "wealth comparison",
    "wealth percentile",
    "financial calculator",
    "net worth comparison",
    "wealth distribution",
  ],
  category: "Financial Calculators",
});

export default function WealthComparisonCalculatorLayout({
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
