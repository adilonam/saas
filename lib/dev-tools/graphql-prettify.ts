const GQL_KEYWORDS = new Set([
  "query",
  "mutation",
  "subscription",
  "fragment",
  "on",
  "true",
  "false",
  "null",
  "and",
  "or",
  "not",
]);

export function heuristicGraphqlComplexity(source: string): {
  selectionLike: number;
  maxDepth: number;
  hint: string;
} {
  const noStr = source.replace(/"(?:\\.|[^"\\])*"/g, '""');
  const noBlock = noStr.replace(/#[^\n\r]*/g, "");
  const tokens = noBlock.match(/[A-Za-z_][A-Za-z0-9_]*/g) ?? [];
  let selectionLike = 0;
  for (const t of tokens) {
    if (!GQL_KEYWORDS.has(t)) selectionLike++;
  }
  let depth = 0;
  let maxDepth = 0;
  for (const ch of noBlock) {
    if (ch === "{") {
      depth++;
      maxDepth = Math.max(maxDepth, depth);
    } else if (ch === "}") depth = Math.max(0, depth - 1);
  }
  const score = selectionLike + maxDepth * 3;
  let hint = "Low — fine for most gateways.";
  if (score > 40) hint = "Medium — watch resolver fan-out and N+1 patterns.";
  if (score > 90) hint = "High — consider pagination, fewer fields, or DataLoader.";
  return { selectionLike, maxDepth, hint };
}

/**
 * Best-effort prettifier for typical queries without string literals containing `{` `}`.
 */
export function prettifyGraphQL(input: string): string {
  let s = input.replace(/#[^\n\r]*/g, " ");
  s = s.replace(/\s+/g, " ").trim();
  if (!s) return "";

  let out = "";
  let indent = 0;
  const sp = () => "\n" + "  ".repeat(Math.max(0, indent));

  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === "{") {
      out += " {";
      indent++;
      out += sp();
    } else if (ch === "}") {
      indent = Math.max(0, indent - 1);
      out += sp();
      out += "}";
    } else if (ch === "(") {
      out += "(";
    } else if (ch === ")") {
      out += ")";
    } else if (ch === " ") {
      if (out.endsWith(" ") || out.endsWith("\n")) continue;
      out += " ";
    } else {
      out += ch;
    }
  }

  return out
    .split("\n")
    .map((l) => l.trimEnd())
    .join("\n")
    .trim();
}
