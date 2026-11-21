import { generateToolMetadata, generateJsonLd } from '@/lib/metadata-utils';
import { Metadata } from 'next';

const toolName = "Secure File & Text Share";
const toolDescription = "Free encrypted file and text sharing. Send files and messages peer-to-peer with end-to-end encryption. No uploads, no storage - completely private and secure sharing via 6-digit room codes.";
const toolPath = "/share";

export const metadata: Metadata = generateToolMetadata({
  title: toolName,
  description: toolDescription,
  path: toolPath,
  keywords: [
    "secure file share",
    "encrypted file transfer",
    "p2p file sharing",
    "private file share",
    "end-to-end encryption",
    "secure text share",
    "webrtc file transfer",
    "anonymous file sharing",
  ],
  category: "File Tools",
});

export default function ShareLayout({
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
