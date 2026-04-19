import { postOpenAiTextTool, pickText } from "@/lib/openai-text-tool";

const SYSTEM_PROMPT = `You extract concrete action items from meeting notes or messy text.

Rules:
- Each item should start with an imperative verb when possible (e.g. "Send", "Review", "Schedule").
- Merge duplicates; keep items specific and assignable.
- Return ONLY valid JSON: { "items": string[] } with 1–40 items. Use [] if none found.
- Do not invent obligations not implied by the text.`;

export async function POST(request: Request) {
  return postOpenAiTextTool(request, {
    systemPrompt: SYSTEM_PROMPT,
    getUserMessage: (body) => pickText(body, "text"),
    emptyError: "Please paste notes to extract action items from.",
    maxTokens: 1200,
    logLabel: "action-items-extractor-ai",
    responseFormat: "json_object",
  });
}
