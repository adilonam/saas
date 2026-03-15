"use client";

import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FireIcon, CalculatorIcon } from "@heroicons/react/24/outline";

function parseDate(value: string): Date | null {
  if (!value.trim()) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function toDateKey(d: Date): string {
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

function daysBetween(from: Date, to: Date): number {
  const a = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const b = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

export default function HabitStreakTrackerPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [habitName, setHabitName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [lastCompletedDate, setLastCompletedDate] = useState("");
  const [resultUnlocked, setResultUnlocked] = useState(false);

  const handleSubmit = () => {
    if (status === "unauthenticated" || !session) {
      router.push(
        `/signup?callbackUrl=${encodeURIComponent(pathname || "/habit-streak-tracker")}`,
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
    setResultUnlocked(true);
  };

  const todayKey = useMemo(() => {
    const d = new Date();
    return toDateKey(d);
  }, []);

  const streakInfo = useMemo(() => {
    const start = parseDate(startDate);
    const last = lastCompletedDate.trim() ? parseDate(lastCompletedDate) : null;
    const today = new Date();
    if (!start || start > today) return null;
    const lastOrToday = last && last <= today ? last : today;
    if (lastOrToday < start) return null;
    const streakDays = daysBetween(start, lastOrToday) + 1;
    const daysAgo = daysBetween(lastOrToday, today);
    const isBroken = daysAgo > 1;
    const currentStreak = isBroken ? 0 : daysBetween(lastOrToday, today) === 0 ? streakDays : 0;
    return {
      streakDays,
      lastCompleted: lastOrToday,
      isBroken,
      currentStreak: isBroken ? 0 : streakDays,
      daysSinceLast: daysBetween(lastOrToday, today),
    };
  }, [startDate, lastCompletedDate]);

  const hasValidInput = !!parseDate(startDate);

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600">
            <FireIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Habit Streak Tracker</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Track your habit start date and see your streak
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="habit-name">Habit name (optional)</Label>
            <Input
              id="habit-name"
              type="text"
              placeholder="e.g. Morning run"
              value={habitName}
              onChange={(e) => setHabitName(e.target.value)}
              className="rounded-xl h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="start-date">Start date</Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-xl h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last-completed">Last completed date (optional)</Label>
            <Input
              id="last-completed"
              type="date"
              value={lastCompletedDate}
              onChange={(e) => setLastCompletedDate(e.target.value)}
              className="rounded-xl h-11"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Leave empty to assume you completed it today. If you missed a day, set the last day you did it.
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <Button onClick={handleSubmit} disabled={!hasValidInput} className="gap-2">
              <CalculatorIcon className="h-4 w-4" />
              Show streak
            </Button>
          </div>

          {streakInfo != null && hasValidInput && resultUnlocked && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-3">
              {habitName.trim() && (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Habit: <span className="font-medium text-slate-900 dark:text-white">{habitName}</span>
                </p>
              )}
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {streakInfo.isBroken
                  ? `Streak broken — ${streakInfo.daysSinceLast} day(s) since last`
                  : `${streakInfo.currentStreak} day streak`}
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                Started {startDate}. Last completed: {toDateKey(streakInfo.lastCompleted)}.
                {streakInfo.isBroken && " Log again to start a new streak."}
              </p>
            </div>
          )}
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mt-6">
          Set your habit start date and optionally the last day you completed it to see your current streak.
        </p>
      </div>
    </DashboardLayout>
  );
}
