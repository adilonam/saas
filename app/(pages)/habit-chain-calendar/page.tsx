"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { CalendarDaysIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { useToolAccess } from "@/lib/use-tool-access";

const STORAGE_KEY = "saas-habit-chain-days";

function ymd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function loadDone(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function saveDone(set: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...set].sort()));
}

function computeStreak(done: Set<string>): number {
  const has = (s: string) => done.has(s);
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  let cur = new Date(today);
  if (!has(ymd(cur))) {
    cur.setDate(cur.getDate() - 1);
  }
  let streak = 0;
  while (has(ymd(cur))) {
    streak++;
    cur.setDate(cur.getDate() - 1);
  }
  return streak;
}

export default function HabitChainCalendarPage() {
  const { ensureAccess } = useToolAccess();
  const [unlocked, setUnlocked] = useState(false);
  const [cursorMonth, setCursorMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [done, setDone] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (unlocked) setDone(loadDone());
  }, [unlocked]);

  const streak = useMemo(() => computeStreak(done), [done]);

  const monthLabel = cursorMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const gridDays = useMemo(() => {
    const y = cursorMonth.getFullYear();
    const m = cursorMonth.getMonth();
    const first = new Date(y, m, 1);
    const startPad = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const cells: { date: Date; inMonth: boolean }[] = [];
    for (let i = 0; i < startPad; i++) {
      const d = new Date(y, m, -startPad + i + 1);
      cells.push({ date: d, inMonth: false });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ date: new Date(y, m, d, 12, 0, 0, 0), inMonth: true });
    }
    while (cells.length % 7 !== 0 || cells.length < 42) {
      const last = cells[cells.length - 1].date;
      const next = new Date(last);
      next.setDate(next.getDate() + 1);
      cells.push({ date: next, inMonth: false });
    }
    return cells;
  }, [cursorMonth]);

  const toggleDay = useCallback(
    (iso: string) => {
      setDone((prev) => {
        const next = new Set(prev);
        if (next.has(iso)) next.delete(iso);
        else next.add(iso);
        saveDone(next);
        return next;
      });
    },
    [],
  );

  const handleOpen = () => {
    if (!ensureAccess()) return;
    setUnlocked(true);
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Habit chain calendar</h1>
          <p className="mt-1 text-muted-foreground">
            Mark days you completed your habit and keep a running streak in the browser.
          </p>
        </div>

        <div className="rounded-xl border border-input bg-card p-6 space-y-4">
          <Button onClick={handleOpen} className="gap-2 w-full sm:w-auto">
            <CalendarDaysIcon className="h-4 w-4" />
            Open calendar
          </Button>
          {!unlocked && (
            <p className="text-sm text-muted-foreground">
              Sign in with an active subscription to store marks locally in this browser.
            </p>
          )}
        </div>

        {unlocked && (
          <div className="space-y-4 rounded-xl border border-input bg-muted/30 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setCursorMonth(
                      (c) => new Date(c.getFullYear(), c.getMonth() - 1, 1),
                    )
                  }
                  aria-label="Previous month"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </Button>
                <span className="min-w-[10rem] text-center font-medium">{monthLabel}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setCursorMonth(
                      (c) => new Date(c.getFullYear(), c.getMonth() + 1, 1),
                    )
                  }
                  aria-label="Next month"
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </Button>
              </div>
              <div className="rounded-lg border border-input bg-background px-4 py-2 text-sm">
                Current streak: <span className="font-semibold tabular-nums">{streak}</span>{" "}
                day{streak === 1 ? "" : "s"}
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                <div key={d} className="py-1">
                  {d}
                </div>
              ))}
              {gridDays.map(({ date, inMonth }) => {
                const key = ymd(date);
                const isDone = done.has(key);
                const isFuture = date > new Date(new Date().setHours(23, 59, 59, 999));
                return (
                  <button
                    key={key + inMonth}
                    type="button"
                    disabled={isFuture}
                    onClick={() => !isFuture && toggleDay(key)}
                    className={[
                      "aspect-square rounded-md text-sm transition-colors",
                      inMonth ? "text-foreground" : "text-muted-foreground/40",
                      isDone
                        ? "bg-emerald-600 text-white hover:bg-emerald-700"
                        : "bg-background border border-input hover:bg-muted",
                      isFuture ? "opacity-40 cursor-not-allowed" : "",
                    ].join(" ")}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>

            <p className="text-xs text-muted-foreground">
              Tip: tap a day to toggle. Data stays in <code className="text-xs">localStorage</code>{" "}
              on this device.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
