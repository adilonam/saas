export type ParsedCurl = {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string | undefined;
};

function unquote(s: string): string {
  const t = s.trim();
  if (
    (t.startsWith('"') && t.endsWith('"')) ||
    (t.startsWith("'") && t.endsWith("'"))
  ) {
    return t.slice(1, -1).replace(/\\'/g, "'").replace(/\\"/g, '"');
  }
  return t;
}

/** Normalize backslash-newline continuations into spaces. */
function flattenCurl(src: string): string {
  return src
    .replace(/\\\r?\n/g, " ")
    .replace(/\r?\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Best-effort parser for common `curl` invocations (URL, -X, -H, -d / --data*).
 * Not a full shell parser; complex scripts may need manual cleanup.
 */
export function parseLooseCurl(source: string): ParsedCurl | { error: string } {
  const flat = flattenCurl(source);
  if (!flat.toLowerCase().startsWith("curl")) {
    return { error: "Paste a command that starts with curl." };
  }

  let method = "GET";
  const xm = flat.match(/(?:^|\s)-X\s+(\w+)|(?:^|\s)--request\s+(\w+)/i);
  if (xm) {
    method = (xm[1] || xm[2] || "GET").toUpperCase();
  }

  const headers: Record<string, string> = {};
  const headerRe = /(?:^|\s)-H\s+(['"])([^]*?)\1/gi;
  let hm: RegExpExecArray | null;
  while ((hm = headerRe.exec(flat)) !== null) {
    const raw = hm[2];
    const colon = raw.indexOf(":");
    if (colon > -1) {
      const name = raw.slice(0, colon).trim();
      const value = raw.slice(colon + 1).trim();
      if (name.toLowerCase() !== "content-length") {
        headers[name] = value;
      }
    }
  }

  let body: string | undefined;
  const dataPatterns: RegExp[] = [
    /--data-raw\s+(['"])([^]*?)\1/i,
    /--data-binary\s+(['"])([^]*?)\1/i,
    /--data-urlencode\s+(['"])([^]*?)\1/i,
    /--data\s+(['"])([^]*?)\1/i,
    /(?:^|\s)-d\s+(['"])([^]*?)\1/i,
  ];
  for (const re of dataPatterns) {
    const m = flat.match(re);
    if (m) {
      body = m[2];
      break;
    }
  }

  let url = "";
  const urlFlag = flat.match(
    /--url\s+(['"]?)(https?:\/\/[^'"\s]+)\1|--location\s+(['"]?)(https?:\/\/[^'"\s]+)\3/i,
  );
  if (urlFlag) {
    url = urlFlag[2] || urlFlag[4] || "";
  }
  if (!url) {
    const bare = flat.match(/\s(https?:\/\/[^\s'"]+)/i);
    if (bare) url = bare[1];
  }
  if (!url) {
    return {
      error:
        "Could not find an http(s) URL. Add a URL or use --url 'https://…'.",
    };
  }

  if (body !== undefined && method === "GET") {
    method = "POST";
  }

  return { url, method, headers, body };
}

export function jsonStringifyPretty(obj: unknown): string {
  return JSON.stringify(obj, null, 2);
}
