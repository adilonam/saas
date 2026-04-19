/**
 * Split plain text into chunks up to maxLen characters (code units),
 * preferring breaks at whitespace. Not grapheme-aware (pair with UI note).
 */
export function splitTextIntoChunks(text: string, maxLen: number): string[] {
  const t = text.trim();
  if (!t) return [];
  if (maxLen < 20) return [t];

  const chunks: string[] = [];
  let rest = t;

  while (rest.length > maxLen) {
    let cut = rest.lastIndexOf(" ", maxLen);
    if (cut < maxLen * 0.5) cut = maxLen;
    const piece = rest.slice(0, cut).trimEnd();
    if (!piece) {
      chunks.push(rest.slice(0, maxLen));
      rest = rest.slice(maxLen).trimStart();
    } else {
      chunks.push(piece);
      rest = rest.slice(cut).trimStart();
    }
  }
  if (rest) chunks.push(rest);
  return chunks;
}

export function graphemeLength(s: string): number {
  try {
    const Seg = Intl.Segmenter;
    if (typeof Seg === "function") {
      const seg = new Seg(undefined, { granularity: "grapheme" });
      return [...seg.segment(s)].length;
    }
  } catch {
    /* fall through */
  }
  return [...s].length;
}
