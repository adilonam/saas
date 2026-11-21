import { generateToolMetadata, generateJsonLd } from '@/lib/metadata-utils';
import { Metadata } from 'next';

const toolName = "YouTube Title Length Checker";
const toolDescription = "Free YouTube title length checker. Count characters including emoji against YouTube's 100-character title limit. Ensure your video titles display properly in search results and recommendations.";
const toolPath = "/youtube-title-length-checker";

export const metadata: Metadata = generateToolMetadata({
  title: toolName,
  description: toolDescription,
  path: toolPath,
  keywords: [
    "youtube title length",
    "youtube character counter",
    "youtube title checker",
    "video title length",
    "youtube seo",
    "title character limit",
    "youtube optimization",
  ],
  category: "YouTube Tools",
});

export default function YouTubeTitleLengthCheckerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = generateJsonLd({
    name: toolName,
    description: toolDescription,
    url: `https://www.eprod.io${toolPath}`,
    applicationCategory: "MultimediaApplication",
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
