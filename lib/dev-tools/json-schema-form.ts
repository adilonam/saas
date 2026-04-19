function labelFor(key: string, schema: Record<string, unknown>): string {
  const title = typeof schema.title === "string" ? schema.title : null;
  return title || key;
}

function typeLine(schema: Record<string, unknown>): string {
  const t = schema.type;
  if (typeof t === "string") {
    if (t === "array") {
      const items = schema.items;
      if (items && typeof items === "object" && !Array.isArray(items)) {
        const it = items as Record<string, unknown>;
        const inner = typeof it.type === "string" ? it.type : "object";
        return `array of ${inner}`;
      }
      return "array";
    }
    return t;
  }
  if (Array.isArray(t)) return t.join(" | ");
  if (schema.enum) return "enum";
  if (schema.properties && typeof schema.properties === "object") return "object";
  return "unknown";
}

export function jsonSchemaToFormMockup(schemaRoot: unknown, depth = 0): string {
  if (depth > 12) return `${"  ".repeat(depth)}… (max depth)\n`;
  const pad = "  ".repeat(depth);
  if (!schemaRoot || typeof schemaRoot !== "object" || Array.isArray(schemaRoot)) {
    return `${pad}(invalid schema)\n`;
  }
  const schema = schemaRoot as Record<string, unknown>;
  let out = "";

  const desc =
    typeof schema.description === "string" ? schema.description.trim() : "";
  if (desc && depth === 0) {
    out += `Overview: ${desc}\n\n`;
  }

  const props = schema.properties;
  const required =
    Array.isArray(schema.required) ?
      new Set(schema.required.filter((x) => typeof x === "string") as string[])
    : new Set<string>();

  if (props && typeof props === "object" && !Array.isArray(props)) {
    out += `${pad}Form fields:\n`;
    for (const [key, sub] of Object.entries(props)) {
      if (!sub || typeof sub !== "object" || Array.isArray(sub)) continue;
      const subObj = sub as Record<string, unknown>;
      const req = required.has(key) ? "required" : "optional";
      const typ = typeLine(subObj);
      const lbl = labelFor(key, subObj);
      out += `${pad}- **${lbl}** (\`${key}\`) — ${typ}, ${req}`;
      if (Array.isArray(subObj.enum)) {
        out += ` — options: ${subObj.enum.map(String).join(", ")}`;
      }
      if (typeof subObj.format === "string") {
        out += ` — format: ${subObj.format}`;
      }
      out += "\n";
      if (subObj.type === "object" && subObj.properties) {
        out += jsonSchemaToFormMockup(subObj, depth + 1);
      } else if (subObj.type === "array" && subObj.items) {
        out += `${pad}  (list item)\n`;
        out += jsonSchemaToFormMockup(subObj.items, depth + 2);
      }
    }
    return out;
  }

  if (schema.type === "array" && schema.items) {
    out += `${pad}Repeatable group (array):\n`;
    return out + jsonSchemaToFormMockup(schema.items, depth + 1);
  }

  out += `${pad}Single control: ${typeLine(schema)}`;
  if (Array.isArray(schema.enum)) {
    out += ` — ${schema.enum.map(String).join(" | ")}`;
  }
  out += "\n";
  return out;
}
