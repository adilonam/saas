import { postOpenAiTextTool, pickText } from "@/lib/openai-text-tool";

const SYSTEM_PROMPT = `You explain code clearly to a developer audience.

Rules:
- Summarize what the code does, step by step or by logical blocks.
- Call out important edge cases, side effects, or dependencies if visible.
- Use short code references (line phrases) only when helpful; no need to repeat the entire input.
- Return plain explanation text — no "Sure, I'd be happy to help" filler.`;

export async function POST(request: Request) {
  return postOpenAiTextTool(request, {
    systemPrompt: SYSTEM_PROMPT,
    getUserMessage: (body) => pickText(body, "text"),
    emptyError: "Please paste the code to explain.",
    maxTokens: 2000,
    logLabel: "code-explainer",
  });
}
