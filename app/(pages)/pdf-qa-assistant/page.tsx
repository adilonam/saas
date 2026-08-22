"use client";

import PdfTextWorkbench from "@/components/tools/PdfTextWorkbench";

export default function PdfQaAssistantPage() {
  return (
    <PdfTextWorkbench
      pagePath="/pdf-qa-assistant"
      title="PDF Q&A Assistant"
      description="Ask a question about your uploaded PDF and get an answer from extracted text."
      actionLabel="Answer question"
      task="qa"
      extraPromptLabel="Your question"
      extraPromptPlaceholder="e.g. What are the key risks mentioned in section 2?"
    />
  );
}
