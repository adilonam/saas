/**
 * Small helpers for SEO tool pages (client-safe).
 */

export function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function tokenizeWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s'-]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
}

export function keywordDensityPercent(text: string, keyword: string): {
  occurrences: number;
  wordCount: number;
  densityPercent: number;
} {
  const kw = keyword.trim().toLowerCase();
  if (!kw) {
    return { occurrences: 0, wordCount: 0, densityPercent: 0 };
  }
  const words = tokenizeWords(text);
  const wordCount = words.length;
  if (wordCount === 0) {
    return { occurrences: 0, wordCount: 0, densityPercent: 0 };
  }
  const kwTokens = tokenizeWords(kw);
  if (kwTokens.length === 1) {
    const occurrences = words.filter((w) => w === kwTokens[0]).length;
    return {
      occurrences,
      wordCount,
      densityPercent: (occurrences / wordCount) * 100,
    };
  }
  let occurrences = 0;
  const n = kwTokens.length;
  for (let i = 0; i <= words.length - n; i++) {
    let match = true;
    for (let j = 0; j < n; j++) {
      if (words[i + j] !== kwTokens[j]) {
        match = false;
        break;
      }
    }
    if (match) occurrences += 1;
  }
  return {
    occurrences,
    wordCount,
    densityPercent: (occurrences / wordCount) * 100,
  };
}

export function normalizeUrlForComparison(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    const u = new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`);
    const path =
      u.pathname.replace(/\/+$/, "") || "/";
    const host = u.hostname.toLowerCase();
    return `${u.protocol}//${host}${path === "/" ? "/" : path}${u.search}`;
  } catch {
    return null;
  }
}

export function extractCanonicalFromHtml(html: string): string | null {
  const m = html.match(
    /<link[^>]+rel\s*=\s*["']canonical["'][^>]*>/i,
  );
  if (!m) return null;
  const hrefM = m[0].match(/href\s*=\s*["']([^"']+)["']/i);
  return hrefM ? hrefM[1].trim() : null;
}
