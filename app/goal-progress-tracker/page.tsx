"use client";

import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FlagIcon, CalculatorIcon } from "@heroicons/react/24/outline";

export default function GoalProgressTrackerPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [goalName, setGoalName] = useState("");
  const [targetValue, setTargetValue] = useState("");
  const [currentValue, setCurrentValue] = useState("");
  const [unit, setUnit] = useState("");
  const [resultUnlocked, setResultUnlocked] = useState(false);

  const handleSubmit = () => {
    if (status === "unauthenticated" || !session) {
      router.push(
        `/signup?callbackUrl=${encodeURIComponent(pathname || "/goal-progress-tracker")}`,
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

  const result = useMemo(() => {
    const target = parseFloat(targetValue) || 0;
    const current = parseFloat(currentValue) || 0;
    if (target <= 0) return null;
    const pct = Math.min(100, (current / target) * 100);
    const remaining = Math.max(0, target - current);
    return { pct, remaining, target, current };
  }, [targetValue, currentValue]);

  const hasValidInput =
    (parseFloat(targetValue) || 0) > 0 &&
    (parseFloat(currentValue) || 0) >= 0;

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
            <FlagIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Goal Progress Tracker</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Track progress toward a numeric goal with a visual bar
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="goal-name">Goal name (optional)</Label>
            <Input
              id="goal-name"
              type="text"
              placeholder="e.g. Save for vacation"
              value={goalName}
              onChange={(e) => setGoalName(e.target.value)}
              className="rounded-xl h-11"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="target">Target</Label>
              <Input
                id="target"
                type="number"
                min="0"
                step="any"
                placeholder="e.g. 10000"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                className="rounded-xl h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="current">Current</Label>
              <Input
                id="current"
                type="number"
                min="0"
                step="any"
                placeholder="e.g. 4000"
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                className="rounded-xl h-11"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="unit">Unit (optional)</Label>
            <Input
              id="unit"
              type="text"
              placeholder="e.g. $, miles, kg"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="rounded-xl h-11"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button onClick={handleSubmit} disabled={!hasValidInput} className="gap-2">
              <CalculatorIcon className="h-4 w-4" />
              Update progress
            </Button>
          </div>

          {result != null && hasValidInput && resultUnlocked && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-4">
              {goalName.trim() && (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Goal: <span className="font-medium text-slate-900 dark:text-white">{goalName}</span>
                </p>
              )}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-300">
                    {result.pct.toFixed(1)}% complete
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">
                    {result.current.toLocaleString()}{unit ? ` ${unit}` : ""} / {result.target.toLocaleString()}{unit ? ` ${unit}` : ""}
                  </span>
                </div>
                <div className="h-4 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-500 dark:bg-blue-400 transition-all duration-500"
                    style={{ width: `${result.pct}%` }}
                  />
                </div>
              </div>
              {result.remaining > 0 && (
                <p className="text-slate-600 dark:text-slate-300 text-sm">
                  {result.remaining.toLocaleString()}{unit ? ` ${unit}` : ""} left to reach your goal.
                </p>
              )}
              {result.pct >= 100 && (
                <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                  Goal reached!
                </p>
              )}
            </div>
          )}
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mt-6">
          Enter your target and current value (e.g. savings, distance, weight) to see progress at a glance.
        </p>
      </div>
    </DashboardLayout>
  );
}
