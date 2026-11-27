import { generateToolMetadata, generateJsonLd } from '@/lib/metadata-utils';
import { Metadata } from 'next';

const toolName = "Resume Bullet Point Generator (Free AI)";
const toolDescription = "Free AI resume bullet point generator. Turn job duties into achievement-focused resume bullets with action verbs, results, and STAR-style structure. No signup.";
const toolPath = "/ai-resume-bullet";

export const metadata: Metadata = generateToolMetadata({
  title: toolName,
  description: toolDescription,
  path: toolPath,
  keywords: [
    "resume bullet point generator",
    "resume bullet points generator",
    "ai resume bullet point generator",
    "resume bullet point generator ai free",
    "resume bullet generator",
    "ai resume bullets",
    "how to write resume bullet points",
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
