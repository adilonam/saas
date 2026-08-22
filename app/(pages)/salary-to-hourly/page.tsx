"use client";

import { useMemo, useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { BanknotesIcon, CalculatorIcon } from "@heroicons/react/24/outline";
import { useToolAccess } from "@/lib/use-tool-access";

export default function SalaryToHourlyPage() {
  const { ensureAccess } = useToolAccess();
  const [annualSalary, setAnnualSalary] = useState("");
  const [hoursPerWeek, setHoursPerWeek] = useState("40");
  const [weeksPerYear, setWeeksPerYear] = useState("52");
  const [unlocked, setUnlocked] = useState(false);

  const parsed = useMemo(() => {
    const annual = parseFloat(annualSalary);
    const hpw = parseFloat(hoursPerWeek);
    const wpy = parseFloat(weeksPerYear);
    if (
      !Number.isFinite(annual) ||
      annual < 0 ||
      !Number.isFinite(hpw) ||
      hpw <= 0 ||
      !Number.isFinite(wpy) ||
      wpy <= 0
    ) {
      return null;
    }
    const totalHours = hpw * wpy;
    const hourly = annual / totalHours;
    return { annual, hpw, wpy, totalHours, hourly };
  }, [annualSalary, hoursPerWeek, weeksPerYear]);

  const handleCalculate = () => {
    if (!ensureAccess()) return;
    setUnlocked(true);
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600">
            <BanknotesIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Salary to Hourly Calculator</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Equivalent hourly pay from gross annual salary and your work schedule
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="annual">Annual salary (gross, your currency)</Label>
            <Input
              id="annual"
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              placeholder="e.g. 75000"
              value={annualSalary}
              onChange={(e) => setAnnualSalary(e.target.value)}
              className="rounded-xl h-11"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
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
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-3">
              <p className="text-sm text-slate-500 dark:text-slate-400">Equivalent hourly rate</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {parsed.hourly.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Based on {parsed.totalHours.toLocaleString()} working hours per year (
                {parsed.hpw} × {parsed.wpy})
              </p>
            </div>
          )}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-6">
          Uses gross salary only. For take-home, use the salary after tax calculator.
        </p>
      </div>
    </DashboardLayout>
  );
}
