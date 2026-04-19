"use client";

import AiTextToolPage from "@/components/AiTextToolPage";

export default function ProsConsAnalyzerPage() {
  return (
    <AiTextToolPage
      title="Pros and Cons Analyzer"
      description="Analyze a decision with structured pros, cons, assumptions, and a recommendation."
      apiPath="/api/pros-cons-analyzer"
      inputLabel="Decision context"
      placeholder="Describe the decision, options you are considering, constraints, and what success looks like..."
      submitLabel="Analyze decision"
      textareaMinHeightClass="min-h-[180px]"
      buildBody={(text) => ({ prompt: text })}
    />
  );
}
