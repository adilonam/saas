import { generateToolMetadata, generateJsonLd } from '@/lib/metadata-utils';
import { Metadata } from 'next';

const toolName = "Win Probability Calculator";
const toolDescription = "Free win probability calculator. Calculate the probability of winning based on odds, win rate, and number of attempts. Statistical probability tool for games, sports betting, and risk analysis.";
const toolPath = "/win-probability-calculator";

export const metadata: Metadata = generateToolMetadata({
  title: toolName,
  description: toolDescription,
  path: toolPath,
  keywords: [
    "win probability",
    "probability calculator",
    "win rate calculator",
    "odds calculator",
    "betting calculator",
    "statistical probability",
    "chance calculator",
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
