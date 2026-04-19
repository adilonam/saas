import { postOpenAiTextTool, pickText } from "@/lib/openai-text-tool";

const SYSTEM_PROMPT = `You turn SEO-style keywords into a practical blog outline (not full article, no PDF).

Rules:
- Input may be comma- or line-separated keywords/phrases.
- Use markdown: ## section titles weaving the keywords naturally, ### sub-points where useful.
- Include: working title ideas (3), audience hook, H2 sections (5–8), FAQ ideas, and internal-link prompts.
- Return ONLY the outline.`;

export async function POST(request: Request) {
  return postOpenAiTextTool(request, {
    systemPrompt: SYSTEM_PROMPT,
    getUserMessage: (body) => pickText(body, "keywords") || pickText(body, "text"),
    emptyError: "Please enter keywords or phrases.",
    maxTokens: 1400,
    logLabel: "keyword-blog-outline",
  });
}
