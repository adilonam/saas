import { postOpenAiTextTool, pickText } from "@/lib/openai-text-tool";

const SYSTEM_PROMPT = `You extract clear bullet points from prose.

Rules:
- Each bullet should be one idea, concise, parallel structure where possible.
- Use a simple markdown bullet list (- item).
- Do not invent facts; only use what is in the source.
- Return ONLY the bullet list.`;

export async function POST(request: Request) {
  return postOpenAiTextTool(request, {
    systemPrompt: SYSTEM_PROMPT,
    getUserMessage: (body) => pickText(body, "text"),
    emptyError: "Please provide text to extract bullets from.",
    maxTokens: 1200,
    logLabel: "bullet-point-extractor",
  });
}
