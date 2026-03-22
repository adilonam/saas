"use client";

import AiTextToolPage from "components/AiTextToolPage";

export default function TextSummarizerPage() {
  return (
    <AiTextToolPage
      title="Text Summarizer"
      description="Paste any text and get a concise summary that keeps key facts and structure."
      apiPath="/api/text-summarizer"
      inputLabel="Text to summarize"
      placeholder="Paste article, notes, or document text…"
      submitLabel="Summarize"
      buildBody={(t) => ({ text: t })}
      textareaMinHeightClass="min-h-[200px]"
    />
  );
}
