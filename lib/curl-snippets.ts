import type { ParsedCurl } from "./curl-parse";

function escJsStr(s: string): string {
  return JSON.stringify(s);
}

function headerObject(h: Record<string, string>): string {
  const keys = Object.keys(h);
  if (keys.length === 0) return "{}";
  const lines = keys.map((k) => `    ${escJsStr(k)}: ${escJsStr(h[k])},`);
  return `{\n${lines.join("\n")}\n  }`;
}

/** Escape for POSIX single-quoted shell string */
function escShellSingle(s: string): string {
  return `'${s.replace(/'/g, `'\\''`)}'`;
}

export function buildCurlCommand(p: ParsedCurl): string {
  const parts = ["curl", "-X", p.method, escShellSingle(p.url)];
  for (const [k, v] of Object.entries(p.headers)) {
    parts.push("-H", escShellSingle(`${k}: ${v}`));
  }
  if (p.body !== undefined && p.body.length > 0) {
    parts.push("--data-raw", escShellSingle(p.body));
  }
  return parts.join(" ");
}

export function snippetsFromParsed(p: ParsedCurl): {
  fetchJs: string;
  fetchTs: string;
  axios: string;
  pythonRequests: string;
} {
  const hdr = headerObject(p.headers);
  const bodyPart =
    p.body !== undefined && p.body.length > 0
      ? `,\n  body: ${escJsStr(p.body)}`
      : "";

  const fetchJs = `const res = await fetch(${escJsStr(p.url)}, {
  method: ${escJsStr(p.method)},
  headers: ${hdr}${bodyPart},
});
const data = await res.text();`;

  const fetchTs = `const res = await fetch(${escJsStr(p.url)}, {
  method: ${escJsStr(p.method)} as const,
  headers: ${hdr}${bodyPart},
});
const data: string = await res.text();`;

  const axios = `import axios from "axios";

const res = await axios({
  url: ${escJsStr(p.url)},
  method: ${escJsStr(p.method.toLowerCase())},
  headers: ${hdr.replace(/\n/g, "\n  ")}${
    p.body !== undefined && p.body.length > 0
      ? `,\n  data: ${escJsStr(p.body)}`
      : ""
  },
});
const data = res.data;`;

  const pyHeaders =
    Object.keys(p.headers).length === 0
      ? "{}"
      : `{\n${Object.entries(p.headers)
          .map(([k, v]) => `    ${JSON.stringify(k)}: ${JSON.stringify(v)},`)
          .join("\n")}\n}`;

  const pyData =
    p.body !== undefined && p.body.length > 0
      ? `,\n    data=${JSON.stringify(p.body)}`
      : "";

  const pythonRequests = `import requests

r = requests.request(
    ${JSON.stringify(p.method)},
    ${JSON.stringify(p.url)},
    headers=${pyHeaders}${pyData},
)
print(r.text)`;

  return { fetchJs, fetchTs, axios, pythonRequests };
}
