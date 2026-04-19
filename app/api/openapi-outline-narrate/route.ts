import { postOpenAiTextTool, pickText } from "@/lib/openai-text-tool";

const SYSTEM_PROMPT = `You turn a structural OpenAPI outline into a short human-readable overview for engineers.

Rules:
- Use clear markdown with short sections (Overview, Main resources, Auth / errors if inferable, Testing tips).
- Do not invent endpoints that are not implied by the outline.
- Stay under 250 words unless the outline is huge.
- No conversational filler.`;

export async function POST(request: Request) {
  return postOpenAiTextTool(request, {
    systemPrompt: SYSTEM_PROMPT,
    getUserMessage: (body) => {
      const outline = pickText(body, "outline");
      if (!outline?.trim()) return null;
      return `OpenAPI outline:\n\n${outline.trim()}`;
    },
    emptyError: "Outline text is required.",
    maxTokens: 1024,
    logLabel: "openapi-outline-narrate",
  });
}
