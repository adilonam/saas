"use client";

import PdfTextWorkbench from "@/components/tools/PdfTextWorkbench";

export default function PdfActionItemsPage() {
  return (
    <PdfTextWorkbench
      pagePath="/pdf-action-items"
      title="PDF Action Items Extractor"
      description="Extract actionable tasks, owners, and due dates from your PDF."
      actionLabel="Extract action items"
      task="action_items"
    />
  );
}
