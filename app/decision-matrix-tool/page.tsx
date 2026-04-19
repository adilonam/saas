"use client";

import { useMemo, useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useToolAccess } from "@/lib/use-tool-access";

type OptionScore = { option: string; impact: number; effort: number; risk: number };

export default function DecisionMatrixToolPage() {
  const { ensureAccess } = useToolAccess();
  const [option, setOption] = useState("");
  const [impact, setImpact] = useState(3);
  const [effort, setEffort] = useState(3);
  const [risk, setRisk] = useState(3);
  const [rows, setRows] = useState<OptionScore[]>([]);

  const ranked = useMemo(
    () =>
      [...rows]
        .map((r) => ({ ...r, score: r.impact * 2 - r.effort - r.risk }))
        .sort((a, b) => b.score - a.score),
    [rows],
  );

  const handleSubmit = () => {
    if (!ensureAccess()) return;
    if (!option.trim()) return;
    setRows((prev) => [...prev, { option: option.trim(), impact, effort, risk }]);
    setOption("");
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Decision Matrix Tool</h1>
          <p className="mt-1 text-muted-foreground">
            Score options by impact, effort, and risk to rank what to do first.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            value={option}
            onChange={(e) => setOption(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm md:col-span-4"
            placeholder="Option name"
          />
          <input type="number" min={1} max={5} value={impact} onChange={(e) => setImpact(Number(e.target.value))} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          <input type="number" min={1} max={5} value={effort} onChange={(e) => setEffort(Number(e.target.value))} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          <input type="number" min={1} max={5} value={risk} onChange={(e) => setRisk(Number(e.target.value))} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        </div>

        <Button onClick={handleSubmit}>Add and score option</Button>

        <div className="rounded-xl border border-input bg-muted/30 p-5 space-y-3">
          <h2 className="text-sm font-semibold">Ranked options</h2>
          {ranked.length === 0 ? (
            <p className="text-sm text-muted-foreground">No options scored yet.</p>
          ) : (
            ranked.map((r, idx) => (
              <div key={`${r.option}-${idx}`} className="flex items-center justify-between text-sm">
                <span>{r.option}</span>
                <span className="text-muted-foreground">Score: {r.score}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
