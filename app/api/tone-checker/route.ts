import { postOpenAiTextTool, pickText } from "@/lib/openai-text-tool";

const SYSTEM_PROMPT = `You review workplace message tone for email or Slack.

Return plain text with these sections (use the headings exactly):
Summary: (one sentence)
Tone: (e.g. direct, warm, rushed, formal — short phrase)
Risks: (bulleted lines if any — misreads, friction, ambiguity)
Suggestions: (2–5 short bullet lines to improve clarity or tone)

Rules:
- Be constructive, not preachy.
- If the message is fine, say so briefly in Risks.
- Adapt advice to the channel (Slack can be shorter; email may need more context).`;

function getUserMessage(body: Record<string, unknown>): string | null {
  const text = pickText(body, "text");
  if (!text) return null;
  const ch = typeof body.channel === "string" ? body.channel.trim() : "email";
  const channel = ch.toLowerCase() === "slack" ? "Slack" : "Email";
  return `Channel: ${channel}\n\n---\n${text}\n---`;
}

export async function POST(request: Request) {
  return postOpenAiTextTool(request, {
    systemPrompt: SYSTEM_PROMPT,
    getUserMessage,
    emptyError: "Please paste a message to review.",
    maxTokens: 900,
    logLabel: "tone-checker",
  });
}
