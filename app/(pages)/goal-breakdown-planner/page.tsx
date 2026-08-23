"use client";

import AiTextToolPage from "@/components/AiTextToolPage";

export default function GoalBreakdownPlannerPage() {
  return (
    <AiTextToolPage
      title="Goal Breakdown Planner"
      description="Convert a big goal into milestones, tasks, and a practical execution sequence."
      apiPath="/api/goal-breakdown-planner"
      inputLabel="Goal and context"
      placeholder="Describe your goal, timeline constraints, resources, and any blockers..."
      submitLabel="Break down goal"
      textareaMinHeightClass="min-h-[180px]"
      buildBody={(text) => ({ prompt: text })}
    />
  );
}
