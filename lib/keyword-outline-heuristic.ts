/** Fast non-AI outline from keyword list (complement to AI outline). */
export function heuristicKeywordOutline(raw: string): string {
  const keywords = raw
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (keywords.length === 0) return "";

  const head = keywords.slice(0, 4).join(" · ");
  const lines: string[] = [
    `## Working title ideas`,
    `- What ${keywords[0]} means for your readers (2026 update)`,
    `- ${head}: a practical guide`,
    ``,
    `## Introduction`,
    `- Search intent: answer the main question in one paragraph`,
    `- Who this is for + what they can do after reading`,
    ``,
  ];

  const main = keywords.slice(0, 8);
  lines.push(`## Core sections`);
  for (const k of main) {
    lines.push(`### ${k}`);
    lines.push(`- Definition or frame`);
    lines.push(`- Common mistakes`);
    lines.push(`- Actionable checklist`);
    lines.push(``);
  }

  lines.push(`## FAQ`);
  lines.push(`- Pull 3–5 real questions from “People also ask” style prompts around: ${keywords.slice(0, 3).join(", ")}`);
  lines.push(``);
  lines.push(`## Conclusion + CTA`);
  lines.push(`- Summarize decisions; link to a deeper resource or tool`);

  return lines.join("\n");
}
