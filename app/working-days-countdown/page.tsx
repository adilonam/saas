"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CalendarIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { guardToolAccess } from "@/lib/guard-tool-access";

const PAGE = "/working-days-countdown";

function truncateLocal(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function ymdLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseYmd(s: string): Date | null {
  const m = s.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const dt = new Date(y, mo - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null;
  return truncateLocal(dt);
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  return truncateLocal(x);
}

function calendarDaysInclusive(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86400000) + 1;
}

function workingDaysInclusive(a: Date, b: Date, holidays: Set<string>): number {
  if (b.getTime() < a.getTime()) return 0;
  let n = 0;
  for (let d = new Date(a); d.getTime() <= b.getTime(); d = addDays(d, 1)) {
    const wd = d.getDay();
    if (wd === 0 || wd === 6) continue;
    if (holidays.has(ymdLocal(d))) continue;
    n++;
  }
  return n;
}

export default function WorkingDaysCountdownPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [deadline, setDeadline] = useState("");
  const [holidayText, setHolidayText] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const summary = useMemo(() => {
    if (!unlocked) return null;
    const end = parseYmd(deadline);
    if (!end) return null;
    const start = truncateLocal(new Date());
    const hol = new Set(
      holidayText
        .split(/\n/)
        .map((l) => l.trim())
        .filter(Boolean)
        .filter((l) => /^\d{4}-\d{2}-\d{2}$/.test(l)),
    );
    const cal = calendarDaysInclusive(start, end);
    const work = workingDaysInclusive(start, end, hol);
    return { start, end, cal, work, holCount: hol.size };
  }, [unlocked, deadline, holidayText]);

  const handleSubmit = () => {
    if (!guardToolAccess(status, session, pathname, PAGE, router)) return;
    setError(null);
    const end = parseYmd(deadline);
    if (!end) {
      setError("Use deadline YYYY-MM-DD.");
      setUnlocked(false);
      return;
    }
    const start = truncateLocal(new Date());
    if (end.getTime() < start.getTime()) {
      setError("Deadline is before today (local date).");
      setUnlocked(false);
      return;
    }
    setUnlocked(true);
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
            <CalendarIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Working-days countdown</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Calendar days and Mon–Fri working days until a deadline, with optional holiday dates to skip.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="deadline">Deadline (local date)</Label>
            <Input
              id="deadline"
              type="date"
              value={deadline}
              onChange={(e) => {
                setDeadline(e.target.value);
                setUnlocked(false);
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hol">Holidays to exclude (optional, one YYYY-MM-DD per line)</Label>
            <textarea
              id="hol"
              value={holidayText}
              onChange={(e) => {
                setHolidayText(e.target.value);
                setUnlocked(false);
              }}
              className="w-full min-h-[100px] rounded-xl border border-input bg-background px-3 py-2 text-sm font-mono"
              placeholder={"2026-12-25\n2026-01-01"}
            />
          </div>

          <Button onClick={handleSubmit} disabled={!deadline} className="gap-2">
            <CalendarIcon className="h-4 w-4" />
            Calculate
          </Button>

          {error && (
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm">
              <ExclamationTriangleIcon className="size-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {summary && (
            <dl className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-3 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <dt className="text-slate-500 dark:text-slate-400">From (today local)</dt>
                <dd className="font-mono">{ymdLocal(summary.start)}</dd>
                <dt className="text-slate-500 dark:text-slate-400">Through deadline</dt>
                <dd className="font-mono">{ymdLocal(summary.end)}</dd>
                <dt className="text-slate-500 dark:text-slate-400">Calendar days (inclusive)</dt>
                <dd className="font-mono text-lg font-semibold text-slate-900 dark:text-white">{summary.cal}</dd>
                <dt className="text-slate-500 dark:text-slate-400">Working days (Mon–Fri, minus holidays)</dt>
                <dd className="font-mono text-lg font-semibold text-slate-900 dark:text-white">{summary.work}</dd>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Holidays list had {summary.holCount} valid date lines. Invalid lines are ignored.
              </p>
            </dl>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
