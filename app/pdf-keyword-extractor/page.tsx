"use client";

import PdfTextWorkbench from "@/components/tools/PdfTextWorkbench";

export default function PdfKeywordExtractorPage() {
  return (
    <PdfTextWorkbench
      pagePath="/pdf-keyword-extractor"
      title="PDF Keyword Extractor"
      description="Upload a PDF and extract the most relevant keywords and phrases."
      actionLabel="Extract keywords"
      task="keywords"
    />
  );
}
