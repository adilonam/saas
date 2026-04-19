import { postOpenAiTextTool, pickText } from "@/lib/openai-text-tool";

const SYSTEM_PROMPT = `You suggest better variable or function names for code.

Rules:
- Respect the programming language's naming conventions (camelCase, snake_case, PascalCase as appropriate).
- Return a numbered list of 5–8 alternatives, strongest first, each on its own line.
- Very short optional note in parentheses only if needed for disambiguation.
- No markdown headings, no preamble or closing filler.`;

export async function POST(request: Request) {
  return postOpenAiTextTool(request, {
    systemPrompt: SYSTEM_PROMPT,
    getUserMessage: (body) => {
      const name = pickText(body, "name");
      const lang = typeof body.language === "string" && body.language.trim() ? body.language.trim() : "TypeScript";
      const context = pickText(body, "context");
      if (!name) return null;
      let msg = `Language: ${lang}\nIdentifier to improve: ${name}`;
      if (context) msg += `\n\nContext (optional code or description):\n${context}`;
      return msg;
    },
    emptyError: "Enter the variable or function name.",
    maxTokens: 600,
    logLabel: "variable-renamer-suggestions",
  });
}
