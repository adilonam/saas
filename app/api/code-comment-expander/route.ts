import { postOpenAiTextTool, pickText } from "@/lib/openai-text-tool";

const SYSTEM_PROMPT = `You expand a one-line code comment into a helpful block comment for developers.

Rules:
- Match the comment style for the language (e.g. // for JS/TS, # for Python, /* */ for CSS).
- Stay accurate to the intent of the one-liner; do not invent behavior not implied by the user.
- Prefer 2–6 short lines in the block unless the user asks for more detail.
- Return only the comment block — no markdown, no explanation outside the comment.`;

export async function POST(request: Request) {
  return postOpenAiTextTool(request, {
    systemPrompt: SYSTEM_PROMPT,
    getUserMessage: (body) => {
      const line = pickText(body, "line");
      const lang = typeof body.language === "string" && body.language.trim() ? body.language.trim() : "TypeScript";
      if (!line) return null;
      return `Language: ${lang}\n\nOne-liner to expand:\n${line}`;
    },
    emptyError: "Enter the one-line comment to expand.",
    maxTokens: 800,
    logLabel: "code-comment-expander",
  });
}
