import { generateToolMetadata, generateJsonLd } from '@/lib/metadata-utils';
import { Metadata } from 'next';

const toolName = "YouTube Title Length Checker (Free)";
const toolDescription = "Free YouTube title length checker. Count characters and emoji against YouTube's 100-character title limit so your titles display correctly in search and recommendations.";
const toolPath = "/youtube-title-length-checker";

export const metadata: Metadata = generateToolMetadata({
  title: toolName,
  description: toolDescription,
  path: toolPath,
  keywords: [
    "youtube title length checker",
    "youtube title length",
    "youtube character counter",
    "youtube title checker",
    "video title length",
    "youtube seo",
    "title character limit",
    "youtube title limit",
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
