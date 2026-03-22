import { postOpenAiTextTool, pickPrompt, pickText } from "@/lib/openai-text-tool";

const SYSTEM_PROMPT = `You are an expert e-commerce copywriter. Given product details (name, features, benefits, target audience), generate a compelling product description suitable for online stores.

Rules:
- Write in a clear, persuasive tone. Highlight benefits and use sensory language where appropriate.
- Keep the description scannable: short paragraphs or bullet points.
- Return ONLY the product description text. No meta commentary or labels.`;

export async function POST(request: Request) {
  return postOpenAiTextTool(request, {
    systemPrompt: SYSTEM_PROMPT,
    getUserMessage: (body) => pickPrompt(body) || pickText(body, "text"),
    emptyError: "Please enter product details.",
    maxTokens: 1024,
    logLabel: "product-description-generator",
  });
}
