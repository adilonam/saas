import { generateToolMetadata, generateJsonLd } from '@/lib/metadata-utils';
import { Metadata } from 'next';

const toolName = "Secret Santa Generator";
const toolDescription = "Free Secret Santa generator with exclusions. Randomly assign gift exchange pairs for your holiday party. Set budget limits and exclusions for couples. Completely private - no data stored.";
const toolPath = "/secret-santa-generator";

export const metadata: Metadata = generateToolMetadata({
  title: toolName,
  description: toolDescription,
  path: toolPath,
  keywords: [
    "secret santa generator",
    "secret santa",
    "gift exchange generator",
    "random name picker",
    "secret santa with exclusions",
    "holiday gift exchange",
    "secret santa organizer",
    "christmas gift exchange",
  ],
  category: "Generators",
});

export default function SecretSantaLayout({
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
