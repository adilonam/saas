"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ViewColumnsIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useSubscribedToolAccess } from "@/hooks/useSubscribedToolAccess";

const STORAGE_KEY = "eprod:personal-kanban";

type Column = "todo" | "doing" | "done";

type Card = { id: string; text: string; column: Column };

const COLUMNS: { id: Column; title: string }[] = [
  { id: "todo", title: "To do" },
  { id: "doing", title: "Doing" },
  { id: "done", title: "Done" },
];

function loadCards(): Card[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const p = JSON.parse(raw) as Card[];
    return Array.isArray(p) ? p : [];
  } catch {
    return [];
  }
}

function saveCards(cards: Card[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards.slice(0, 200)));
}

export default function PersonalKanbanPage() {
  const { assertAccess } = useSubscribedToolAccess("/personal-kanban");
  const [unlocked, setUnlocked] = useState(false);
  const [cards, setCards] = useState<Card[]>([]);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (unlocked) setCards(loadCards());
  }, [unlocked]);

  const persist = (next: Card[]) => {
    setCards(next);
    saveCards(next);
  };

  const handleOpen = () => {
    if (!assertAccess()) return;
    setUnlocked(true);
  };

  const add = () => {
    const text = draft.trim();
    if (!text) return;
    persist([...cards, { id: crypto.randomUUID(), text, column: "todo" }]);
    setDraft("");
  };

  const move = (id: string, column: Column) => {
    persist(cards.map((c) => (c.id === id ? { ...c, column } : c)));
  };

  const remove = (id: string) => {
    persist(cards.filter((c) => c.id !== id));
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Personal kanban</h1>
          <p className="mt-1 text-muted-foreground">
            Three columns with cards stored in your browser.
          </p>
        </div>

        {!unlocked ? (
          <div className="rounded-xl border border-input bg-card p-6">
            <Button onClick={handleOpen} className="gap-2">
              <ViewColumnsIcon className="h-4 w-4" />
              Open board
            </Button>
          </div>
        ) : (
          <>
            <div className="rounded-xl border border-input bg-card p-4 space-y-3">
              <Label htmlFor="card">New card</Label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  id="card"
                  placeholder="Task title"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
                  className="flex-1"
                />
                <Button type="button" onClick={add} className="gap-1 shrink-0">
                  <PlusIcon className="h-4 w-4" />
                  Add to To do
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {COLUMNS.map((col) => (
                <div
                  key={col.id}
                  className="rounded-xl border border-input bg-muted/20 p-3 space-y-3 min-h-[280px]"
                >
                  <h2 className="font-semibold text-center border-b border-border pb-2">
                    {col.title}
                  </h2>
                  <ul className="space-y-2">
                    {cards
                      .filter((c) => c.column === col.id)
                      .map((c) => (
                        <li
                          key={c.id}
                          className="rounded-lg border border-input bg-card p-3 text-sm space-y-2 shadow-sm"
                        >
                          <p className="whitespace-pre-wrap break-words">{c.text}</p>
                          <div className="flex flex-wrap gap-1">
                            {COLUMNS.filter((x) => x.id !== c.column).map((x) => (
                              <Button
                                key={x.id}
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => move(c.id, x.id)}
                              >
                                → {x.title}
                              </Button>
                            ))}
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 ml-auto"
                              onClick={() => remove(c.id)}
                              aria-label="Delete card"
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
