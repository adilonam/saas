const STOP = new Set(
  "the a an and or but if then this that these those is are was were be been being to of in on for with as at by from into it its we you they he she them their our your not no so than too very can could should would will just about also what when where which who how".split(
    " ",
  ),
);

export function extractVocabularyWords(text: string, max = 40): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  const raw = text.toLowerCase().match(/\b[a-z]{5,}\b/g) || [];
  for (const w of raw) {
    if (STOP.has(w)) continue;
    if (seen.has(w)) continue;
    seen.add(w);
    out.push(w);
    if (out.length >= max) break;
  }
  return out;
}

export function extractActionItemsHeuristic(notes: string): string[] {
  const lines = notes.split(/\r\n|\r|\n/);
  const items: string[] = [];
  const seen = new Set<string>();
  const push = (s: string) => {
    const t = s.replace(/\s+/g, " ").trim();
    if (t.length < 3 || seen.has(t.toLowerCase())) return;
    seen.add(t.toLowerCase());
    items.push(t);
  };

  for (const line of lines) {
    const m1 = line.match(/^\s*[-*•]\s*\[\s*[xX ]\s*\]\s*(.+)$/);
    if (m1) {
      push(m1[1]);
      continue;
    }
    const m2 = line.match(
      /^\s*[-*•]?\s*(TODO|ACTION|ACTION ITEM|FIXME|AI)\s*[:.\-]\s*(.+)$/i,
    );
    if (m2) {
      push(m2[2]);
      continue;
    }
    const m3 = line.match(/^\s*\d+[.)]\s+(.+)$/);
    if (m3 && /follow|send|schedule|review|update|call|email|draft|prepare/i.test(m3[1])) {
      push(m3[1]);
    }
  }
  return items;
}

export function addDays(d: Date, days: number): Date {
  const x = new Date(d.getTime());
  x.setDate(x.getDate() + days);
  return x;
}

export function parseLocalDateInput(s: string): Date | null {
  const t = s.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(t)) return null;
  const [y, m, d] = t.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) return null;
  return dt;
}

export function formatShortDate(d: Date): string {
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function holidaySetFromText(text: string): Set<string> {
  const set = new Set<string>();
  for (const line of text.split(/[\r\n,]+/)) {
    const t = line.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(t)) set.add(t);
  }
  return set;
}

export function dateKeyLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
