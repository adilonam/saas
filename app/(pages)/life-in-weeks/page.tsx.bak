"use client";

import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CalendarDaysIcon, CalculatorIcon } from "@heroicons/react/24/outline";

const WEEKS_PER_YEAR = 52;
const DEFAULT_LIFE_YEARS = 90;

function parseDate(value: string): Date | null {
  if (!value.trim()) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function weeksBetween(from: Date, to: Date): number {
  const a = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const b = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.max(0, Math.floor((b.getTime() - a.getTime()) / (7 * 24 * 60 * 60 * 1000)));
}

export default function LifeInWeeksPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [birthDate, setBirthDate] = useState("");
  const [lifeExpectancy, setLifeExpectancy] = useState(String(DEFAULT_LIFE_YEARS));
  const [resultUnlocked, setResultUnlocked] = useState(false);

  const handleSubmit = () => {
    if (status === "unauthenticated" || !session) {
      router.push(
        `/signup?callbackUrl=${encodeURIComponent(pathname || "/life-in-weeks")}`,
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

  const stats = useMemo(() => {
    const birth = parseDate(birthDate);
    if (!birth) return null;
    const years = Math.min(120, Math.max(1, parseInt(lifeExpectancy, 10) || DEFAULT_LIFE_YEARS));
    const totalWeeks = years * WEEKS_PER_YEAR;
    const endDate = new Date(birth);
    endDate.setFullYear(endDate.getFullYear() + years);
    const now = new Date();
    const livedWeeks = weeksBetween(birth, now);
    const remainingWeeks = Math.max(0, totalWeeks - livedWeeks);
    const livedPct = Math.min(100, (livedWeeks / totalWeeks) * 100);
    return {
      totalWeeks,
      livedWeeks,
      remainingWeeks,
      livedPct,
      endDate,
    };
  }, [birthDate, lifeExpectancy]);

  const hasValidInput = !!parseDate(birthDate);

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600">
            <CalendarDaysIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Life in Weeks Visualizer</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              One square per week of your life. See how many you&apos;ve used.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="birth-date">Birth date</Label>
            <Input
              id="birth-date"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="rounded-xl h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="life-years">Life expectancy (years)</Label>
            <Input
              id="life-years"
              type="number"
              min="1"
              max="120"
              placeholder="90"
              value={lifeExpectancy}
              onChange={(e) => setLifeExpectancy(e.target.value)}
              className="rounded-xl h-11"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button onClick={handleSubmit} disabled={!hasValidInput} className="gap-2">
              <CalculatorIcon className="h-4 w-4" />
              Show my life in weeks
            </Button>
          </div>

          {stats != null && hasValidInput && resultUnlocked && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                You&apos;ve lived <span className="font-semibold text-slate-900 dark:text-white">{stats.livedWeeks}</span> weeks
                ({stats.livedPct.toFixed(1)}%) · {stats.remainingWeeks} weeks left (approx.)
              </p>
              <div className="flex flex-wrap gap-0.5">
                {Array.from({ length: stats.totalWeeks }, (_, i) => (
                  <div
                    key={i}
                    className={`size-2 sm:size-2.5 rounded-sm ${
                      i < stats.livedWeeks
                        ? "bg-violet-500 dark:bg-violet-400"
                        : "bg-slate-200 dark:bg-slate-700"
                    }`}
                    title={
                      i < stats.livedWeeks
                        ? `Week ${i + 1} (lived)`
                        : `Week ${i + 1} (remaining)`
                    }
                  />
                ))}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Each square = 1 week. Filled = already lived. Empty = remaining (assuming {lifeExpectancy || DEFAULT_LIFE_YEARS} years).
              </p>
            </div>
          )}
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mt-6">
          A visual reminder of how many weeks you have. Use them well.
        </p>
      </div>
    </DashboardLayout>
  );
}
