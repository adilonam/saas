"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ClipboardDocumentListIcon } from "@heroicons/react/24/outline";
import { useToolAccess } from "@/lib/use-tool-access";

const STORAGE_KEY = "saas-decision-log";

type DecisionEntry = {
  id: string;
  decidedAt: string;
  context: string;
  options: string;
  chosen: string;
  revisit: string;
};

function load(): DecisionEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as DecisionEntry[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function save(entries: DecisionEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export default function DecisionLogPage() {
  const { ensureAccess } = useToolAccess();
  const [unlocked, setUnlocked] = useState(false);
  const [entries, setEntries] = useState<DecisionEntry[]>([]);
  const [decidedAt, setDecidedAt] = useState(() => new Date().toISOString().slice(0, 10));
  const [context, setContext] = useState("");
  const [options, setOptions] = useState("");
  const [chosen, setChosen] = useState("");
  const [revisit, setRevisit] = useState("");

  useEffect(() => {
    if (unlocked) setEntries(load());
  }, [unlocked]);

  const handleOpen = () => {
    if (!ensureAccess()) return;
    setUnlocked(true);
  };

  const handleAdd = () => {
    if (!ensureAccess()) return;
    const c = context.trim();
    const ch = chosen.trim();
    if (!c || !ch) return;
    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : String(Date.now());
    const next: DecisionEntry = {
      id,
      decidedAt,
      context: c,
      options: options.trim() || "—",
      chosen: ch,
      revisit: revisit.trim() || "—",
    };
    const list = [next, ...entries];
    setEntries(list);
    save(list);
    setContext("");
    setOptions("");
    setChosen("");
    setRevisit("");
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Decision log</h1>
          <p className="mt-1 text-muted-foreground">
            Record context, options, what you chose, and when to revisit — stored locally.
          </p>
        </div>

        <div className="rounded-xl border border-input bg-card p-6">
          <Button onClick={handleOpen} className="gap-2 w-full sm:w-auto">
            <ClipboardDocumentListIcon className="h-4 w-4" />
            Open decision log
          </Button>
        </div>

        {unlocked && (
          <>
            <div className="space-y-4 rounded-xl border border-input bg-muted/30 p-6">
              <div className="space-y-2 max-w-xs">
                <Label htmlFor="dl-date">Decision date</Label>
                <Input
                  id="dl-date"
                  type="date"
                  value={decidedAt}
                  onChange={(e) => setDecidedAt(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dl-ctx">Context</Label>
                <textarea
                  id="dl-ctx"
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Problem, constraints, who is affected…"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dl-opt">Options considered</Label>
                <textarea
                  id="dl-opt"
                  value={options}
                  onChange={(e) => setOptions(e.target.value)}
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="A) Build in-house  B) Buy vendor  C) Defer…"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dl-ch">Chosen</Label>
                <textarea
                  id="dl-ch"
                  value={chosen}
                  onChange={(e) => setChosen(e.target.value)}
                  rows={2}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div className="space-y-2 max-w-xs">
                <Label htmlFor="dl-rev">Revisit date</Label>
                <Input
                  id="dl-rev"
                  type="date"
                  value={revisit}
                  onChange={(e) => setRevisit(e.target.value)}
                />
              </div>
              <Button onClick={handleAdd} className="gap-2">
                Add entry
              </Button>
            </div>

            <div className="space-y-3">
              <h2 className="text-sm font-medium text-muted-foreground">Entries</h2>
              {entries.length === 0 ? (
                <p className="text-sm text-muted-foreground">No decisions logged yet.</p>
              ) : (
                <ul className="space-y-4">
                  {entries.map((e) => (
                    <li
                      key={e.id}
                      className="rounded-xl border border-input bg-card p-4 text-sm space-y-2"
                    >
                      <p className="text-xs text-muted-foreground">
                        {e.decidedAt} · Revisit: {e.revisit}
                      </p>
                      <p>
                        <span className="font-medium text-foreground">Context: </span>
                        <span className="text-muted-foreground whitespace-pre-wrap">{e.context}</span>
                      </p>
                      <p>
                        <span className="font-medium text-foreground">Options: </span>
                        <span className="text-muted-foreground whitespace-pre-wrap">{e.options}</span>
                      </p>
                      <p>
                        <span className="font-medium text-foreground">Chosen: </span>
                        <span className="text-muted-foreground whitespace-pre-wrap">{e.chosen}</span>
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
