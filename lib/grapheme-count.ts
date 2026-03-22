/** Character count that treats emoji and combined marks as one unit when possible. */
export function graphemeCount(text: string): number {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const seg = new Intl.Segmenter(undefined, { granularity: "grapheme" });
    return Array.from(seg.segment(text)).length;
  }
  return Array.from(text).length;
}
