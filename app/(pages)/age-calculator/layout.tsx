import { generateToolMetadata, generateJsonLd } from '@/lib/metadata-utils';
import { Metadata } from 'next';

const toolName = "Age Calculator – Years, Months, Days (Free)";
const toolDescription = "Free age calculator. Calculate exact age in years, months, and days from birthdate. Find age between two dates, days until next birthday, and total days lived. Accurate age calculation tool.";
const toolPath = "/age-calculator";

export const metadata: Metadata = generateToolMetadata({
  title: toolName,
  description: toolDescription,
  path: toolPath,
  keywords: [
    "age calculator",
    "calculate age",
    "age in days",
    "birthday calculator",
    "date calculator",
    "age counter",
    "how old am i",
  ],
  category: "Calculators",
});

export default function AgeCalculatorLayout({
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
