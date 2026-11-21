import { generateToolMetadata, generateJsonLd } from '@/lib/metadata-utils';
import { Metadata } from 'next';

const toolName = "Black Friday Discount Calculator";
const toolDescription = "Free Black Friday discount calculator. Stack multiple discounts, compare deals, and calculate final prices with tax. Find the best Black Friday and Cyber Monday deals instantly.";
const toolPath = "/black-friday-discount-calculator";

export const metadata: Metadata = generateToolMetadata({
  title: toolName,
  description: toolDescription,
  path: toolPath,
  keywords: [
    "black friday calculator",
    "discount calculator",
    "stack discounts",
    "cyber monday deals",
    "percentage off calculator",
    "sale price calculator",
    "black friday deals",
    "discount comparison",
  ],
  category: "Calculators",
});

export default function BlackFridayCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = generateJsonLd({
    name: toolName,
    description: toolDescription,
    url: `https://www.eprod.io${toolPath}`,
    applicationCategory: "UtilityApplication",
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
