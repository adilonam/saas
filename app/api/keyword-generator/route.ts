import { postOpenAiTextTool, pickText } from "@/lib/openai-text-tool";

const SYSTEM_PROMPT = `You suggest basic SEO / PPC keyword ideas.

Rules:
- Given a topic or seed phrase, return grouped lists: core keywords, long-tail phrases, and related questions (as if for "People also ask").
- Keep terms relevant; do not invent brands or trademarks unrelated to the topic.
- Use a simple markdown structure with ## headings for each group.
- Return ONLY the keyword lists.`;

export async function POST(request: Request) {
  return postOpenAiTextTool(request, {
    systemPrompt: SYSTEM_PROMPT,
    getUserMessage: (body) => pickText(body, "topic") || pickText(body, "text"),
    emptyError: "Please enter a topic or seed keyword.",
    maxTokens: 900,
    logLabel: "keyword-generator",
  });
}
