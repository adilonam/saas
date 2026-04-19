import yaml from "js-yaml";

const HTTP_METHODS = new Set([
  "get",
  "put",
  "post",
  "delete",
  "options",
  "head",
  "patch",
  "trace",
]);

export function parseOpenApiDocument(raw: string): Record<string, unknown> {
  const t = raw.trim();
  if (!t) {
    throw new Error("Paste OpenAPI JSON or YAML.");
  }
  let doc: unknown;
  if (t.startsWith("{") || t.startsWith("[")) {
    doc = JSON.parse(t);
  } else {
    doc = yaml.load(t);
  }
  if (!doc || typeof doc !== "object" || Array.isArray(doc)) {
    throw new Error("OpenAPI document must be a JSON/YAML object.");
  }
  return doc as Record<string, unknown>;
}

export function buildOpenApiOutline(spec: Record<string, unknown>): string {
  const lines: string[] = [];
  const info = spec.info as Record<string, unknown> | undefined;
  if (info) {
    lines.push(`# ${String(info.title ?? "API")}`);
    if (info.version != null) lines.push(`Version: ${String(info.version)}`);
    if (typeof info.description === "string" && info.description.trim()) {
      lines.push("");
      lines.push("## Description");
      lines.push(info.description.trim());
    }
  } else {
    lines.push("# OpenAPI outline");
  }

  const servers = spec.servers;
  if (Array.isArray(servers) && servers.length) {
    lines.push("");
    lines.push("## Servers");
    for (const s of servers) {
      if (s && typeof s === "object" && "url" in s) {
        const u = (s as { url?: string; description?: string }).url ?? "";
        const d = (s as { description?: string }).description;
        lines.push(`- ${u}${d ? ` — ${d}` : ""}`);
      }
    }
  }

  const paths = spec.paths;
  if (paths && typeof paths === "object" && !Array.isArray(paths)) {
    lines.push("");
    lines.push("## Paths");
    for (const [pathKey, item] of Object.entries(paths as Record<string, unknown>)) {
      if (!item || typeof item !== "object" || Array.isArray(item)) continue;
      lines.push("");
      lines.push(`### \`${pathKey}\``);
      for (const [method, op] of Object.entries(item as Record<string, unknown>)) {
        const m = method.toLowerCase();
        if (!HTTP_METHODS.has(m)) continue;
        const opObj = op as Record<string, unknown> | null;
        const summary =
          opObj && typeof opObj.summary === "string" ? opObj.summary : "";
        const opId =
          opObj && typeof opObj.operationId === "string" ? opObj.operationId : "";
        const bits = [`**${m.toUpperCase()}**`];
        if (summary) bits.push(`— ${summary}`);
        if (opId) bits.push(`(\`${opId}\`)`);
        lines.push(`- ${bits.join(" ")}`);
      }
    }
  }

  const components = spec.components as Record<string, unknown> | undefined;
  if (components && typeof components === "object") {
    const schemas = components.schemas;
    if (schemas && typeof schemas === "object" && !Array.isArray(schemas)) {
      lines.push("");
      lines.push("## Schemas (components)");
      for (const name of Object.keys(schemas as Record<string, unknown>)) {
        lines.push(`- \`${name}\``);
      }
    }
  }

  return lines.join("\n").trim() + "\n";
}
