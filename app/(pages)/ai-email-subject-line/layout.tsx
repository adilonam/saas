import { generateToolMetadata, generateJsonLd } from '@/lib/metadata-utils';
import { Metadata } from 'next';

const toolName = "Email Subject Line Generator – AI-Powered (Free)";
const toolDescription = "Free AI-powered email subject line generator. Create compelling, high-converting email subject lines using artificial intelligence. Boost open rates with optimized subject lines for marketing emails.";
const toolPath = "/ai-email-subject-line";

export const metadata: Metadata = generateToolMetadata({
  title: toolName,
  description: toolDescription,
  path: toolPath,
  keywords: [
    "email subject line generator",
    "ai email subject",
    "email marketing",
    "subject line tool",
    "email subject generator",
    "catchy subject lines",
    "email open rate",
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
