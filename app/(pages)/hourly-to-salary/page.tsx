"use client";

import { useMemo, useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ClockIcon, CalculatorIcon } from "@heroicons/react/24/outline";
import { useToolAccess } from "@/lib/use-tool-access";

export default function HourlyToSalaryPage() {
  const { ensureAccess } = useToolAccess();
  const [hourlyRate, setHourlyRate] = useState("");
  const [hoursPerWeek, setHoursPerWeek] = useState("40");
  const [weeksPerYear, setWeeksPerYear] = useState("52");
  const [unlocked, setUnlocked] = useState(false);

  const parsed = useMemo(() => {
    const rate = parseFloat(hourlyRate);
    const hpw = parseFloat(hoursPerWeek);
    const wpy = parseFloat(weeksPerYear);
    if (
      !Number.isFinite(rate) ||
      rate < 0 ||
      !Number.isFinite(hpw) ||
      hpw <= 0 ||
      !Number.isFinite(wpy) ||
      wpy <= 0
    ) {
      return null;
    }
    const annual = rate * hpw * wpy;
    const monthly = annual / 12;
    return { rate, hpw, wpy, annual, monthly };
  }, [hourlyRate, hoursPerWeek, weeksPerYear]);

  const handleCalculate = () => {
    if (!ensureAccess()) return;
    setUnlocked(true);
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
            <ClockIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Hourly to Salary Calculator</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Annual and monthly pay from hourly rate, hours per week, and weeks per year
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="rate">Hourly rate (your currency)</Label>
              <Input
                id="rate"
                type="number"
                min={0}
                step="0.01"
                inputMode="decimal"
                placeholder="e.g. 35"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                className="rounded-xl h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hpw">Hours per week</Label>
              <Input
                id="hpw"
                type="number"
                min={0}
                step="0.5"
                inputMode="decimal"
                value={hoursPerWeek}
                onChange={(e) => setHoursPerWeek(e.target.value)}
                className="rounded-xl h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wpy">Weeks per year</Label>
              <Input
                id="wpy"
                type="number"
                min={0}
                step={1}
                inputMode="numeric"
                placeholder="52 (full-time)"
                value={weeksPerYear}
                onChange={(e) => setWeeksPerYear(e.target.value)}
                className="rounded-xl h-11"
              />
            </div>
          </div>

          <Button onClick={handleCalculate} disabled={!parsed} className="gap-2">
            <CalculatorIcon className="h-4 w-4" />
            Calculate
          </Button>

          {parsed && unlocked && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-4">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Estimated annual salary</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {parsed.annual.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Estimated monthly (÷ 12)</p>
                <p className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                  {parsed.monthly.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>
          )}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-6">
          Does not deduct taxes or benefits. Adjust weeks per year for unpaid time off (e.g. 50 instead of 52).
        </p>
      </div>
    </DashboardLayout>
  );
}
