import { postOpenAiTextTool, pickText } from "@/lib/openai-text-tool";

const SYSTEM_PROMPT = `You are a reading-level coach. The user message contains their text plus computed heuristics (word count, sentence length, Flesch Reading Ease if available).

Rules:
- In 6–10 short bullets, explain what the metrics imply for a general audience.
- Give 3–5 concrete edits (examples) to make the text easier to read without changing meaning.
- Note limitations of automated scores.
- Use markdown. No greeting.`;

export async function POST(request: Request) {
  return postOpenAiTextTool(request, {
    systemPrompt: SYSTEM_PROMPT,
    getUserMessage: (body) => {
      const text = pickText(body, "text");
      if (!text) return null;
      const stats = typeof body.stats === "string" ? body.stats.trim() : "";
      return stats ? `Heuristics:\n${stats}\n\nText:\n${text}` : text;
    },
    emptyError: "Please enter text to analyze.",
    maxTokens: 900,
    logLabel: "reading-level-coach",
  });
}
