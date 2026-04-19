import { postOpenAiTextTool, pickText } from "@/lib/openai-text-tool";

const SYSTEM_PROMPT = `You write one short motivational focus quote for a personal dashboard (max 220 characters), no quote marks around the whole string, no hashtags, no emojis unless the user asks.

If the user gives a theme, match it gently. If empty, pick a calm productivity theme. Return ONLY the quote text.`;

export async function POST(request: Request) {
  return postOpenAiTextTool(request, {
    systemPrompt: SYSTEM_PROMPT,
    getUserMessage: (body) => {
      const theme = pickText(body, "theme");
      return theme ? `Theme: ${theme}` : "Theme: calm, sustainable focus for a workday.";
    },
    emptyError: "Invalid request body.",
    maxTokens: 120,
    logLabel: "focus-quote",
  });
}
