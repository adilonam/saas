import { generateToolMetadata, generateJsonLd } from '@/lib/metadata-utils';
import { Metadata } from 'next';

const toolName = "New Year Countdown 2027";
const toolDescription = "Free New Year countdown timer. Count down to 2027 with a live real-time timer showing days, hours, minutes, and seconds until midnight January 1st, 2027.";
const toolPath = "/new-year-countdown";

export const metadata: Metadata = generateToolMetadata({
  title: toolName,
  description: toolDescription,
  path: toolPath,
  keywords: [
    "new year countdown",
    "2027 countdown",
    "new years eve countdown",
    "countdown to 2027",
    "new year timer",
    "days until new year",
    "new year counter",
  ],
  category: "Timers",
});

export default function NewYearCountdownLayout({
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
