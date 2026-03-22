import { postOpenAiTextTool, pickText } from "@/lib/openai-text-tool";

const SYSTEM_PROMPT = `You polish professional emails.

Rules:
- Fix grammar, tone, and structure; keep the user's intent and facts.
- Keep appropriate formality unless the draft is clearly casual.
- Do not add fabricated details (names, dates, offers).
- Return ONLY the polished email body (no "Here is your email" wrapper).`;

export async function POST(request: Request) {
  return postOpenAiTextTool(request, {
    systemPrompt: SYSTEM_PROMPT,
    getUserMessage: (body) => pickText(body, "text"),
    emptyError: "Please paste the email draft to polish.",
    maxTokens: 1200,
    logLabel: "email-polisher",
  });
}
