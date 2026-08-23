"use client";

import { useCallback, useMemo, useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ExclamationTriangleIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useToolAccess } from "@/lib/use-tool-access";

type EventRow = {
  id: string;
  utc: string;
  role: string;
  detail: string;
  link: string;
};

function newEvent(): EventRow {
  return {
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    utc: "",
    role: "",
    detail: "",
    link: "",
  };
}

export default function IncidentTimelineBuilderPage() {
  const { ensureAccess } = useToolAccess();
  const [incidentTitle, setIncidentTitle] = useState("");
  const [rows, setRows] = useState<EventRow[]>(() => [newEvent(), newEvent()]);
  const [built, setBuilt] = useState(false);

  const sorted = useMemo(() => {
    return [...rows]
      .filter((r) => r.utc.trim() || r.detail.trim())
      .sort((a, b) => a.utc.localeCompare(b.utc));
  }, [rows]);

  const markdown = useMemo(() => {
    const title = incidentTitle.trim() || "Incident";
    let out = `# Incident timeline — ${title}\n\n`;
    out += `_All times should be **UTC**; adjust column if you paste into a spreadsheet._\n\n`;
    out += `| UTC | Role | What happened | Link |\n| --- | --- | --- | --- |\n`;
    if (sorted.length === 0) {
      out += "| — | — | — | — |\n";
    } else {
      for (const r of sorted) {
        const link = r.link.trim() ? `[link](${r.link.trim()})` : "—";
        out += `| ${r.utc.trim() || "—"} | ${r.role.trim() || "—"} | ${(r.detail.trim() || "—").replace(/\|/g, "\\|")} | ${link} |\n`;
      }
    }
    return out;
  }, [incidentTitle, sorted]);

  const update = useCallback((id: string, patch: Partial<EventRow>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }, []);

  const handleBuild = () => {
    if (!ensureAccess()) return;
    setBuilt(true);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600">
            <ExclamationTriangleIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Incident timeline builder</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              UTC-ordered events with roles and links for postmortems
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="inc">Incident title / ID</Label>
            <Input
              id="inc"
              value={incidentTitle}
              onChange={(e) => setIncidentTitle(e.target.value)}
              placeholder="e.g. PAY-441 — Card webhook delays"
              className="rounded-xl h-11"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Events</p>
            <Button type="button" variant="outline" size="sm" className="gap-1" onClick={() => setRows((r) => [...r, newEvent()])}>
              <PlusIcon className="size-4" />
              Add event
            </Button>
          </div>

          <div className="space-y-4 max-h-[min(55vh,520px)] overflow-y-auto pr-1">
            {rows.map((row, idx) => (
              <div
                key={row.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950/40 p-4 space-y-3"
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-500">Event {idx + 1}</span>
                  {rows.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-rose-600"
                      onClick={() => setRows((r) => r.filter((x) => x.id !== row.id))}
                    >
                      <TrashIcon className="size-4" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs">Time (UTC)</Label>
                    <Input
                      value={row.utc}
                      onChange={(e) => update(row.id, { utc: e.target.value })}
                      placeholder="2026-04-19T14:22Z or ISO local"
                      className="rounded-xl h-10 font-mono text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Role / team</Label>
                    <Input
                      value={row.role}
                      onChange={(e) => update(row.id, { role: e.target.value })}
                      placeholder="On-call, SRE, Comms…"
                      className="rounded-xl h-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">What happened</Label>
                  <textarea
                    value={row.detail}
                    onChange={(e) => update(row.id, { detail: e.target.value })}
                    placeholder="Detector fired, mitigation, customer impact…"
                    className="w-full min-h-[72px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dashboard-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Link (optional)</Label>
                  <Input
                    value={row.link}
                    onChange={(e) => update(row.id, { link: e.target.value })}
                    placeholder="https://…"
                    className="rounded-xl h-10 text-sm"
                  />
                </div>
              </div>
            ))}
          </div>

          <Button onClick={handleBuild} className="gap-2">
            <ExclamationTriangleIcon className="size-4" />
            Build sorted timeline
          </Button>

          {built && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-2">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Sorted lexically by UTC string — use ISO-8601 for correct order.
              </p>
              <pre className="text-xs sm:text-sm whitespace-pre-wrap rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-4 overflow-x-auto text-slate-800 dark:text-slate-200">
                {markdown}
              </pre>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
