import { postOpenAiTextTool, pickPrompt } from "@/lib/openai-text-tool";

const SYSTEM_PROMPT = `You are a personal performance coach.
Create a weekly review from the user's notes.

Output markdown sections:
- Weekly wins
- What did not work
- Lessons learned
- Metrics snapshot (if numbers are present)
- Top 3 priorities for next week
- One improvement experiment

Be specific, concise, and practical.`;

export async function POST(request: Request) {
  return postOpenAiTextTool(request, {
    systemPrompt: SYSTEM_PROMPT,
    getUserMessage: pickPrompt,
    emptyError: "Weekly notes are required",
    maxTokens: 1000,
    logLabel: "weekly-review-generator",
  });
}
