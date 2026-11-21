import { generateToolMetadata, generateJsonLd } from '@/lib/metadata-utils';
import { Metadata } from 'next';

const toolName = "Merge PDF Online";
const toolDescription = "Free PDF merger tool. Combine multiple PDF files into one document online. Merge PDFs in any order quickly and securely in your browser. No file size limits.";
const toolPath = "/merge-pdf";

export const metadata: Metadata = generateToolMetadata({
  title: toolName,
  description: toolDescription,
  path: toolPath,
  keywords: [
    "merge pdf",
    "combine pdf",
    "pdf merger",
    "join pdf",
    "merge pdf online",
    "pdf combiner",
    "pdf joiner",
  ],
  category: "PDF Tools",
});

export default function MergePdfLayout({
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
