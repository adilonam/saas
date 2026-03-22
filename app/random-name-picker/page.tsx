"use client";

import { useState, useCallback, useMemo } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { UserGroupIcon } from "@heroicons/react/24/outline";
import { useToolAccess } from "@/lib/use-tool-access";

function parseNames(raw: string): string[] {
  const lines = raw.split(/[\n,;]+/);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const line of lines) {
    const t = line.trim();
    if (!t) continue;
    const key = t.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t);
  }
  return out;
}

export default function RandomNamePickerPage() {
  const { ensureAccess } = useToolAccess();
  const [text, setText] = useState(
    "Alex\nJordan\nTaylor\nRiley\nCasey",
  );
  const [picked, setPicked] = useState<string | null>(null);

  const names = useMemo(() => parseNames(text), [text]);

  const pick = useCallback(() => {
    if (!ensureAccess()) return;
    if (names.length < 2) return;
    const i = Math.floor(Math.random() * names.length);
    setPicked(names[i] ?? null);
  }, [ensureAccess, names]);

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-lg space-y-8">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400">
            <UserGroupIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Random Name Picker
            </h1>
            <p className="text-sm text-muted-foreground">
              Paste or type names (one per line, or separated by commas).
            </p>
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="space-y-2">
            <Label htmlFor="names">Names</Label>
            <textarea
              id="names"
              className="min-h-[160px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setPicked(null);
              }}
              placeholder="One name per line…"
            />
            <p className="text-xs text-muted-foreground">
              {names.length} unique name{names.length === 1 ? "" : "s"} detected
              {names.length < 2 && " — add at least two to pick."}
            </p>
          </div>

          <Button
            type="button"
            size="lg"
            className="w-full rounded-xl"
            onClick={pick}
            disabled={names.length < 2}
          >
            Pick a name
          </Button>

          {picked && (
            <div
              className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center dark:border-emerald-900 dark:bg-emerald-950/40"
              aria-live="polite"
            >
              <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                Winner
              </p>
              <p className="mt-2 text-2xl font-bold text-emerald-950 dark:text-emerald-50">
                {picked}
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
