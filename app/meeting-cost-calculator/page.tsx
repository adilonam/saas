"use client";

import { useMemo, useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { UserGroupIcon, CalculatorIcon } from "@heroicons/react/24/outline";
import { useToolAccess } from "@/lib/use-tool-access";

export default function MeetingCostCalculatorPage() {
  const { ensureAccess } = useToolAccess();
  const [hourlyRate, setHourlyRate] = useState("");
  const [attendees, setAttendees] = useState("");
  const [durationHours, setDurationHours] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  const parsed = useMemo(() => {
    const rate = parseFloat(hourlyRate);
    const n = parseInt(attendees, 10);
    const hours = parseFloat(durationHours);
    if (
      !Number.isFinite(rate) ||
      rate < 0 ||
      !Number.isFinite(n) ||
      n < 1 ||
      !Number.isFinite(hours) ||
      hours <= 0
    ) {
      return null;
    }
    const totalPerHour = rate * n;
    const totalCost = totalPerHour * hours;
    const perMinute = totalPerHour / 60;
    return { rate, n, hours, totalPerHour, totalCost, perMinute };
  }, [hourlyRate, attendees, durationHours]);

  const handleCalculate = () => {
    if (!ensureAccess()) return;
    setUnlocked(true);
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600">
            <UserGroupIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Meeting Cost Calculator</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Combined hourly cost × duration from rate per person and headcount
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="rate">Hourly rate per person (same currency)</Label>
              <Input
                id="rate"
                type="number"
                min={0}
                step="0.01"
                inputMode="decimal"
                placeholder="e.g. 75"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                className="rounded-xl h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="attendees">Number of attendees</Label>
              <Input
                id="attendees"
                type="number"
                min={1}
                step={1}
                inputMode="numeric"
                placeholder="e.g. 8"
                value={attendees}
                onChange={(e) => setAttendees(e.target.value)}
                className="rounded-xl h-11"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="duration">Meeting duration (hours)</Label>
            <Input
              id="duration"
              type="number"
              min={0}
              step="0.25"
              inputMode="decimal"
              placeholder="e.g. 1.5"
              value={durationHours}
              onChange={(e) => setDurationHours(e.target.value)}
              className="rounded-xl h-11"
            />
          </div>

          <Button
            onClick={handleCalculate}
            disabled={!parsed}
            className="gap-2"
          >
            <CalculatorIcon className="h-4 w-4" />
            Calculate
          </Button>

          {parsed && unlocked && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-3">
              <p className="text-sm text-slate-500 dark:text-slate-400">Estimated meeting cost</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {parsed.totalCost.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              <div className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
                <p>
                  Cost per hour (all attendees):{" "}
                  {parsed.totalPerHour.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
                <p>
                  Cost per minute (all attendees):{" "}
                  {parsed.perMinute.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>
          )}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-6">
          Uses a simple model: sum of hourly rates × hours. Does not include room or tooling costs.
        </p>
      </div>
    </DashboardLayout>
  );
}
