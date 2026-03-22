import { postOpenAiTextTool, pickText } from "@/lib/openai-text-tool";

const SYSTEM_PROMPT = `You generate regular expressions from plain-English descriptions.

Rules:
- State the assumed flavor (JavaScript, PCRE, etc.) in one line if not specified; default to JavaScript.
- Give the pattern on its own line in backticks.
- Add a brief explanation of each main part on following lines.
- If multiple valid patterns exist, give one primary pattern and optionally one simpler alternative.
- Return ONLY the explanation and patterns — no moralizing.`;

export async function POST(request: Request) {
  return postOpenAiTextTool(request, {
    systemPrompt: SYSTEM_PROMPT,
    getUserMessage: (body) => pickText(body, "text"),
    emptyError: "Please describe what the regex should match.",
    maxTokens: 800,
    logLabel: "regex-generator",
  });
}
