"use client";

import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CalendarDaysIcon } from "@heroicons/react/24/outline";
import {
  addDays,
  dateKeyLocal,
  formatShortDate,
  holidaySetFromText,
  parseLocalDateInput,
} from "@/lib/study-meeting-utils";

export default function SyllabusWeekGeneratorPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [startStr, setStartStr] = useState("");
  const [weeksStr, setWeeksStr] = useState("12");
  const [holidaysText, setHolidaysText] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [rows, setRows] = useState<{ label: string; range: string; notes: string }[]>([]);

  const holidays = useMemo(() => holidaySetFromText(holidaysText), [holidaysText]);

  const run = () => {
    if (status === "unauthenticated" || !session) {
      router.push(
        `/signup?callbackUrl=${encodeURIComponent(pathname || "/syllabus-week-generator")}`,
      );
      return;
    }
    const hasActiveSubscription =
      session.user.subscriptionExpiresAt &&
      new Date(session.user.subscriptionExpiresAt) > new Date();
    if (!hasActiveSubscription) {
      router.push("/pricing");
      return;
    }

    const start = parseLocalDateInput(startStr);
    const weeks = Math.min(52, Math.max(1, Number.parseInt(weeksStr, 10) || 1));
    if (!start) {
      setRows([]);
      setUnlocked(true);
      return;
    }

    const out: { label: string; range: string; notes: string }[] = [];
    for (let w = 0; w < weeks; w++) {
      const ws = addDays(start, w * 7);
      const we = addDays(ws, 6);
      const hits: string[] = [];
      for (let i = 0; i < 7; i++) {
        const d = addDays(ws, i);
        const k = dateKeyLocal(d);
        if (holidays.has(k)) hits.push(formatShortDate(d));
      }
      out.push({
        label: `Week ${w + 1}`,
        range: `${formatShortDate(ws)} – ${formatShortDate(we)}`,
        notes: hits.length ? `Holidays in range: ${hits.join("; ")}` : "—",
      });
    }
    setRows(out);
    setUnlocked(true);
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-sky-600">
            <CalendarDaysIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Syllabus week generator</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Calendar weeks from a start date with holiday callouts (YYYY-MM-DD)
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sy-start">First week starts (Monday or any anchor day)</Label>
              <Input
                id="sy-start"
                type="date"
                value={startStr}
                onChange={(e) => setStartStr(e.target.value)}
                className="rounded-xl h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sy-weeks">Number of weeks</Label>
              <Input
                id="sy-weeks"
                type="number"
                min={1}
                max={52}
                value={weeksStr}
                onChange={(e) => setWeeksStr(e.target.value)}
                className="rounded-xl h-11"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sy-hol">Holidays (one YYYY-MM-DD per line or comma-separated)</Label>
            <textarea
              id="sy-hol"
              value={holidaysText}
              onChange={(e) => setHolidaysText(e.target.value)}
              className="w-full min-h-[100px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 text-sm font-mono"
              placeholder={"2026-11-26\n2026-12-25"}
              spellCheck={false}
            />
          </div>
          <Button type="button" onClick={run} className="gap-2">
            Generate schedule
          </Button>

          {unlocked && rows.length === 0 && (
            <p className="text-sm text-rose-600">Pick a valid start date to see rows.</p>
          )}

          {rows.length > 0 && (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
              <table className="w-full text-sm">
                <thead className="bg-slate-100 dark:bg-slate-800/80">
                  <tr>
                    <th className="text-left p-3 font-semibold">Week</th>
                    <th className="text-left p-3 font-semibold">Range</th>
                    <th className="text-left p-3 font-semibold">Holidays</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.label} className="border-t border-slate-200 dark:border-slate-700">
                      <td className="p-3 font-medium text-slate-900 dark:text-white">{r.label}</td>
                      <td className="p-3 text-slate-700 dark:text-slate-200">{r.range}</td>
                      <td className="p-3 text-slate-500 dark:text-slate-400">{r.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">
          Weeks are contiguous 7-day blocks from your anchor date. Adjust the anchor to align with your
          institution&apos;s week numbering.
        </p>
      </div>
    </DashboardLayout>
  );
}
