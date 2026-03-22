import { postOpenAiTextTool, pickText } from "@/lib/openai-text-tool";

const SYSTEM_PROMPT = `You are an editor. Rewrite the user's sentences for clarity and flow while preserving meaning.

Rules:
- Keep the same intent and facts.
- If a tone is specified, match it (e.g. formal, casual, persuasive).
- Return ONLY the rewritten text. No labels or explanations.`;

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

export async function POST(request: Request) {
  return postOpenAiTextTool(request, {
    systemPrompt: SYSTEM_PROMPT,
    getUserMessage: (body) => {
      const t = pickText(body, "text");
      if (!t) return null;
      const tone = str(body.tone).trim();
      if (tone) {
        return `Desired tone: ${tone}\n\nText:\n${t}`;
      }
      return t;
    },
    emptyError: "Please provide text to rewrite.",
    maxTokens: 1200,
    logLabel: "sentence-rewriter",
  });
}
