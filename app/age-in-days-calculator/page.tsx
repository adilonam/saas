"use client";

import { useMemo, useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CalendarDaysIcon, CalculatorIcon } from "@heroicons/react/24/outline";
import { useToolAccess } from "@/lib/use-tool-access";

function parseDate(value: string): Date | null {
  if (!value.trim()) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function daysBetween(from: Date, to: Date): number {
  const a = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const b = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

export default function AgeInDaysCalculatorPage() {
  const { ensureAccess } = useToolAccess();
  const [birthDate, setBirthDate] = useState("");
  const [asOfDate, setAsOfDate] = useState(() => {
    const d = new Date();
    return (
      d.getFullYear() +
      "-" +
      String(d.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(d.getDate()).padStart(2, "0")
    );
  });
  const [useToday, setUseToday] = useState(true);
  const [unlocked, setUnlocked] = useState(false);

  const result = useMemo(() => {
    const birth = parseDate(birthDate);
    const asOf = useToday ? new Date() : parseDate(asOfDate);
    if (!birth || !asOf || asOf < birth) return null;
    return { days: daysBetween(birth, asOf) };
  }, [birthDate, asOfDate, useToday]);

  const handleCalculate = () => {
    if (!ensureAccess()) return;
    setUnlocked(true);
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600">
            <CalendarDaysIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Age in Days Calculator</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Total days between birth date and today (or another date)
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="birth">Birth date</Label>
            <Input
              id="birth"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="rounded-xl h-11"
            />
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                id="use-today"
                type="checkbox"
                checked={useToday}
                onChange={(e) => setUseToday(e.target.checked)}
                className="rounded border-slate-300 dark:border-slate-600"
              />
              <Label htmlFor="use-today" className="cursor-pointer font-normal">
                Count up to today
              </Label>
            </div>
            {!useToday && (
              <div className="space-y-2">
                <Label htmlFor="asof">As of date</Label>
                <Input
                  id="asof"
                  type="date"
                  value={asOfDate}
                  onChange={(e) => setAsOfDate(e.target.value)}
                  className="rounded-xl h-11"
                />
              </div>
            )}
          </div>

          <Button onClick={handleCalculate} disabled={!birthDate || !result} className="gap-2">
            <CalculatorIcon className="h-4 w-4" />
            Calculate
          </Button>

          {result && unlocked && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-2">
              <p className="text-sm text-slate-500 dark:text-slate-400">Age in days</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {result.days.toLocaleString()} days
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
