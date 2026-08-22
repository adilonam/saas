"use client";

import { useMemo, useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowsRightLeftIcon } from "@heroicons/react/24/outline";
import { useToolAccess } from "@/lib/use-tool-access";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function PollOptionBalancerPage() {
  const { ensureAccess } = useToolAccess();
  const [raw, setRaw] = useState("");
  const [maxLen, setMaxLen] = useState(100);
  const [doShuffle, setDoShuffle] = useState(true);
  const [unlocked, setUnlocked] = useState(false);
  const [result, setResult] = useState<string[]>([]);

  const preview = useMemo(() => {
    const lines = raw
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
    const seen = new Set<string>();
    const deduped: string[] = [];
    for (const line of lines) {
      const key = line.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      deduped.push(line.slice(0, Math.max(1, maxLen)));
    }
    const out = doShuffle ? shuffle(deduped) : deduped;
    return out;
  }, [raw, maxLen, doShuffle]);

  const run = () => {
    if (!ensureAccess()) return;
    if (!raw.trim()) return;
    setResult(preview);
    setUnlocked(true);
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-start gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-900/30">
            <ArrowsRightLeftIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Poll option balancer</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              One option per line: dedupe (case-insensitive), optional shuffle, trim to max length.
            </p>
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-input bg-card p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="max">Max characters per option</Label>
              <input
                id="max"
                type="number"
                min={1}
                max={500}
                value={maxLen}
                onChange={(e) => setMaxLen(Number(e.target.value) || 1)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              />
            </div>
            <label className="flex items-end gap-2 pb-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={doShuffle}
                onChange={(e) => setDoShuffle(e.target.checked)}
                className="size-4 rounded border-input"
              />
              Shuffle order
            </label>
          </div>
          <div className="space-y-2">
            <Label htmlFor="opts">Poll options</Label>
            <textarea
              id="opts"
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              placeholder={"Option A\nOption B\noption a  (duplicate)\n"}
              className="min-h-[180px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
          <Button type="button" onClick={run}>
            Balance options
          </Button>
        </div>

        {unlocked && result.length > 0 && (
          <div className="rounded-xl border border-input bg-muted/30 p-6">
            <p className="text-sm font-medium text-foreground">{result.length} options</p>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-foreground">
              {result.map((o, i) => (
                <li key={i}>{o}</li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
