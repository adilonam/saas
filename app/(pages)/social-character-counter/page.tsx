"use client";

import { useMemo, useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DocumentChartBarIcon } from "@heroicons/react/24/outline";
import { useToolAccess } from "@/lib/use-tool-access";
import { graphemeLength } from "@/lib/thread-split";

const PLATFORMS = [
  { name: "Bluesky post", limit: 300, grapheme: true, note: "300 graphemes (approx. official client limit)" },
  { name: "Threads post", limit: 500, grapheme: false, note: "500 UTF-16 code units (common limit)" },
  { name: "X / Twitter", limit: 280, grapheme: true, note: "280 graphemes" },
  { name: "LinkedIn post (short)", limit: 3000, grapheme: false, note: "Typical post ceiling (varies by surface)" },
] as const;

export default function SocialCharacterCounterPage() {
  const { ensureAccess } = useToolAccess();
  const [text, setText] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  const rows = useMemo(() => {
    return PLATFORMS.map((p) => {
      const len = p.grapheme ? graphemeLength(text) : text.length;
      const remaining = p.limit - len;
      return {
        ...p,
        len,
        remaining,
        over: remaining < 0,
      };
    });
  }, [text]);

  const run = () => {
    if (!ensureAccess()) return;
    setUnlocked(true);
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-start gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-900/30">
            <DocumentChartBarIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Social character counter</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Compare draft length against Bluesky, Threads, X, and a LinkedIn ceiling at a glance.
            </p>
          </div>
        </div>

        <div className="space-y-2 rounded-xl border border-input bg-card p-6">
          <Label htmlFor="draft">Draft</Label>
          <textarea
            id="draft"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[160px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            placeholder="Paste caption or post…"
          />
          <Button type="button" onClick={run}>
            Count for platforms
          </Button>
        </div>

        {unlocked && (
          <div className="overflow-x-auto rounded-xl border border-input bg-muted/30 p-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="pb-2 pr-4 font-medium">Platform</th>
                  <th className="pb-2 pr-4 font-medium">Count</th>
                  <th className="pb-2 pr-4 font-medium">Limit</th>
                  <th className="pb-2 font-medium">Remaining</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.name} className="border-b border-border/60 last:border-0">
                    <td className="py-3 pr-4 font-medium text-foreground">{r.name}</td>
                    <td className="py-3 pr-4 tabular-nums">{r.len}</td>
                    <td className="py-3 pr-4 tabular-nums">{r.limit}</td>
                    <td className={`py-3 tabular-nums ${r.over ? "text-destructive font-medium" : "text-emerald-600 dark:text-emerald-400"}`}>
                      {r.remaining}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-4 text-xs text-muted-foreground">
              Grapheme counts use your browser&apos;s segmenter when available; limits are practical defaults and can change by client.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
