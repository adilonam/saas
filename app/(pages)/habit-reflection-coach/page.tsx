"use client";

import AiTextToolPage from "@/components/AiTextToolPage";

export default function HabitReflectionCoachPage() {
  return (
    <AiTextToolPage
      title="Habit Reflection Coach"
      description="Reflect on your habit progress and get practical adjustments for the coming week."
      apiPath="/api/habit-reflection-coach"
      inputLabel="Habit reflection notes"
      placeholder="Describe your target habit, consistency this week, triggers, obstacles, and what felt easy or hard..."
      submitLabel="Get reflection coaching"
      textareaMinHeightClass="min-h-[180px]"
      buildBody={(text) => ({ prompt: text })}
    />
  );
}
