import { postOpenAiTextTool, pickText } from "@/lib/openai-text-tool";

const SYSTEM_PROMPT = `You polish release notes for a software product.

Rules:
- Keep technical facts accurate; do not invent features or fixes.
- Improve clarity, tone, and scannability (short bullets, consistent voice).
- Return polished release notes only — no preamble or closing filler.`;

export async function POST(request: Request) {
  return postOpenAiTextTool(request, {
    systemPrompt: SYSTEM_PROMPT,
    getUserMessage: (body) => {
      const notes = pickText(body, "text");
      const tone = typeof body.tone === "string" && body.tone.trim() ? body.tone.trim() : "clear and professional";
      if (!notes) return null;
      return `Desired tone: ${tone}\n\nRelease notes to polish:\n\n${notes}`;
    },
    emptyError: "Paste release notes to polish.",
    maxTokens: 2000,
    logLabel: "release-notes-polisher",
  });
}
