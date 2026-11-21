import { generateToolMetadata, generateJsonLd } from '@/lib/metadata-utils';
import { Metadata } from 'next';

const toolName = "Resume Bullet Point Generator – AI (Free)";
const toolDescription = "Free AI resume bullet point generator. Transform job descriptions into impactful resume bullet points using AI. Create achievement-focused resume content that stands out to recruiters and ATS systems.";
const toolPath = "/ai-resume-bullet";

export const metadata: Metadata = generateToolMetadata({
  title: toolName,
  description: toolDescription,
  path: toolPath,
  keywords: [
    "resume bullet points",
    "ai resume generator",
    "resume writing",
    "resume bullet generator",
    "job description",
    "resume builder",
    "ats resume",
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
