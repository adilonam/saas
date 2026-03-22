import { postOpenAiTextTool, pickText } from "@/lib/openai-text-tool";

const SYSTEM_PROMPT = `You create blog post outlines.

Rules:
- Use markdown: H2-style titles with ##, subsections with ###.
- Include intro hook, main sections, and conclusion CTA suggestions.
- Tailor depth to the topic (roughly 5–10 sections unless the topic is trivial).
- Return ONLY the outline.`;

export async function POST(request: Request) {
  return postOpenAiTextTool(request, {
    systemPrompt: SYSTEM_PROMPT,
    getUserMessage: (body) => pickText(body, "topic") || pickText(body, "text"),
    emptyError: "Please enter a topic or working title.",
    maxTokens: 1400,
    logLabel: "blog-outline-generator",
  });
}
