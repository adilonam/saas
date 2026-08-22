"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ClockIcon, CalculatorIcon } from "@heroicons/react/24/outline";
import { useToolAccess } from "@/lib/use-tool-access";

function parseTarget(dateStr: string, timeStr: string): Date | null {
  if (!dateStr.trim()) return null;
  const t = timeStr.trim() || "00:00";
  const d = new Date(`${dateStr}T${t}`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function splitRemaining(ms: number): {
  totalSeconds: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  past: boolean;
} {
  if (ms <= 0) {
    const s = Math.floor(Math.abs(ms) / 1000);
    return {
      totalSeconds: s,
      days: Math.floor(s / 86400),
      hours: Math.floor((s % 86400) / 3600),
      minutes: Math.floor((s % 3600) / 60),
      seconds: s % 60,
      past: true,
    };
  }
  const s = Math.floor(ms / 1000);
  return {
    totalSeconds: s,
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
    past: false,
  };
}

export default function CountdownTimerGeneratorPage() {
  const { ensureAccess } = useToolAccess();
  const [dateStr, setDateStr] = useState("");
  const [timeStr, setTimeStr] = useState("12:00");
  const [unlocked, setUnlocked] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  const target = useMemo(() => parseTarget(dateStr, timeStr), [dateStr, timeStr]);

  const tick = useCallback(() => setNow(Date.now()), []);

  useEffect(() => {
    if (!unlocked || !target) return;
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [unlocked, target, tick]);

  const remaining = useMemo(() => {
    if (!target) return null;
    return splitRemaining(target.getTime() - now);
  }, [target, now]);

  const handleStart = () => {
    if (!ensureAccess()) return;
    if (!target) return;
    setUnlocked(true);
    setNow(Date.now());
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600">
            <ClockIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Countdown Timer</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Live countdown to your target date & time (local timezone)
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="cd-date">Target date</Label>
              <Input
                id="cd-date"
                type="date"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="rounded-xl h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cd-time">Target time</Label>
              <Input
                id="cd-time"
                type="time"
                value={timeStr}
                onChange={(e) => setTimeStr(e.target.value)}
                className="rounded-xl h-11"
              />
            </div>
          </div>

          <Button onClick={handleStart} disabled={!target} className="gap-2">
            <CalculatorIcon className="h-4 w-4" />
            Start countdown
          </Button>

          {unlocked && target && remaining && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-4">
              {remaining.past ? (
                <p className="text-amber-600 dark:text-amber-400 font-medium">
                  That time is in the past — elapsed since target:
                </p>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">Time remaining</p>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(
                  [
                    ["Days", remaining.days],
                    ["Hours", remaining.hours],
                    ["Minutes", remaining.minutes],
                    ["Seconds", remaining.seconds],
                  ] as const
                ).map(([label, val]) => (
                  <div
                    key={label}
                    className="rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-600 p-4 text-center"
                  >
                    <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
                      {val}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">{label}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-500 break-all">
                Target (ISO): {target.toISOString()}
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
