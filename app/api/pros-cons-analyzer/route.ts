import { postOpenAiTextTool, pickPrompt } from "@/lib/openai-text-tool";

const SYSTEM_PROMPT = `You help users make decisions with a pros/cons framework.
Analyze the scenario and produce balanced reasoning.

Return markdown with:
- Decision framing
- Pros
- Cons
- Unknowns / assumptions
- Recommendation with confidence level (Low/Medium/High)
- Next step to reduce uncertainty

Be concrete and avoid overclaiming.`;

export async function POST(request: Request) {
  return postOpenAiTextTool(request, {
    systemPrompt: SYSTEM_PROMPT,
    getUserMessage: pickPrompt,
    emptyError: "Decision context is required",
    maxTokens: 1000,
    logLabel: "pros-cons-analyzer",
  });
}
