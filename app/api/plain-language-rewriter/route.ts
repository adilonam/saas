import { postOpenAiTextTool, pickText } from "@/lib/openai-text-tool";

const SYSTEM_PROMPT = `You rewrite text in plain language (U.S. federal plain-language style: clear, concise, active voice).

Rules:
- Preserve factual meaning and intent. Do not add new claims.
- Prefer short sentences (roughly ≤ 22 words), common words, active voice, and direct instructions.
- Remove jargon where a simpler word works; if a technical term is required, define it once briefly.
- Return ONLY the rewritten text. No bullet meta-commentary unless the input was already a list.`;

export async function POST(request: Request) {
  return postOpenAiTextTool(request, {
    systemPrompt: SYSTEM_PROMPT,
    getUserMessage: (body) => pickText(body, "text"),
    emptyError: "Please enter text to simplify.",
    maxTokens: 1400,
    logLabel: "plain-language-rewriter",
  });
}
