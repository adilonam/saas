"use client";

import { useMemo, useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { UserGroupIcon } from "@heroicons/react/24/outline";
import { useToolAccess } from "@/lib/use-tool-access";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function chunkIntoGroups(names: string[], groupCount: number): string[][] {
  if (groupCount < 1) return [];
  const groups: string[][] = Array.from({ length: groupCount }, () => []);
  names.forEach((n, i) => {
    groups[i % groupCount].push(n);
  });
  return groups;
}

export default function TeamShufflerPage() {
  const { ensureAccess } = useToolAccess();
  const [raw, setRaw] = useState("");
  const [groupCount, setGroupCount] = useState(3);
  const [unlocked, setUnlocked] = useState(false);
  const [groups, setGroups] = useState<string[][]>([]);

  const names = useMemo(
    () =>
      raw
        .split(/\r?\n|,/)
        .map((s) => s.trim())
        .filter(Boolean),
    [raw],
  );

  const run = () => {
    if (!ensureAccess()) return;
    if (names.length < 2) return;
    const g = Math.min(Math.max(1, groupCount), names.length);
    const shuffled = shuffle(names);
    setGroups(chunkIntoGroups(shuffled, g));
    setUnlocked(true);
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-start gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30">
            <UserGroupIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Team shuffler</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Randomize a name list and split into balanced breakout groups (round-robin fill).
            </p>
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-input bg-card p-6">
          <div className="space-y-2">
            <Label htmlFor="n">Number of groups</Label>
            <input
              id="n"
              type="number"
              min={1}
              max={50}
              value={groupCount}
              onChange={(e) => setGroupCount(Number(e.target.value) || 1)}
              className="h-10 w-full max-w-xs rounded-md border border-input bg-background px-3 text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="names">Names (one per line or comma-separated)</Label>
            <textarea
              id="names"
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              placeholder={"Alex\nJordan\nSam\n…"}
              className="min-h-[200px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
          <Button type="button" onClick={run}>
            Shuffle into groups
          </Button>
        </div>

        {unlocked && groups.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {groups.map((g, i) => (
              <div key={i} className="rounded-xl border border-input bg-muted/30 p-4">
                <p className="text-sm font-semibold text-foreground">Group {i + 1}</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-foreground">
                  {g.map((n, idx) => (
                    <li key={`${i}-${idx}-${n}`}>{n}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
