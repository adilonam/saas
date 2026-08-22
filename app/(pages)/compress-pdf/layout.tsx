import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compress PDF Online – Reduce PDF File Size | eProd",
  description:
    "Compress PDF files online for free. Shrink large PDFs with Ghostscript-quality settings (screen, ebook, printer, prepress) and download the optimized result instantly.",
  alternates: {
    canonical: "https://www.eprod.io/compress-pdf",
  },
  openGraph: {
    title: "Compress PDF Online – Reduce PDF File Size",
    description:
      "Upload a PDF, choose a Ghostscript quality preset, and download a smaller, optimized PDF in seconds.",
    url: "https://www.eprod.io/compress-pdf",
    type: "website",
  },
};

export default function CompressPDFLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
