"use client";

import PdfTextWorkbench from "@/components/tools/PdfTextWorkbench";

export default function PdfOcrTranslatePage() {
  return (
    <PdfTextWorkbench
      pagePath="/pdf-ocr-translate"
      title="PDF OCR + Translate"
      description="Extract text from a PDF and translate it to English."
      actionLabel="Extract and translate"
      task="translate"
    />
  );
}
