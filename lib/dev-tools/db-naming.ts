const SNAKE = /^[a-z][a-z0-9]*(_[a-z0-9]+)*$/;
const RESERVED = new Set([
  "user",
  "order",
  "group",
  "select",
  "table",
  "column",
  "index",
  "where",
]);

export type NamingIssue = {
  name: string;
  level: "ok" | "warn" | "bad";
  message: string;
};

function pluralHint(name: string, kind: "table" | "column"): string | null {
  if (kind !== "table") return null;
  if (name.endsWith("s") && name.length > 2) return null;
  if (name.endsWith("y") && !name.endsWith("ay") && !name.endsWith("ey")) {
    return `Often pluralized as \`${name.slice(0, -1)}ies\` for table collections.`;
  }
  return `Consider a plural table name (e.g. \`${name}s\`) if each row is one entity of many.`;
}

export function lintDbName(raw: string, kind: "table" | "column"): NamingIssue {
  const name = raw.trim();
  if (!name) {
    return { name: raw, level: "bad", message: "Empty name." };
  }
  if (name !== name.toLowerCase()) {
    return {
      name,
      level: "bad",
      message: "Prefer lowercase identifiers for SQL portability.",
    };
  }
  if (!SNAKE.test(name)) {
    return {
      name,
      level: "bad",
      message: "Use snake_case: lowercase letters, digits, single underscores between segments.",
    };
  }
  if (RESERVED.has(name)) {
    return {
      name,
      level: "warn",
      message: "This word is often reserved or ambiguous; consider renaming or quoting in SQL.",
    };
  }
  const hint = pluralHint(name, kind);
  if (hint) {
    return { name, level: "warn", message: `snake_case OK. ${hint}` };
  }
  return { name, level: "ok", message: "Looks consistent with common SQL naming style." };
}
