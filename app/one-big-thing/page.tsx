"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LightBulbIcon } from "@heroicons/react/24/outline";
import { useToolAccess } from "@/lib/use-tool-access";

const STORAGE_KEY = "saas-one-big-thing-log";

type Entry = { date: string; thing: string };

function loadLog(): Entry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as Entry[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function saveLog(entries: Entry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export default function OneBigThingPage() {
  const { ensureAccess } = useToolAccess();
  const [unlocked, setUnlocked] = useState(false);
  const [date, setDate] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });
  const [thing, setThing] = useState("");
  const [log, setLog] = useState<Entry[]>([]);

  useEffect(() => {
    if (unlocked) setLog(loadLog());
  }, [unlocked]);

  const handleOpen = () => {
    if (!ensureAccess()) return;
    setUnlocked(true);
  };

  const handleSave = () => {
    if (!ensureAccess()) return;
    const t = thing.trim();
    if (!t) return;
    const next = [{ date, thing: t }, ...log.filter((e) => e.date !== date)];
    next.sort((a, b) => (a.date < b.date ? 1 : -1));
    setLog(next);
    saveLog(next);
    setThing("");
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">One big thing</h1>
          <p className="mt-1 text-muted-foreground">
            Pick a single daily focus so priorities stay obvious.
          </p>
        </div>

        <div className="rounded-xl border border-input bg-card p-6 space-y-4">
          <Button onClick={handleOpen} className="gap-2 w-full sm:w-auto">
            <LightBulbIcon className="h-4 w-4" />
            Start planner
          </Button>
        </div>

        {unlocked && (
          <div className="space-y-6 rounded-xl border border-input bg-muted/30 p-6">
            <div className="space-y-2">
              <Label htmlFor="obt-date">Day</Label>
              <Input
                id="obt-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="obt-thing">Today&apos;s one big thing</Label>
              <textarea
                id="obt-thing"
                rows={4}
                placeholder="Ship the invoice export fix, finish the deck outline, etc."
                value={thing}
                onChange={(e) => setThing(e.target.value)}
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <Button onClick={handleSave} className="gap-2 w-full sm:w-auto">
              Save for this day
            </Button>

            <div className="border-t border-input pt-4">
              <h2 className="text-sm font-medium text-muted-foreground mb-3">Recent days</h2>
              <ul className="space-y-3">
                {log.length === 0 && (
                  <li className="text-sm text-muted-foreground">No entries yet.</li>
                )}
                {log.slice(0, 14).map((e) => (
                  <li
                    key={e.date}
                    className="rounded-lg border border-input bg-background p-3 text-sm"
                  >
                    <p className="font-medium text-foreground">{e.date}</p>
                    <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{e.thing}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
