"use client";

import { useMemo, useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ClockIcon, CalculatorIcon } from "@heroicons/react/24/outline";
import { useToolAccess } from "@/lib/use-tool-access";

function parseTimeToMinutes(t: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(t.trim());
  if (!m) return null;
  const h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  if (h < 0 || h > 23 || min < 0 || min > 59) return null;
  return h * 60 + min;
}

function formatHoursMinutes(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = Math.round(totalMinutes % 60);
  return `${h}h ${m}m`;
}

export default function WorkHoursCalculatorPage() {
  const { ensureAccess } = useToolAccess();
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("17:30");
  const [breakMinutes, setBreakMinutes] = useState("60");
  const [unlocked, setUnlocked] = useState(false);

  const result = useMemo(() => {
    const startM = parseTimeToMinutes(start);
    const endM = parseTimeToMinutes(end);
    const br = parseInt(breakMinutes, 10);
    if (startM === null || endM === null || !Number.isFinite(br) || br < 0) return null;
    let span = endM - startM;
    if (span < 0) span += 24 * 60;
    const net = span - br;
    if (net < 0) return null;
    const decimalHours = net / 60;
    return { netMinutes: net, decimalHours, span };
  }, [start, end, breakMinutes]);

  const handleCalculate = () => {
    if (!ensureAccess()) return;
    setUnlocked(true);
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-sky-600">
            <ClockIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Work Hours Calculator</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Net hours from clock times and unpaid break (same day; end can be next calendar day if earlier)
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="start">Start time</Label>
              <Input
                id="start"
                type="time"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="rounded-xl h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end">End time</Label>
              <Input
                id="end"
                type="time"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="rounded-xl h-11"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="break">Break (minutes, unpaid)</Label>
            <Input
              id="break"
              type="number"
              min={0}
              step={1}
              inputMode="numeric"
              value={breakMinutes}
              onChange={(e) => setBreakMinutes(e.target.value)}
              className="rounded-xl h-11"
            />
          </div>

          <Button onClick={handleCalculate} disabled={!result} className="gap-2">
            <CalculatorIcon className="h-4 w-4" />
            Calculate
          </Button>

          {result && unlocked && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-3">
              <p className="text-sm text-slate-500 dark:text-slate-400">Net working time</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {formatHoursMinutes(result.netMinutes)}
              </p>
              <p className="text-lg text-slate-600 dark:text-slate-300">
                {result.decimalHours.toFixed(2)} decimal hours
              </p>
            </div>
          )}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-6">
          If end is before start, we assume the shift crosses midnight (e.g. night shift).
        </p>
      </div>
    </DashboardLayout>
  );
}
