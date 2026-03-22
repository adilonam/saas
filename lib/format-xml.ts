function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

function serializeElement(el: Element, depth: number): string {
  const pad = "  ".repeat(depth);
  const name = el.tagName;
  let open = `${pad}<${name}`;
  for (let i = 0; i < el.attributes.length; i++) {
    const a = el.attributes[i];
    open += ` ${a.name}="${escapeAttr(a.value)}"`;
  }

  const childEls = Array.from(el.childNodes).filter(
    (n) => n.nodeType === Node.ELEMENT_NODE,
  ) as Element[];
  const textParts = Array.from(el.childNodes)
    .filter((n) => n.nodeType === Node.TEXT_NODE)
    .map((n) => (n.textContent ?? "").trim())
    .filter(Boolean);

  if (childEls.length === 0 && textParts.length === 0) {
    return `${open} />\n`;
  }

  if (childEls.length === 0 && textParts.length === 1) {
    return `${open}>${textParts[0]}</${name}>\n`;
  }

  let body = `${open}>\n`;
  for (const t of textParts) {
    body += `${pad}  ${t}\n`;
  }
  for (const child of childEls) {
    body += serializeElement(child, depth + 1);
  }
  body += `${pad}</${name}>\n`;
  return body;
}

export function formatXmlString(
  xml: string,
): { ok: true; text: string } | { ok: false; error: string } {
  const trimmed = xml.trim();
  if (!trimmed) {
    return { ok: false, error: "Enter XML." };
  }
  const parser = new DOMParser();
  const doc = parser.parseFromString(trimmed, "application/xml");
  const err = doc.querySelector("parsererror");
  if (err) {
    return { ok: false, error: "Could not parse XML." };
  }
  const root = doc.documentElement;
  if (!root) {
    return { ok: false, error: "Empty document." };
  }
  return { ok: true, text: serializeElement(root, 0).trimEnd() + "\n" };
}
