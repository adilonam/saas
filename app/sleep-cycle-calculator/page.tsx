"use client";

import { useMemo, useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MoonIcon, CalculatorIcon } from "@heroicons/react/24/outline";
import { useToolAccess } from "@/lib/use-tool-access";

const CYCLE_MIN = 90;
const FALL_ASLEEP_MIN = 15;

function addMinutes(d: Date, mins: number): Date {
  return new Date(d.getTime() + mins * 60000);
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function SleepCycleCalculatorPage() {
  const { ensureAccess } = useToolAccess();
  const [wakeTime, setWakeTime] = useState("07:00");
  const [unlocked, setUnlocked] = useState(false);

  const suggestions = useMemo(() => {
    const [h, m] = wakeTime.split(":").map((x) => parseInt(x, 10));
    if (!Number.isFinite(h) || !Number.isFinite(m) || h < 0 || h > 23 || m < 0 || m > 59) {
      return null;
    }
    const base = new Date();
    base.setHours(h, m, 0, 0);
    const beds: { cycles: number; at: Date }[] = [];
    for (let c = 6; c >= 4; c--) {
      const sleepStart = addMinutes(base, -(c * CYCLE_MIN + FALL_ASLEEP_MIN));
      beds.push({ cycles: c, at: sleepStart });
    }
    return { wakeAt: base, beds };
  }, [wakeTime]);

  const handleCalculate = () => {
    if (!ensureAccess()) return;
    setUnlocked(true);
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
            <MoonIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Sleep Cycle Calculator</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              ~90 minute cycles + ~{FALL_ASLEEP_MIN} min to fall asleep before first cycle
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="wake">Target wake time</Label>
            <Input
              id="wake"
              type="time"
              value={wakeTime}
              onChange={(e) => setWakeTime(e.target.value)}
              className="rounded-xl h-11"
            />
          </div>

          <Button onClick={handleCalculate} disabled={!suggestions} className="gap-2">
            <CalculatorIcon className="h-4 w-4" />
            Calculate
          </Button>

          {suggestions && unlocked && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Aim to be asleep around (for wake {formatTime(suggestions.wakeAt)})
              </p>
              <ul className="space-y-3">
                {suggestions.beds.map(({ cycles, at }) => (
                  <li
                    key={cycles}
                    className="flex justify-between items-center rounded-xl border border-slate-200 dark:border-slate-600 px-4 py-3 bg-white/60 dark:bg-slate-800/40"
                  >
                    <span className="font-medium text-slate-900 dark:text-white">
                      {cycles} cycles (~{cycles * CYCLE_MIN / 60}h sleep)
                    </span>
                    <span className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
                      {formatTime(at)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-6">
          For planning only — not medical advice. Individual sleep architecture varies.
        </p>
      </div>
    </DashboardLayout>
  );
}
