/**
 * Read-only tidy-up for pasted EXPLAIN output (Postgres-style tables or plain text).
 */
export function formatExplainPlan(text: string): string {
  const normalized = text.replace(/\r\n/g, "\n").trim();
  if (!normalized) return "";

  const lines = normalized.split("\n");
  const hasTable = lines.some((l) => l.includes("|"));

  if (hasTable) {
    return lines
      .map((l) => l.replace(/\s*\|\s*/g, " | ").trimEnd())
      .join("\n")
      .replace(/\n{3,}/g, "\n\n");
  }

  return lines
    .map((l) => l.trimEnd())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n");
}
