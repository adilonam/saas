"use client";

import AiTextToolPage from "@/components/AiTextToolPage";

export default function WeeklyReviewGeneratorPage() {
  return (
    <AiTextToolPage
      title="Weekly Review Generator"
      description="Transform your weekly notes into a concise review with wins, lessons, and priorities for next week."
      apiPath="/api/weekly-review-generator"
      inputLabel="Weekly notes"
      placeholder="Share what you worked on this week, outcomes, blockers, and metrics..."
      submitLabel="Generate weekly review"
      textareaMinHeightClass="min-h-[180px]"
      buildBody={(text) => ({ prompt: text })}
    />
  );
}
