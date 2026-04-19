"use client";

import { useCallback, useMemo, useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FunnelIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useToolAccess } from "@/lib/use-tool-access";

type RiceRow = {
  id: string;
  name: string;
  reach: string;
  impact: string;
  confidence: string;
  effort: string;
};

type MoscowRow = { id: string; name: string; bucket: "Must" | "Should" | "Could" | "Wont" };

function rid() {
  return typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
}

function parseNum(s: string, fallback: number) {
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : fallback;
}

export default function BacklogPrioritizerPage() {
  const { ensureAccess } = useToolAccess();
  const [mode, setMode] = useState<"rice" | "moscow">("rice");
  const [riceRows, setRiceRows] = useState<RiceRow[]>(() => [
    { id: rid(), name: "", reach: "100", impact: "2", confidence: "80", effort: "2" },
  ]);
  const [moscowRows, setMoscowRows] = useState<MoscowRow[]>(() => [
    { id: rid(), name: "", bucket: "Must" },
  ]);
  const [built, setBuilt] = useState(false);

  const riceSummary = useMemo(() => {
    const scored = riceRows
      .filter((r) => r.name.trim())
      .map((r) => {
        const reach = Math.max(0, parseNum(r.reach, 0));
        const impact = Math.max(0.25, Math.min(3, parseNum(r.impact, 1)));
        const confidence = Math.max(0, Math.min(100, parseNum(r.confidence, 50))) / 100;
        const effort = Math.max(0.25, parseNum(r.effort, 1));
        const score = (reach * impact * confidence) / effort;
        return { ...r, score };
      })
      .sort((a, b) => b.score - a.score);

    let md = "## RICE scores (higher first)\n\n";
    md += "_Reach × Impact × (Confidence %) ÷ Effort (person-months or relative units)_\n\n";
    md += "| Rank | Item | Reach | Impact | Conf. % | Effort | Score |\n| --- | --- | --- | --- | --- | --- | --- |\n";
    if (scored.length === 0) {
      md += "| — | Add named items below | — | — | — | — | — |\n";
    } else {
      scored.forEach((r, i) => {
        md += `| ${i + 1} | ${r.name.trim()} | ${r.reach} | ${r.impact} | ${r.confidence} | ${r.effort} | **${r.score.toFixed(2)}** |\n`;
      });
    }
    return md;
  }, [riceRows]);

  const moscowSummary = useMemo(() => {
    const buckets: Record<string, MoscowRow[]> = {
      Must: [],
      Should: [],
      Could: [],
      Wont: [],
    };
    for (const row of moscowRows) {
      if (!row.name.trim()) continue;
      buckets[row.bucket].push(row);
    }
    let md = "## MoSCoW groups\n\n";
    for (const label of ["Must", "Should", "Could", "Wont"] as const) {
      md += `### ${label}-have\n`;
      const items = buckets[label];
      if (items.length === 0) md += "- _(none)_\n";
      else md += items.map((r) => `- ${r.name.trim()}`).join("\n") + "\n";
      md += "\n";
    }
    return md;
  }, [moscowRows]);

  const output = mode === "rice" ? riceSummary : moscowSummary;

  const addRice = useCallback(() => {
    setRiceRows((r) => [...r, { id: rid(), name: "", reach: "100", impact: "2", confidence: "80", effort: "2" }]);
  }, []);
  const addMoscow = useCallback(() => {
    setMoscowRows((r) => [...r, { id: rid(), name: "", bucket: "Must" }]);
  }, []);

  const handleBuild = () => {
    if (!ensureAccess()) return;
    setBuilt(true);
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600">
            <FunnelIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Backlog prioritizer</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Score items with RICE or bucket them with MoSCoW
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant={mode === "rice" ? "default" : "outline"} size="sm" onClick={() => setMode("rice")}>
              RICE
            </Button>
            <Button type="button" variant={mode === "moscow" ? "default" : "outline"} size="sm" onClick={() => setMode("moscow")}>
              MoSCoW
            </Button>
          </div>

          {mode === "rice" ? (
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button type="button" variant="outline" size="sm" className="gap-1" onClick={addRice}>
                  <PlusIcon className="size-4" />
                  Add item
                </Button>
              </div>
              <div className="space-y-4 max-h-[min(55vh,480px)] overflow-y-auto pr-1">
                {riceRows.map((row, idx) => (
                  <div
                    key={row.id}
                    className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950/40 p-4 space-y-3"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-slate-500">Item {idx + 1}</span>
                      {riceRows.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-rose-600"
                          onClick={() => setRiceRows((r) => r.filter((x) => x.id !== row.id))}
                        >
                          <TrashIcon className="size-4" />
                        </Button>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Backlog item</Label>
                      <Input
                        value={row.name}
                        onChange={(e) =>
                          setRiceRows((r) => r.map((x) => (x.id === row.id ? { ...x, name: e.target.value } : x)))
                        }
                        placeholder="Feature or initiative name"
                        className="rounded-xl h-10"
                      />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {(
                        [
                          ["reach", "Reach", "users/wk or scale"],
                          ["impact", "Impact", "0.25–3"],
                          ["confidence", "Conf. %", "0–100"],
                          ["effort", "Effort", "person-mo"],
                        ] as const
                      ).map(([field, lab, ph]) => (
                        <div key={field} className="space-y-1">
                          <Label className="text-xs">{lab}</Label>
                          <Input
                            value={row[field]}
                            onChange={(e) =>
                              setRiceRows((r) =>
                                r.map((x) => (x.id === row.id ? { ...x, [field]: e.target.value } : x)),
                              )
                            }
                            placeholder={ph}
                            className="rounded-xl h-10 text-sm"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button type="button" variant="outline" size="sm" className="gap-1" onClick={addMoscow}>
                  <PlusIcon className="size-4" />
                  Add item
                </Button>
              </div>
              <div className="space-y-3 max-h-[min(55vh,480px)] overflow-y-auto pr-1">
                {moscowRows.map((row, idx) => (
                  <div
                    key={row.id}
                    className="flex flex-col sm:flex-row sm:items-end gap-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950/40 p-4"
                  >
                    <div className="flex-1 space-y-2">
                      <Label className="text-xs">Item {idx + 1}</Label>
                      <Input
                        value={row.name}
                        onChange={(e) =>
                          setMoscowRows((r) => r.map((x) => (x.id === row.id ? { ...x, name: e.target.value } : x)))
                        }
                        placeholder="Backlog item"
                        className="rounded-xl h-10"
                      />
                    </div>
                    <div className="space-y-2 sm:w-40">
                      <Label className="text-xs">Bucket</Label>
                      <select
                        value={row.bucket}
                        onChange={(e) =>
                          setMoscowRows((r) =>
                            r.map((x) =>
                              x.id === row.id ? { ...x, bucket: e.target.value as MoscowRow["bucket"] } : x,
                            ),
                          )
                        }
                        className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-2 text-sm"
                      >
                        {(["Must", "Should", "Could", "Wont"] as const).map((b) => (
                          <option key={b} value={b}>
                            {b}-have
                          </option>
                        ))}
                      </select>
                    </div>
                    {moscowRows.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-rose-600 h-10"
                        onClick={() => setMoscowRows((r) => r.filter((x) => x.id !== row.id))}
                      >
                        <TrashIcon className="size-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button onClick={handleBuild} className="gap-2">
            <FunnelIcon className="size-4" />
            Generate summary
          </Button>

          {built && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-2">
              <pre className="text-xs sm:text-sm whitespace-pre-wrap rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-4 overflow-x-auto text-slate-800 dark:text-slate-200">
                {output}
              </pre>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
