import { generateToolMetadata, generateJsonLd } from '@/lib/metadata-utils';
import { Metadata } from 'next';

const toolName = "Sign PDF Online";
const toolDescription = "Free online PDF signature tool. Add digital signatures to PDF documents directly in your browser. Sign PDFs without uploading to servers. Fast, secure, and easy PDF signing.";
const toolPath = "/sign-pdf";

export const metadata: Metadata = generateToolMetadata({
  title: toolName,
  description: toolDescription,
  path: toolPath,
  keywords: [
    "sign pdf",
    "pdf signature",
    "digital signature",
    "e-signature",
    "sign pdf online",
    "pdf signer",
    "electronic signature",
  ],
  category: "PDF Tools",
});

export default function SignPdfLayout({
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
