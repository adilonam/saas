import { postOpenAiTextTool, pickText } from "@/lib/openai-text-tool";

const SYSTEM_PROMPT = `You generate SQL queries from natural language.

Rules:
- Prefer standard SQL (ANSI-style) unless the user specifies a dialect (e.g. PostgreSQL, MySQL).
- Use clear table and column names from the user's schema when provided; if schema is missing, state reasonable assumptions in a brief comment above the SQL only when necessary.
- Return ONLY: a short comment block if needed, then the SQL. No tutorial prose.`;

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

export async function POST(request: Request) {
  return postOpenAiTextTool(request, {
    systemPrompt: SYSTEM_PROMPT,
    getUserMessage: (body) => {
      const q = pickText(body, "question");
      if (!q) return null;
      const schema = str(body.schema).trim();
      if (schema) {
        return `Schema / table definitions:\n${schema}\n\nQuestion:\n${q}`;
      }
      return q;
    },
    emptyError: "Please describe what the query should do.",
    maxTokens: 1200,
    logLabel: "sql-query-generator",
  });
}
