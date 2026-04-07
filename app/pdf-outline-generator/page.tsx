"use client";

import PdfTextWorkbench from "@/components/tools/PdfTextWorkbench";

export default function PdfOutlineGeneratorPage() {
  return (
    <PdfTextWorkbench
      pagePath="/pdf-outline-generator"
      title="PDF Outline Generator"
      description="Generate a structured outline from your PDF content."
      actionLabel="Generate outline"
      task="outline"
    />
  );
}
