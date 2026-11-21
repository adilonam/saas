import { generateToolMetadata, generateJsonLd } from '@/lib/metadata-utils';
import { Metadata } from 'next';

const toolName = "Christmas Countdown 2026";
const toolDescription = "Free Christmas countdown timer. See exactly how many days, hours, minutes, and seconds until Christmas 2026. Real-time countdown with festive design.";
const toolPath = "/christmas-countdown";

export const metadata: Metadata = generateToolMetadata({
  title: toolName,
  description: toolDescription,
  path: toolPath,
  keywords: [
    "christmas countdown",
    "days until christmas",
    "christmas timer",
    "christmas 2026",
    "holiday countdown",
    "christmas counter",
    "time until christmas",
  ],
  category: "Timers",
});

export default function ChristmasCountdownLayout({
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
