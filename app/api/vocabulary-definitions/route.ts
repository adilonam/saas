import { postOpenAiTextTool } from "@/lib/openai-text-tool";

const SYSTEM_PROMPT = `You write short learner-friendly dictionary definitions (one line each, max ~18 words).

Rules:
- Return ONLY valid JSON: an object "definitions" whose keys are the exact words provided and values are definition strings.
- Do not include keys for words you were not given.
- If a word is a proper noun or unclear, give a brief factual gloss.
- No markdown inside strings; plain text only.`;

export async function POST(request: Request) {
  return postOpenAiTextTool(request, {
    systemPrompt: SYSTEM_PROMPT,
    getUserMessage: (body) => {
      const raw = body.words;
      if (!Array.isArray(raw)) return null;
      const words = raw
        .filter((w): w is string => typeof w === "string")
        .map((w) => w.trim())
        .filter(Boolean)
        .slice(0, 28);
      if (words.length === 0) return null;
      return `Words (JSON array):\n${JSON.stringify(words)}`;
    },
    emptyError: "Provide a non-empty words array.",
    maxTokens: 1400,
    logLabel: "vocabulary-definitions",
    responseFormat: "json_object",
  });
}
