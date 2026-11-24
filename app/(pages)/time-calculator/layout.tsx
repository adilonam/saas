import { generateToolMetadata, generateJsonLd } from '@/lib/metadata-utils';
import { Metadata } from 'next';

const toolName = "Time Period & Duration Calculator – Elapsed Time (Free)";
const toolDescription = "Free time period calculator and duration calculator. Find elapsed time between two dates, or add and combine durations (video length, test duration, and more). No signup.";
const toolPath = "/time-calculator";

export const metadata: Metadata = generateToolMetadata({
  title: toolName,
  description: toolDescription,
  path: toolPath,
  keywords: [
    "time calculator",
    "time period calculator",
    "duration calculator",
    "elapsed time calculator",
    "online elapsed time calculator",
    "time difference calculator",
    "video duration calculator",
    "test duration calculator",
    "combine durations",
    "add time durations",
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
