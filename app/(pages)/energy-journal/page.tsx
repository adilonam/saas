"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BoltIcon } from "@heroicons/react/24/outline";
import { useToolAccess } from "@/lib/use-tool-access";

function storageKey(day: string) {
  return `saas-energy-journal-${day}`;
}

type HourMap = Record<string, number>;

function loadDay(day: string): HourMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(storageKey(day));
    if (!raw) return {};
    const o = JSON.parse(raw) as HourMap;
    return typeof o === "object" && o ? o : {};
  } catch {
    return {};
  }
}

function saveDay(day: string, map: HourMap) {
  localStorage.setItem(storageKey(day), JSON.stringify(map));
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function EnergyJournalPage() {
  const { ensureAccess } = useToolAccess();
  const [unlocked, setUnlocked] = useState(false);
  const [day, setDay] = useState(() => new Date().toISOString().slice(0, 10));
  const [scores, setScores] = useState<HourMap>({});

  useEffect(() => {
    if (unlocked) setScores(loadDay(day));
  }, [unlocked, day]);

  const handleOpen = () => {
    if (!ensureAccess()) return;
    setUnlocked(true);
  };

  const setScore = (hour: number, value: number) => {
    const v = Math.min(10, Math.max(1, Math.round(value)));
    setScores((prev) => {
      const next = { ...prev, [String(hour)]: v };
      saveDay(day, next);
      return next;
    });
  };

  const average = useMemo(() => {
    const vals = HOURS.map((h) => scores[String(h)]).filter((n) => typeof n === "number");
    if (!vals.length) return null;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  }, [scores]);

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Energy journal</h1>
          <p className="mt-1 text-muted-foreground">
            Rate focus 1–10 for each hour of the day (local time). Data is stored in this browser.
          </p>
        </div>

        <div className="rounded-xl border border-input bg-card p-6">
          <Button onClick={handleOpen} className="gap-2 w-full sm:w-auto">
            <BoltIcon className="h-4 w-4" />
            Open journal
          </Button>
        </div>

        {unlocked && (
          <div className="space-y-4 rounded-xl border border-input bg-muted/30 p-6">
            <div className="space-y-2 max-w-xs">
              <Label htmlFor="energy-day">Date</Label>
              <Input
                id="energy-day"
                type="date"
                value={day}
                onChange={(e) => setDay(e.target.value)}
              />
            </div>
            {average !== null && (
              <p className="text-sm text-muted-foreground">
                Logged-hour average:{" "}
                <span className="font-semibold tabular-nums text-foreground">
                  {average.toFixed(1)}
                </span>{" "}
                / 10
              </p>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              {HOURS.map((h) => {
                const val = scores[String(h)] ?? 5;
                return (
                  <div
                    key={h}
                    className="flex items-center gap-3 rounded-lg border border-input bg-background px-3 py-2"
                  >
                    <span className="w-14 tabular-nums text-sm text-muted-foreground">
                      {String(h).padStart(2, "0")}:00
                    </span>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={scores[String(h)] ?? 5}
                      onChange={(e) => setScore(h, Number(e.target.value))}
                      className="flex-1 accent-primary"
                    />
                    <span className="w-6 text-right text-sm font-medium tabular-nums">{val}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
