import { generateToolMetadata, generateJsonLd } from '@/lib/metadata-utils';
import { Metadata } from 'next';

const toolName = "Time Calculator";
const toolDescription = "Free online time calculator. Add, subtract, and convert time durations with precision. Calculate hours, minutes, seconds, and time differences between dates. Perfect for time tracking and scheduling.";
const toolPath = "/time-calculator";

export const metadata: Metadata = generateToolMetadata({
  title: toolName,
  description: toolDescription,
  path: toolPath,
  keywords: [
    "time calculator",
    "duration calculator",
    "time difference calculator",
    "hours calculator",
    "time converter",
    "elapsed time calculator",
    "time addition",
    "time subtraction",
  ],
  category: "Calculators",
});

export default function TimeCalculatorLayout({
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
