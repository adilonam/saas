const SENSITIVE = /secret|password|passwd|token|apikey|api_key|authorization|auth|credential|private/i;

export type EnvDiffLine =
  | { kind: "same"; key: string; a: string; b: string }
  | { kind: "onlyA"; key: string; value: string }
  | { kind: "onlyB"; key: string; value: string }
  | { kind: "changed"; key: string; a: string; b: string };

function parseEnv(text: string): Map<string, string> {
  const map = new Map<string, string>();
  for (const line of text.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq <= 0) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    map.set(key, val);
  }
  return map;
}

export function redactKey(key: string, value: string): string {
  if (SENSITIVE.test(key) || SENSITIVE.test(value)) return "[REDACTED]";
  if (value.length > 64) return `${value.slice(0, 8)}… (${value.length} chars)`;
  return value;
}

export function diffEnvMaps(aText: string, bText: string): EnvDiffLine[] {
  const a = parseEnv(aText);
  const b = parseEnv(bText);
  const keys = new Set([...a.keys(), ...b.keys()]);
  const sorted = [...keys].sort((x, y) => x.localeCompare(y));
  const out: EnvDiffLine[] = [];
  for (const key of sorted) {
    const av = a.get(key);
    const bv = b.get(key);
    if (av !== undefined && bv === undefined) {
      out.push({ kind: "onlyA", key, value: redactKey(key, av) });
    } else if (av === undefined && bv !== undefined) {
      out.push({ kind: "onlyB", key, value: redactKey(key, bv) });
    } else if (av !== undefined && bv !== undefined) {
      if (av === bv) {
        out.push({ kind: "same", key, a: redactKey(key, av), b: redactKey(key, bv) });
      } else {
        out.push({ kind: "changed", key, a: redactKey(key, av), b: redactKey(key, bv) });
      }
    }
  }
  return out;
}

export function formatEnvDiff(lines: EnvDiffLine[]): string {
  const parts: string[] = [];
  for (const row of lines) {
    if (row.kind === "same") parts.push(`= ${row.key}: ${row.a}`);
    else if (row.kind === "onlyA") parts.push(`- ${row.key}: ${row.value}  (only in A)`);
    else if (row.kind === "onlyB") parts.push(`+ ${row.key}: ${row.value}  (only in B)`);
    else parts.push(`~ ${row.key}: A=${row.a}  B=${row.b}`);
  }
  return parts.join("\n");
}
