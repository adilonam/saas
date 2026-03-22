import { postOpenAiTextTool, pickText } from "@/lib/openai-text-tool";

const SYSTEM_PROMPT = `You write strong headlines for articles, landing pages, and emails.

Rules:
- Offer 8–12 distinct headline options.
- Number them 1., 2., etc.
- Mix styles: benefit-led, curiosity, specific numbers, how-to.
- Keep them honest — no clickbait that misrepresents the content.
- Base headlines only on the topic or draft the user provides.`;

export async function POST(request: Request) {
  return postOpenAiTextTool(request, {
    systemPrompt: SYSTEM_PROMPT,
    getUserMessage: (body) => pickText(body, "text"),
    emptyError: "Please describe the topic or paste a draft headline.",
    maxTokens: 900,
    logLabel: "headline-improver",
  });
}
