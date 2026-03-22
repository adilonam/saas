/** Find UTC instant where `tz` shows `dateYmd` at `hm` (HH:mm, 24h). */
export function findUtcForWallClock(
  dateYmd: string,
  hm: string,
  tz: string,
): Date | null {
  const [Y, M, D] = dateYmd.split("-").map(Number);
  const [th, tm] = hm.split(":").map(Number);
  if (!Y || !M || !D || th !== th || tm !== tm) return null;

  const anchor = Date.UTC(Y, M - 1, D, 12, 0, 0);
  for (let deltaMin = -18 * 60; deltaMin <= 18 * 60; deltaMin++) {
    const d = new Date(anchor + deltaMin * 60_000);
    const p = new Intl.DateTimeFormat("en-CA", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(d);

    const py = +p.find((x) => x.type === "year")!.value;
    const pm = +p.find((x) => x.type === "month")!.value;
    const pd = +p.find((x) => x.type === "day")!.value;
    const ph = +p.find((x) => x.type === "hour")!.value;
    const pmin = +p.find((x) => x.type === "minute")!.value;

    if (py === Y && pm === M && pd === D && ph === th && pmin === tm) {
      return d;
    }
  }
  return null;
}

export function addCalendarDay(dateYmd: string): string {
  const [y, m, d] = dateYmd.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + 1));
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(dt.getUTCDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

export type OverlapSegment = { start: Date; end: Date };

/** Local work window on `dateYmd` in `timeZone`, as UTC interval [start, end). */
export function workWindowUtc(
  dateYmd: string,
  timeZone: string,
  workStart: string,
  workEnd: string,
): OverlapSegment | null {
  const start = findUtcForWallClock(dateYmd, workStart, timeZone);
  const endSame = findUtcForWallClock(dateYmd, workEnd, timeZone);
  if (!start || !endSame) return null;

  let end = endSame;
  if (end.getTime() <= start.getTime()) {
    const next = addCalendarDay(dateYmd);
    const endNext = findUtcForWallClock(next, workEnd, timeZone);
    if (!endNext) return null;
    end = endNext;
  }

  return { start, end };
}

export function intersectSegments(segments: OverlapSegment[]): OverlapSegment | null {
  if (segments.length === 0) return null;
  let s = segments[0]!.start.getTime();
  let e = segments[0]!.end.getTime();
  for (let i = 1; i < segments.length; i++) {
    const seg = segments[i]!;
    s = Math.max(s, seg.start.getTime());
    e = Math.min(e, seg.end.getTime());
    if (s >= e) return null;
  }
  return { start: new Date(s), end: new Date(e) };
}
