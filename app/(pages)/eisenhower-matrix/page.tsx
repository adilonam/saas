"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Squares2X2Icon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useSubscribedToolAccess } from "@/hooks/useSubscribedToolAccess";

const STORAGE_KEY = "eprod:eisenhower";

type Quadrant = "q1" | "q2" | "q3" | "q4";

type Task = { id: string; text: string; quadrant: Quadrant };

const QUADRANTS: { id: Quadrant; title: string; subtitle: string; className: string }[] = [
  {
    id: "q1",
    title: "Do first",
    subtitle: "Urgent & important",
    className: "border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20",
  },
  {
    id: "q2",
    title: "Schedule",
    subtitle: "Important, not urgent",
    className: "border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20",
  },
  {
    id: "q3",
    title: "Delegate",
    subtitle: "Urgent, not important",
    className: "border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20",
  },
  {
    id: "q4",
    title: "Eliminate",
    subtitle: "Neither",
    className: "border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30",
  },
];

function loadTasks(): Task[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const p = JSON.parse(raw) as Task[];
    return Array.isArray(p) ? p : [];
  } catch {
    return [];
  }
}

function saveTasks(t: Task[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(t.slice(0, 200)));
}

export default function EisenhowerMatrixPage() {
  const { assertAccess } = useSubscribedToolAccess("/eisenhower-matrix");
  const [unlocked, setUnlocked] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [draft, setDraft] = useState("");
  const [draftQ, setDraftQ] = useState<Quadrant>("q1");

  useEffect(() => {
    if (unlocked) setTasks(loadTasks());
  }, [unlocked]);

  const persist = (next: Task[]) => {
    setTasks(next);
    saveTasks(next);
  };

  const handleOpen = () => {
    if (!assertAccess()) return;
    setUnlocked(true);
  };

  const addTask = () => {
    const text = draft.trim();
    if (!text) return;
    persist([
      ...tasks,
      { id: crypto.randomUUID(), text, quadrant: draftQ },
    ]);
    setDraft("");
  };

  const move = (id: string, quadrant: Quadrant) => {
    persist(tasks.map((t) => (t.id === id ? { ...t, quadrant } : t)));
  };

  const remove = (id: string) => {
    persist(tasks.filter((t) => t.id !== id));
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Eisenhower matrix</h1>
          <p className="mt-1 text-muted-foreground">
            Place tasks by urgency and importance. Everything stays in this browser.
          </p>
        </div>

        {!unlocked ? (
          <div className="rounded-xl border border-input bg-card p-6">
            <Button onClick={handleOpen} className="gap-2">
              <Squares2X2Icon className="h-4 w-4" />
              Open matrix
            </Button>
          </div>
        ) : (
          <>
            <div className="rounded-xl border border-input bg-card p-4 space-y-3">
              <Label htmlFor="task">New task</Label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  id="task"
                  placeholder="What needs attention?"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTask())}
                  className="flex-1"
                />
                <select
                  value={draftQ}
                  onChange={(e) => setDraftQ(e.target.value as Quadrant)}
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  {QUADRANTS.map((q) => (
                    <option key={q.id} value={q.id}>
                      {q.title}
                    </option>
                  ))}
                </select>
                <Button type="button" onClick={addTask} className="gap-1 shrink-0">
                  <PlusIcon className="h-4 w-4" />
                  Add
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {QUADRANTS.map((q) => (
                <div
                  key={q.id}
                  className={`rounded-xl border p-4 space-y-3 min-h-[200px] ${q.className}`}
                >
                  <div>
                    <h2 className="font-semibold">{q.title}</h2>
                    <p className="text-xs text-muted-foreground">{q.subtitle}</p>
                  </div>
                  <ul className="space-y-2">
                    {tasks
                      .filter((t) => t.quadrant === q.id)
                      .map((t) => (
                        <li
                          key={t.id}
                          className="rounded-lg border border-input bg-background/80 p-2 text-sm space-y-2"
                        >
                          <p>{t.text}</p>
                          <div className="flex flex-wrap gap-1 items-center">
                            <select
                              value={t.quadrant}
                              onChange={(e) => move(t.id, e.target.value as Quadrant)}
                              className="h-8 flex-1 min-w-[120px] rounded-md border border-input bg-background px-2 text-xs"
                            >
                              {QUADRANTS.map((opt) => (
                                <option key={opt.id} value={opt.id}>
                                  {opt.title}
                                </option>
                              ))}
                            </select>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => remove(t.id)}
                              aria-label="Remove task"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </li>
                      ))}
                  </ul>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
