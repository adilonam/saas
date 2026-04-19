"use client";

import AiTextToolPage from "@/components/AiTextToolPage";

export default function MeetingNotesActionPlanPage() {
  return (
    <AiTextToolPage
      title="Meeting Notes to Action Plan"
      description="Paste meeting notes and turn them into a structured action plan with owners, priorities, and next steps."
      apiPath="/api/meeting-notes-action-plan"
      inputLabel="Meeting notes"
      placeholder="Paste meeting notes, transcript highlights, decisions, and open items..."
      submitLabel="Generate action plan"
      textareaMinHeightClass="min-h-[180px]"
      buildBody={(text) => ({ prompt: text })}
    />
  );
}
