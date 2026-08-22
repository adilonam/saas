"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarDaysIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useSubscribedToolAccess } from "@/hooks/useSubscribedToolAccess";

const STORAGE_KEY = "eprod:daily-blocks";

type Block = { id: string; start: string; end: string; label: string };

function loadBlocks(): Block[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const p = JSON.parse(raw) as Block[];
    return Array.isArray(p) ? p : [];
  } catch {
    return [];
  }
}

function saveBlocks(blocks: Block[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(blocks.slice(0, 80)));
}

export default function DailyTimeBlockPlannerPage() {
  const { assertAccess } = useSubscribedToolAccess("/daily-time-block-planner");
  const [unlocked, setUnlocked] = useState(false);
  const [blocks, setBlocks] = useState<Block[]>([]);

  useEffect(() => {
    if (unlocked) setBlocks(loadBlocks());
  }, [unlocked]);

  const persist = (next: Block[]) => {
    setBlocks(next);
    saveBlocks(next);
  };

  const handleOpen = () => {
    if (!assertAccess()) return;
    setUnlocked(true);
    const existing = loadBlocks();
    if (existing.length === 0) {
      persist([
        {
          id: crypto.randomUUID(),
          start: "09:00",
          end: "10:00",
          label: "Deep work",
        },
        {
          id: crypto.randomUUID(),
          start: "10:15",
          end: "11:00",
          label: "Meetings",
        },
      ]);
    } else {
      setBlocks(existing);
    }
  };

  const addRow = () => {
    persist([
      ...blocks,
      { id: crypto.randomUUID(), start: "12:00", end: "13:00", label: "" },
    ]);
  };

  const removeRow = (id: string) => {
    persist(blocks.filter((b) => b.id !== id));
  };

  const updateRow = (id: string, patch: Partial<Block>) => {
    persist(blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Daily time block planner</h1>
          <p className="mt-1 text-muted-foreground">
            Sketch your day with start, end, and labels. Stored only in this browser.
          </p>
        </div>

        {!unlocked ? (
          <div className="rounded-xl border border-input bg-card p-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              You can edit rows, add blocks, and remove them. Data persists locally after you
              open the planner.
            </p>
            <Button onClick={handleOpen} className="gap-2">
              <CalendarDaysIcon className="h-4 w-4" />
              Open planner
            </Button>
          </div>
        ) : (
          <div className="rounded-xl border border-input bg-card p-6 space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <Label className="text-base font-medium">Today&apos;s blocks</Label>
              <Button type="button" variant="outline" size="sm" onClick={addRow} className="gap-1">
                <PlusIcon className="h-4 w-4" />
                Add block
              </Button>
            </div>
            <div className="space-y-3">
              {blocks.map((b) => (
                <div
                  key={b.id}
                  className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_2fr_auto] gap-2 items-end"
                >
                  <div className="space-y-1">
                    <Label className="text-xs">Start</Label>
                    <Input
                      type="time"
                      value={b.start}
                      onChange={(e) => updateRow(b.id, { start: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">End</Label>
                    <Input
                      type="time"
                      value={b.end}
                      onChange={(e) => updateRow(b.id, { end: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-1 col-span-full">
                    <Label className="text-xs">Label</Label>
                    <Input
                      placeholder="What is this block for?"
                      value={b.label}
                      onChange={(e) => updateRow(b.id, { label: e.target.value })}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="justify-self-end"
                    onClick={() => removeRow(b.id)}
                    aria-label="Remove block"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
