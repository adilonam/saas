const LINE_LEN = 64;

function wrapBase64(b64: string): string {
  const clean = b64.replace(/\s/g, "");
  const lines: string[] = [];
  for (let i = 0; i < clean.length; i += LINE_LEN) {
    lines.push(clean.slice(i, i + LINE_LEN));
  }
  return lines.join("\n");
}

/**
 * Normalize PEM / certificate blobs: trim, one blank line after BEGIN,
 * 64-char wrapped base64 before END.
 */
export function prettifyPem(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";

  const re =
    /(-----BEGIN [A-Z0-9\s]+-----)\s*([\s\S]*?)\s*(-----END [A-Z0-9\s]+-----)/gi;
  const parts: string[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(trimmed)) !== null) {
    if (m.index > last) {
      parts.push(trimmed.slice(last, m.index).trim());
    }
    const begin = m[1].trim();
    const body = m[2];
    const end = m[3].trim();
    parts.push(`${begin}\n${wrapBase64(body)}\n${end}`);
    last = re.lastIndex;
  }
  if (last === 0) {
    return trimmed;
  }
  if (last < trimmed.length) {
    parts.push(trimmed.slice(last).trim());
  }
  return parts.filter(Boolean).join("\n\n");
}
