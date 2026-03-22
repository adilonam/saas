import { postOpenAiTextTool, pickPrompt, pickText } from "@/lib/openai-text-tool";

const SYSTEM_PROMPT = `You write short, personalized cold email drafts for B2B or professional outreach.

Rules:
- Keep the email concise: subject line on first line as "Subject: ...", then blank line, then body under ~150 words unless the user asks otherwise.
- Sound human, specific, and respectful — no manipulation tactics.
- Do not invent company facts; use only what the user provides.
- Return ONLY the email (subject + body).`;

export async function POST(request: Request) {
  return postOpenAiTextTool(request, {
    systemPrompt: SYSTEM_PROMPT,
    getUserMessage: (body) => pickPrompt(body) || pickText(body, "text"),
    emptyError: "Please describe your offer, audience, and goal.",
    maxTokens: 900,
    logLabel: "cold-email-generator",
  });
}
