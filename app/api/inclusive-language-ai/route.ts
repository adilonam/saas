import { postOpenAiTextTool, pickText } from "@/lib/openai-text-tool";

const SYSTEM_PROMPT = `You help writers use more inclusive, respectful language.

Rules:
- Read the user's draft. List only genuine issues (max 12). Skip nitpicks.
- For each issue: quote the shortest exact phrase, explain briefly why it may exclude or harm, and give 1–2 concrete rewrites.
- Prefer neutral, professional alternatives. Do not moralize or discuss politics unrelated to wording.
- If nothing meaningful stands out, say "No major inclusive-language issues detected." and optionally add one optional polish tip.
- Use markdown bullets. No preamble.`;

export async function POST(request: Request) {
  return postOpenAiTextTool(request, {
    systemPrompt: SYSTEM_PROMPT,
    getUserMessage: (body) => pickText(body, "text"),
    emptyError: "Please paste text to review.",
    maxTokens: 900,
    logLabel: "inclusive-language-ai",
  });
}
