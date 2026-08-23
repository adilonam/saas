"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CalendarDaysIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { guardToolAccess } from "@/lib/guard-tool-access";
import { computeFiscalWeek, type FiscalWeekResult } from "@/lib/fiscal-week";

const PAGE = "/fiscal-week-calculator";

export default function FiscalWeekCalculatorPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [refYmd, setRefYmd] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });
  const [fiscalMonth, setFiscalMonth] = useState(10);
  const [fiscalDay, setFiscalDay] = useState(1);
  const [weekStartsMonday, setWeekStartsMonday] = useState(true);
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FiscalWeekResult | null>(null);

  const handleSubmit = () => {
    if (!guardToolAccess(status, session, pathname, PAGE, router)) return;
    const [y, m, d] = refYmd.split("-").map(Number);
    const ref = new Date(y, (m ?? 1) - 1, d ?? 1);
    const r = computeFiscalWeek(ref, {
      fiscalStartMonth: fiscalMonth,
      fiscalStartDay: fiscalDay,
      weekStartsMonday,
    });
    if ("error" in r) {
      setError(r.error);
      setResult(null);
      setUnlocked(false);
      return;
    }
    setError(null);
    setResult(r);
    setUnlocked(true);
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600">
            <CalendarDaysIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Fiscal week calculator</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Fiscal year starts on the same calendar month/day each year; week 1 is the week that contains that start.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="ref">Reference date (local)</Label>
            <Input id="ref" type="date" value={refYmd} onChange={(e) => { setRefYmd(e.target.value); setUnlocked(false); }} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fm">Fiscal start month</Label>
              <Input
                id="fm"
                type="number"
                min={1}
                max={12}
                value={fiscalMonth}
                onChange={(e) => { setFiscalMonth(Number(e.target.value) || 1); setUnlocked(false); }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fd">Fiscal start day</Label>
              <Input
                id="fd"
                type="number"
                min={1}
                max={31}
                value={fiscalDay}
                onChange={(e) => { setFiscalDay(Number(e.target.value) || 1); setUnlocked(false); }}
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={weekStartsMonday}
              onChange={(e) => { setWeekStartsMonday(e.target.checked); setUnlocked(false); }}
            />
            Weeks start on Monday (off = Sunday)
          </label>

          <Button onClick={handleSubmit} className="gap-2">
            <CalendarDaysIcon className="h-4 w-4" />
            Compute
          </Button>

          {error && (
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm">
              <ExclamationTriangleIcon className="size-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {unlocked && result && (
            <dl className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-3 text-sm">
              <div>
                <dt className="text-slate-500 dark:text-slate-400 text-xs">Fiscal year label</dt>
                <dd className="font-medium text-slate-900 dark:text-white">{result.fiscalYearLabel}</dd>
              </div>
              <div>
                <dt className="text-slate-500 dark:text-slate-400 text-xs">Fiscal year start (local)</dt>
                <dd className="font-mono">{result.fiscalYearStart.toLocaleDateString()}</dd>
              </div>
              <div>
                <dt className="text-slate-500 dark:text-slate-400 text-xs">Week number</dt>
                <dd className="text-2xl font-bold text-slate-900 dark:text-white">{result.weekNumber}</dd>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <dt className="text-slate-500 dark:text-slate-400 text-xs">Week start (local)</dt>
                  <dd className="font-mono">{result.weekStart.toLocaleDateString()}</dd>
                </div>
                <div>
                  <dt className="text-slate-500 dark:text-slate-400 text-xs">Week end (local)</dt>
                  <dd className="font-mono">{result.weekEnd.toLocaleDateString()}</dd>
                </div>
              </div>
            </dl>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
