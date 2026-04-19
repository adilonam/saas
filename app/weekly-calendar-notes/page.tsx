"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CalendarIcon } from "@heroicons/react/24/outline";
import { useSubscribedToolAccess } from "@/hooks/useSubscribedToolAccess";

const STORAGE_KEY = "eprod:weekly-notes";

type WeekNotes = Record<string, string>;

function mondayOfWeek(d: Date): Date {
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const m = new Date(d);
  m.setDate(d.getDate() + diff);
  m.setHours(0, 0, 0, 0);
  return m;
}

function weekKey(anchor: Date): string {
  const m = mondayOfWeek(anchor);
  return m.toISOString().slice(0, 10);
}

function loadNotes(): WeekNotes {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const p = JSON.parse(raw) as WeekNotes;
    return typeof p === "object" && p ? p : {};
  } catch {
    return {};
  }
}

function saveNotes(n: WeekNotes) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(n));
}

export default function WeeklyCalendarNotesPage() {
  const { assertAccess } = useSubscribedToolAccess("/weekly-calendar-notes");
  const [unlocked, setUnlocked] = useState(false);
  const [anchor, setAnchor] = useState(() => new Date());
  const [byDay, setByDay] = useState<Record<string, string>>({});

  const weekId = useMemo(() => weekKey(anchor), [anchor]);

  useEffect(() => {
    if (!unlocked) return;
    const all = loadNotes();
    const days = getWeekDays(anchor);
    const next: Record<string, string> = {};
    for (const { key } of days) {
      const storageKey = `${weekId}:${key}`;
      next[key] = all[storageKey] ?? "";
    }
    setByDay(next);
  }, [unlocked, anchor, weekId]);

  const persistDay = (dayKey: string, text: string) => {
    const all = loadNotes();
    const storageKey = `${weekId}:${dayKey}`;
    const updated = { ...all, [storageKey]: text };
    saveNotes(updated);
    setByDay((prev) => ({ ...prev, [dayKey]: text }));
  };

  const handleOpen = () => {
    if (!assertAccess()) return;
    setUnlocked(true);
  };

  const days = getWeekDays(anchor);

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Weekly calendar notes</h1>
          <p className="mt-1 text-muted-foreground">
            Monday–Sunday grid for the selected week. Each cell is saved locally.
          </p>
        </div>

        {!unlocked ? (
          <div className="rounded-xl border border-input bg-card p-6 space-y-4">
            <Button onClick={handleOpen} className="gap-2">
              <CalendarIcon className="h-4 w-4" />
              Open week view
            </Button>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const n = new Date(anchor);
                  n.setDate(n.getDate() - 7);
                  setAnchor(n);
                }}
              >
                Previous week
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAnchor(new Date())}
              >
                This week
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const n = new Date(anchor);
                  n.setDate(n.getDate() + 7);
                  setAnchor(n);
                }}
              >
                Next week
              </Button>
              <span className="text-sm text-muted-foreground">
                Week of {mondayOfWeek(anchor).toLocaleDateString()}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
              {days.map(({ key, label, date }) => (
                <div
                  key={key}
                  className="rounded-xl border border-input bg-card p-3 flex flex-col min-h-[180px]"
                >
                  <Label className="text-xs font-semibold text-muted-foreground mb-1">
                    {label}
                  </Label>
                  <p className="text-xs text-muted-foreground mb-2">{date}</p>
                  <textarea
                    className="flex-1 min-h-[120px] w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm resize-y focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="Notes…"
                    value={byDay[key] ?? ""}
                    onChange={(e) => persistDay(key, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

function getWeekDays(anchor: Date) {
  const mon = mondayOfWeek(anchor);
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return labels.map((label, i) => {
    const d = new Date(mon);
    d.setDate(mon.getDate() + i);
    return {
      key: label.toLowerCase(),
      label,
      date: d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
    };
  });
}
