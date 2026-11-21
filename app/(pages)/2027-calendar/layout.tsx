import { generateToolMetadata, generateJsonLd } from '@/lib/metadata-utils';
import { Metadata } from 'next';

const toolName = "2027 Calendar";
const toolDescription = "Free printable 2027 calendar. View full year or individual months. Print-friendly layouts for planning, scheduling, and organization. Downloadable PDF calendar for 2027.";
const toolPath = "/2027-calendar";

export const metadata: Metadata = generateToolMetadata({
  title: toolName,
  description: toolDescription,
  path: toolPath,
  keywords: [
    "2027 calendar",
    "printable calendar",
    "2027 calendar pdf",
    "yearly calendar",
    "monthly calendar 2027",
    "calendar planner",
    "free calendar",
    "calendar download",
  ],
  category: "Planners",
});

export default function Calendar2027Layout({
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
