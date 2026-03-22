import { postOpenAiTextTool, pickText } from "@/lib/openai-text-tool";

const SYSTEM_PROMPT = `You are an expert at concise summaries. Summarize the user's text clearly.

Rules:
- Preserve key facts, numbers, and names.
- Use short paragraphs or bullet points when it improves clarity.
- Do not add opinions or information not present in the text.
- Return ONLY the summary. No preamble or meta commentary.`;

export async function POST(request: Request) {
  return postOpenAiTextTool(request, {
    systemPrompt: SYSTEM_PROMPT,
    getUserMessage: (body) => pickText(body, "text"),
    emptyError: "Please provide text to summarize.",
    maxTokens: 1200,
    logLabel: "text-summarizer",
  });
}
