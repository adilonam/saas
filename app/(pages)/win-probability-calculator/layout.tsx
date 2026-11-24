import { generateToolMetadata, generateJsonLd } from '@/lib/metadata-utils';
import { Metadata } from 'next';

const toolName = "pWin Calculator – Win Probability for Bids & Records";
const toolDescription = "Free pWin calculator for proposal and bid probability of win. Also calculate win rate from a W/L record and implied probability from decimal odds. Transparent weighted scorecard—no signup.";
const toolPath = "/win-probability-calculator";

export const metadata: Metadata = generateToolMetadata({
  title: toolName,
  description: toolDescription,
  path: toolPath,
  keywords: [
    "pwin calculator",
    "pWin calculator",
    "win probability calculator",
    "probability of win",
    "bid win probability",
    "proposal pWin",
    "win rate calculator",
    "how to calculate pwin",
    "odds probability calculator",
  ],
  category: "Calculators",
});

export default function WinProbabilityCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = generateJsonLd({
    name: toolName,
    description: toolDescription,
    url: `https://www.eprod.io${toolPath}`,
    applicationCategory: "UtilitiesApplication",
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
