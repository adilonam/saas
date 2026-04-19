"use client";

import { useCallback, useMemo, useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TableCellsIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useToolAccess } from "@/lib/use-tool-access";

type RaciRow = { id: string; task: string; r: string; a: string; c: string; i: string };

function newRow(): RaciRow {
  return {
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    task: "",
    r: "",
    a: "",
    c: "",
    i: "",
  };
}

export default function RaciChartBuilderPage() {
  const { ensureAccess } = useToolAccess();
  const [projectName, setProjectName] = useState("");
  const [rows, setRows] = useState<RaciRow[]>(() => [newRow(), newRow(), newRow()]);
  const [built, setBuilt] = useState(false);

  const markdown = useMemo(() => {
    const title = projectName.trim() || "Project";
    const header = `| Task / deliverable | Responsible (R) | Accountable (A) | Consulted (C) | Informed (I) |\n| --- | --- | --- | --- | --- |`;
    const body = rows
      .filter((row) => row.task.trim() || row.r || row.a || row.c || row.i)
      .map(
        (row) =>
          `| ${row.task.trim() || "—"} | ${row.r.trim() || "—"} | ${row.a.trim() || "—"} | ${row.c.trim() || "—"} | ${row.i.trim() || "—"} |`,
      )
      .join("\n");
    return `# RACI — ${title}\n\n${header}\n${body || "| — | — | — | — | — |"}\n`;
  }, [projectName, rows]);

  const updateRow = useCallback((id: string, patch: Partial<RaciRow>) => {
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
          <div className="size-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
            <TableCellsIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">RACI chart builder</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Map tasks to Responsible, Accountable, Consulted, and Informed roles for your project
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="project">Project name</Label>
            <Input
              id="project"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g. Checkout redesign"
              className="rounded-xl h-11"
            />
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Rows</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() => setRows((r) => [...r, newRow()])}
              >
                <PlusIcon className="size-4" />
                Add row
              </Button>
            </div>

            <div className="space-y-4 max-h-[min(60vh,520px)] overflow-y-auto pr-1">
              {rows.map((row, idx) => (
                <div
                  key={row.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950/40 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Row {idx + 1}
                    </span>
                    {rows.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-rose-600 hover:text-rose-700 h-8 px-2"
                        onClick={() => setRows((r) => r.filter((x) => x.id !== row.id))}
                      >
                        <TrashIcon className="size-4" />
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Task / deliverable</Label>
                    <Input
                      value={row.task}
                      onChange={(e) => updateRow(row.id, { task: e.target.value })}
                      placeholder="e.g. API contract sign-off"
                      className="rounded-xl h-10"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(
                      [
                        ["r", "Responsible (R)", row.r],
                        ["a", "Accountable (A)", row.a],
                        ["c", "Consulted (C)", row.c],
                        ["i", "Informed (I)", row.i],
                      ] as const
                    ).map(([key, label, val]) => (
                      <div key={key} className="space-y-1">
                        <Label className="text-xs">{label}</Label>
                        <Input
                          value={val}
                          onChange={(e) => updateRow(row.id, { [key]: e.target.value } as Partial<RaciRow>)}
                          placeholder="Name or role"
                          className="rounded-xl h-10"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button onClick={handleBuild} className="gap-2">
            <TableCellsIcon className="size-4" />
            Build RACI table
          </Button>

          {built && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-2">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Markdown (copy into Notion, GitHub, etc.)</p>
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
