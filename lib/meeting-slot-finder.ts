import { addCalendarDay, intersectSegments, workWindowUtc, type OverlapSegment } from "@/lib/timezone-overlap";

export type SlotParticipant = {
  timeZone: string;
  workStart: string;
  workEnd: string;
};

export type SlotFinderOptions = {
  slotMinutes: number;
  stepMinutes: number;
  maxSlots: number;
  skipWeekend: boolean;
  /** Used only when skipWeekend: treat Sat/Sun in this zone as weekend */
  weekendTimeZone: string;
};

function isWeekendInZone(dateYmd: string, tz: string): boolean {
  const [Y, M, D] = dateYmd.split("-").map(Number);
  if (!Y || !M || !D) return false;
  const d = new Date(Date.UTC(Y, M - 1, D, 12, 0, 0));
  const w = new Intl.DateTimeFormat("en-US", { timeZone: tz, weekday: "short" }).format(d);
  return w === "Sat" || w === "Sun";
}

function compareYmd(a: string, b: string): number {
  return a.localeCompare(b);
}

/** Enumerate 15-minute (or step) aligned slots fully inside the daily overlap. */
export function findSlotsAcrossDays(
  startYmd: string,
  endYmd: string,
  participants: SlotParticipant[],
  opts: SlotFinderOptions,
): { dateYmd: string; slots: OverlapSegment[] }[] {
  const { slotMinutes, stepMinutes, maxSlots, skipWeekend, weekendTimeZone } = opts;
  const slotMs = slotMinutes * 60_000;
  const stepMs = stepMinutes * 60_000;
  const results: { dateYmd: string; slots: OverlapSegment[] }[] = [];
  let total = 0;

  if (compareYmd(startYmd, endYmd) > 0) return results;

  let ymd = startYmd;
  while (compareYmd(ymd, endYmd) <= 0 && total < opts.maxSlots) {
    if (skipWeekend && isWeekendInZone(ymd, weekendTimeZone)) {
      ymd = addCalendarDay(ymd);
      continue;
    }

    const segments = participants.map((p) => workWindowUtc(ymd, p.timeZone, p.workStart, p.workEnd));
    if (segments.some((s) => !s)) {
      ymd = addCalendarDay(ymd);
      continue;
    }
    const overlap = intersectSegments(segments as NonNullable<(typeof segments)[0]>[]);
    if (!overlap || overlap.end.getTime() - overlap.start.getTime() < slotMs) {
      ymd = addCalendarDay(ymd);
      continue;
    }

    const daySlots: OverlapSegment[] = [];
    const endMs = overlap.end.getTime();
    for (let t = overlap.start.getTime(); t + slotMs <= endMs && total < maxSlots; t += stepMs) {
      daySlots.push({ start: new Date(t), end: new Date(t + slotMs) });
      total++;
    }
    if (daySlots.length) {
      results.push({ dateYmd: ymd, slots: daySlots });
    }
    ymd = addCalendarDay(ymd);
  }

  return results;
}
