import { postOpenAiTextTool, pickPrompt } from "@/lib/openai-text-tool";

const SYSTEM_PROMPT = `You are a goal planning assistant.
Break a goal into an actionable plan.

Return markdown with:
- Goal statement (refined)
- Milestones (ordered)
- Tasks per milestone
- Suggested timeline
- Dependencies
- First 3 actions to start today

Use short bullet points and realistic sequencing.`;

export async function POST(request: Request) {
  return postOpenAiTextTool(request, {
    systemPrompt: SYSTEM_PROMPT,
    getUserMessage: pickPrompt,
    emptyError: "Goal details are required",
    maxTokens: 1100,
    logLabel: "goal-breakdown-planner",
  });
}
