export type FiscalWeekOptions = {
  /** 1–12 */
  fiscalStartMonth: number;
  /** 1–31 */
  fiscalStartDay: number;
  /** Week numbering starts on Monday (true) or Sunday (false) */
  weekStartsMonday: boolean;
};

function truncateDate(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Start of calendar week containing `d` (local), Monday-first or Sunday-first. */
export function startOfWeekContaining(d: Date, mondayFirst: boolean): Date {
  const t = truncateDate(d);
  const day = t.getDay();
  const offset = mondayFirst ? (day === 0 ? -6 : 1 - day) : -day;
  return new Date(t.getFullYear(), t.getMonth(), t.getDate() + offset);
}

/** Most recent fiscal-year start on or before `ref` (local calendar). */
export function fiscalYearStart(ref: Date, opts: FiscalWeekOptions): Date {
  const y = ref.getFullYear();
  let start = new Date(y, opts.fiscalStartMonth - 1, opts.fiscalStartDay);
  if (truncateDate(ref) < truncateDate(start)) {
    start = new Date(y - 1, opts.fiscalStartMonth - 1, opts.fiscalStartDay);
  }
  return truncateDate(start);
}

export type FiscalWeekResult = {
  fiscalYearStart: Date;
  fiscalYearLabel: string;
  weekNumber: number;
  weekStart: Date;
  weekEnd: Date;
};

export function computeFiscalWeek(ref: Date, opts: FiscalWeekOptions): FiscalWeekResult | { error: string } {
  const { fiscalStartMonth, fiscalStartDay, weekStartsMonday } = opts;
  if (
    !Number.isInteger(fiscalStartMonth) ||
    fiscalStartMonth < 1 ||
    fiscalStartMonth > 12 ||
    !Number.isInteger(fiscalStartDay) ||
    fiscalStartDay < 1 ||
    fiscalStartDay > 31
  ) {
    return { error: "Invalid fiscal start month or day." };
  }
  const probe = new Date(2024, fiscalStartMonth - 1, fiscalStartDay);
  if (
    probe.getMonth() !== fiscalStartMonth - 1 ||
    probe.getDate() !== fiscalStartDay
  ) {
    return { error: "That month/day is not a valid calendar date (e.g. Feb 30)." };
  }

  const fyStart = fiscalYearStart(ref, opts);
  const week1Start = startOfWeekContaining(fyStart, weekStartsMonday);
  const refDay = truncateDate(ref);
  const msPerDay = 86400000;
  const days = Math.floor((refDay.getTime() - week1Start.getTime()) / msPerDay);
  if (days < 0) {
    return { error: "Reference date is before computed week 1 start; try another fiscal rule." };
  }
  const weekNumber = Math.floor(days / 7) + 1;
  const weekStart = new Date(week1Start.getFullYear(), week1Start.getMonth(), week1Start.getDate() + (weekNumber - 1) * 7);
  const weekEnd = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 6);
  const fyLabelEnd = new Date(fyStart.getFullYear() + 1, fyStart.getMonth(), fyStart.getDate());
  const fiscalYearLabel = `FY ending ${fyLabelEnd.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

  return {
    fiscalYearStart: fyStart,
    fiscalYearLabel,
    weekNumber,
    weekStart,
    weekEnd,
  };
}
