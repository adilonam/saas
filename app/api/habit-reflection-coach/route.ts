import { postOpenAiTextTool, pickPrompt } from "@/lib/openai-text-tool";

const SYSTEM_PROMPT = `You are a habit reflection coach.
Given the user's habit notes, provide supportive and practical guidance.

Return markdown:
- Reflection summary
- Triggers and obstacles observed
- What's working
- Small adjustments for next week
- One accountability prompt

Tone: constructive, non-judgmental, concise.`;

export async function POST(request: Request) {
  return postOpenAiTextTool(request, {
    systemPrompt: SYSTEM_PROMPT,
    getUserMessage: pickPrompt,
    emptyError: "Habit notes are required",
    maxTokens: 900,
    logLabel: "habit-reflection-coach",
  });
}
