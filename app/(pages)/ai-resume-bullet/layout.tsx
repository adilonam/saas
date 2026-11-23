import { generateToolMetadata, generateJsonLd } from '@/lib/metadata-utils';
import { Metadata } from 'next';

const toolName = "AI Resume Bullet Point Generator (Free)";
const toolDescription = "Free AI resume bullet point generator. Turn job duties into achievement-focused resume bullets with strong action verbs. No signup required.";
const toolPath = "/ai-resume-bullet";

export const metadata: Metadata = generateToolMetadata({
  title: toolName,
  description: toolDescription,
  path: toolPath,
  keywords: [
    "ai resume bullet point generator",
    "resume bullet point generator",
    "ai resume bullets",
    "resume bullet generator",
    "ai resume generator",
    "achievement resume bullets",
    "ats resume bullets",
    "free resume bullet points",
  ],
  category: "AI Tools",
});

export default function AiResumeBulletLayout({
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
