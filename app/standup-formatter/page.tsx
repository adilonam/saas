"use client";

import { useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ListBulletIcon } from "@heroicons/react/24/outline";
import { useToolAccess } from "@/lib/use-tool-access";

export default function StandupFormatterPage() {
  const { ensureAccess } = useToolAccess();
  const [yesterday, setYesterday] = useState("");
  const [today, setToday] = useState("");
  const [blockers, setBlockers] = useState("");
  const [formatted, setFormatted] = useState("");

  const handleFormat = () => {
    if (!ensureAccess()) return;
    const y = yesterday.trim() || "—";
    const t = today.trim() || "—";
    const b = blockers.trim() || "—";
    const out = `**Yesterday**\n${y}\n\n**Today**\n${t}\n\n**Blockers**\n${b}`;
    setFormatted(out);
  };

  const copy = async () => {
    if (!formatted) return;
    await navigator.clipboard.writeText(formatted);
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Standup formatter</h1>
          <p className="mt-1 text-muted-foreground">
            Yesterday / today / blockers into a clean snippet for Slack or your tracker.
          </p>
        </div>

        <div className="space-y-4 rounded-xl border border-input bg-card p-6">
          <div className="space-y-2">
            <Label htmlFor="su-y">Yesterday</Label>
            <textarea
              id="su-y"
              value={yesterday}
              onChange={(e) => setYesterday(e.target.value)}
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Shipped the auth fix, reviewed two PRs…"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="su-t">Today</Label>
            <textarea
              id="su-t"
              value={today}
              onChange={(e) => setToday(e.target.value)}
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Finish API tests, pair on billing edge cases…"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="su-b">Blockers</Label>
            <textarea
              id="su-b"
              value={blockers}
              onChange={(e) => setBlockers(e.target.value)}
              rows={2}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Waiting on design token export, VPN flaky…"
            />
          </div>
          <Button onClick={handleFormat} className="gap-2 w-full sm:w-auto">
            <ListBulletIcon className="h-4 w-4" />
            Format standup
          </Button>
        </div>

        {formatted && (
          <div className="rounded-xl border border-input bg-muted/30 p-6 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-medium">Output</h2>
              <Button type="button" variant="outline" size="sm" onClick={copy}>
                Copy
              </Button>
            </div>
            <pre className="whitespace-pre-wrap rounded-lg border border-input bg-background p-4 text-sm">
              {formatted}
            </pre>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
