import { generateToolMetadata, generateJsonLd } from '@/lib/metadata-utils';
import { Metadata } from 'next';

const toolName = "AI Email Subject Line Generator (Free)";
const toolDescription = "Free AI email subject line generator. Get concise subject line ideas for newsletters, product launches, and outreach—no signup required.";
const toolPath = "/ai-email-subject-line";

export const metadata: Metadata = generateToolMetadata({
  title: toolName,
  description: toolDescription,
  path: toolPath,
  keywords: [
    "ai email subject line generator",
    "ai subject line generator",
    "email subject line generator ai",
    "subject line generator ai",
    "email subject line generator",
    "ai email subject",
    "catchy subject lines",
    "newsletter subject line generator",
  ],
  category: "AI Tools",
});

export default function AiEmailSubjectLineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = generateJsonLd({
    name: toolName,
    description: toolDescription,
    url: `https://www.eprod.io${toolPath}`,
    applicationCategory: "BusinessApplication",
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
