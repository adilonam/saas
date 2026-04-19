import { postOpenAiTextTool, pickText } from "@/lib/openai-text-tool";

const SYSTEM_PROMPT = `You suggest additional .gitignore lines for a repository.

Rules:
- Output ONLY plain .gitignore lines (patterns, comments with #). No markdown fences, no prose before or after.
- Do not repeat patterns the user already has.
- Prefer widely used, safe patterns for the described stack.
- If nothing useful to add, output a single comment line: # (no additional patterns suggested)`;

export async function POST(request: Request) {
  return postOpenAiTextTool(request, {
    systemPrompt: SYSTEM_PROMPT,
    getUserMessage: (body) => {
      const stack = pickText(body, "stack") ?? "";
      const existing = pickText(body, "existing") ?? "";
      if (!stack.trim()) return null;
      return `Tech stack / context:\n${stack.trim()}\n\nCurrent .gitignore (may be empty):\n${existing.trim() || "(empty)"}`;
    },
    emptyError: "Describe your stack (e.g. Node + Prisma + Docker).",
    maxTokens: 1200,
    logLabel: "gitignore-ai-suggest",
  });
}
