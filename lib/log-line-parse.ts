export type LogTableRow = Record<string, string>;

function flattenJson(obj: unknown, prefix = ""): LogTableRow {
  const out: LogTableRow = {};
  if (obj === null || obj === undefined) {
    out[prefix || "value"] = "";
    return out;
  }
  if (typeof obj !== "object") {
    out[prefix || "value"] = String(obj);
    return out;
  }
  if (Array.isArray(obj)) {
    out[prefix || "array"] = JSON.stringify(obj);
    return out;
  }
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v != null && typeof v === "object" && !Array.isArray(v) && !(v instanceof Date)) {
      Object.assign(out, flattenJson(v, key));
    } else if (Array.isArray(v)) {
      out[key] = JSON.stringify(v);
    } else {
      out[key] = v == null ? "" : String(v);
    }
  }
  return out;
}

/** key=value logfmt-style; supports double-quoted values. */
export function parseKeyValueLine(line: string): LogTableRow {
  const out: LogTableRow = {};
  const re = /([^\s=]+)=(?:("(?:[^"\\]|\\.)*")|('(?:[^'\\]|\\.)*')|(\S+))/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line)) !== null) {
    const key = m[1];
    let val = m[2] ?? m[3] ?? m[4] ?? "";
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1).replace(/\\(.)/g, "$1");
    }
    out[key] = val;
  }
  if (Object.keys(out).length === 0 && line.trim()) {
    out.line = line.trim();
  }
  return out;
}

export function parseLogDataLine(line: string): LogTableRow | null {
  const t = line.trim();
  if (!t) return null;
  if (t.startsWith("{") || t.startsWith("[")) {
    try {
      const parsed: unknown = JSON.parse(t);
      if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
        return flattenJson(parsed);
      }
      return { value: JSON.stringify(parsed) };
    } catch {
      return { raw: t };
    }
  }
  return parseKeyValueLine(t);
}

export function logLinesToTable(lines: string[]): { rows: LogTableRow[]; columns: string[] } {
  const rows: LogTableRow[] = [];
  const colSet = new Set<string>();
  for (const line of lines) {
    const row = parseLogDataLine(line);
    if (!row) continue;
    rows.push(row);
    Object.keys(row).forEach((k) => colSet.add(k));
  }
  const columns = [...colSet].sort((a, b) => {
    if (a === "line" || a === "raw") return 1;
    if (b === "line" || b === "raw") return -1;
    return a.localeCompare(b);
  });
  return { rows, columns };
}
