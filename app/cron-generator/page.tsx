"use client";

import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ClockIcon } from "@heroicons/react/24/outline";

const PRESETS = [
  { label: "Every minute", cron: "* * * * *" },
  { label: "Every 5 minutes", cron: "*/5 * * * *" },
  { label: "Every hour", cron: "0 * * * *" },
  { label: "Daily at midnight", cron: "0 0 * * *" },
  { label: "Weekly (Sunday 00:00)", cron: "0 0 * * 0" },
  { label: "Monthly (1st 00:00)", cron: "0 0 1 * *" },
];

export default function CronGeneratorPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [minute, setMinute] = useState("*");
  const [hour, setHour] = useState("*");
  const [dayOfMonth, setDayOfMonth] = useState("*");
  const [month, setMonth] = useState("*");
  const [dayOfWeek, setDayOfWeek] = useState("*");
  const [resultUnlocked, setResultUnlocked] = useState(false);

  const cronExpression = useMemo(
    () => `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`,
    [minute, hour, dayOfMonth, month, dayOfWeek]
  );

  const handleGenerate = () => {
    if (status === "unauthenticated" || !session) {
      router.push(`/signup?callbackUrl=${encodeURIComponent(pathname || "/cron-generator")}`);
      return;
    }
    const hasActiveSubscription =
      session.user.subscriptionExpiresAt &&
      new Date(session.user.subscriptionExpiresAt) > new Date();
    if (!hasActiveSubscription) {
      router.push("/pricing");
      return;
    }
    setResultUnlocked(true);
  };

  const applyPreset = (cron: string) => {
    const parts = cron.split(" ");
    if (parts.length >= 5) {
      setMinute(parts[0]);
      setHour(parts[1]);
      setDayOfMonth(parts[2]);
      setMonth(parts[3]);
      setDayOfWeek(parts[4]);
      setResultUnlocked(true);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">
            <ClockIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Cron Job Expression Generator</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Build cron expressions: minute hour day month weekday
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minute">Minute (0-59)</Label>
              <Input
                id="minute"
                value={minute}
                onChange={(e) => setMinute(e.target.value)}
                placeholder="* or */5"
                className="rounded-xl h-11 font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hour">Hour (0-23)</Label>
              <Input
                id="hour"
                value={hour}
                onChange={(e) => setHour(e.target.value)}
                placeholder="* or 0"
                className="rounded-xl h-11 font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="day">Day of month (1-31)</Label>
              <Input
                id="day"
                value={dayOfMonth}
                onChange={(e) => setDayOfMonth(e.target.value)}
                placeholder="* or 1"
                className="rounded-xl h-11 font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="month">Month (1-12)</Label>
              <Input
                id="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                placeholder="*"
                className="rounded-xl h-11 font-mono"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="dow">Day of week (0-7, 0 and 7 = Sunday)</Label>
              <Input
                id="dow"
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(e.target.value)}
                placeholder="* or 0-6"
                className="rounded-xl h-11 font-mono"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button onClick={handleGenerate} className="gap-2">
              <ClockIcon className="h-4 w-4" />
              Generate
            </Button>
          </div>

          {resultUnlocked && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-4">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Cron expression</p>
                <p className="text-xl font-mono font-bold text-slate-900 dark:text-white bg-slate-200/50 dark:bg-slate-800/50 px-4 py-2 rounded-xl inline-block">
                  {cronExpression}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Presets</p>
                <div className="flex flex-wrap gap-2">
                  {PRESETS.map(({ label, cron }) => (
                    <button
                      key={cron}
                      type="button"
                      onClick={() => applyPreset(cron)}
                      className="px-3 py-1.5 rounded-lg text-sm bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mt-6">
          Format: minute hour day-of-month month day-of-week. Use * for any, */n for every n, ranges with -.
        </p>
      </div>
    </DashboardLayout>
  );
}
