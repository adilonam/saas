"use client";

import { useMemo, useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusIcon, ScaleIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useToolAccess } from "@/lib/use-tool-access";

type Criterion = { id: string; label: string; weight: number };
type Option = { id: string; label: string };

function id() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : String(Date.now()) + Math.random().toString(16).slice(2);
}

export default function ProsConsMatrixPage() {
  const { ensureAccess } = useToolAccess();
  const [computed, setComputed] = useState(false);
  const [criteria, setCriteria] = useState<Criterion[]>([
    { id: "crit-1", label: "Cost", weight: 3 },
    { id: "crit-2", label: "Speed to ship", weight: 2 },
    { id: "crit-3", label: "Risk", weight: 2 },
  ]);
  const [options, setOptions] = useState<Option[]>([
    { id: "opt-1", label: "Option A" },
    { id: "opt-2", label: "Option B" },
  ]);
  const [scores, setScores] = useState<Record<string, Record<string, number>>>({});

  const weightSum = useMemo(
    () => criteria.reduce((s, c) => s + Math.max(0.01, c.weight), 0),
    [criteria],
  );

  const totals = useMemo(() => {
    const out: Record<string, number> = {};
    for (const o of options) {
      let num = 0;
      let den = 0;
      for (const c of criteria) {
        const w = Math.max(0.01, c.weight);
        const s = scores[o.id]?.[c.id] ?? 5;
        num += w * s;
        den += w;
      }
      out[o.id] = den ? num / den : 0;
    }
    return out;
  }, [criteria, options, scores]);

  const setScore = (optionId: string, criterionId: string, v: number) => {
    const n = Math.min(10, Math.max(0, Math.round(v)));
    setScores((prev) => ({
      ...prev,
      [optionId]: { ...prev[optionId], [criterionId]: n },
    }));
  };

  const handleScore = () => {
    if (!ensureAccess()) return;
    setComputed(true);
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Pros / cons criteria matrix</h1>
          <p className="mt-1 text-muted-foreground">
            Weight criteria and score each option 0–10. Weighted averages surface a ranked choice.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() =>
              setCriteria((c) => [...c, { id: id(), label: "New criterion", weight: 1 }])
            }
          >
            <PlusIcon className="h-4 w-4" />
            Add criterion
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => setOptions((o) => [...o, { id: id(), label: "New option" }])}
          >
            <PlusIcon className="h-4 w-4" />
            Add option
          </Button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-input">
          <table className="w-full min-w-[480px] text-sm border-collapse">
            <thead>
              <tr className="border-b border-input bg-muted/40">
                <th className="p-3 text-left font-medium">Option</th>
                {criteria.map((c) => (
                  <th key={c.id} className="p-2 text-left font-normal min-w-[140px]">
                    <div className="space-y-1">
                      <Input
                        value={c.label}
                        onChange={(e) =>
                          setCriteria((list) =>
                            list.map((x) => (x.id === c.id ? { ...x, label: e.target.value } : x)),
                          )
                        }
                        className="h-8 text-xs"
                      />
                      <div className="flex items-center gap-1">
                        <Label className="text-xs text-muted-foreground shrink-0">Wt</Label>
                        <Input
                          type="number"
                          min={0.01}
                          step={0.5}
                          value={c.weight}
                          onChange={(e) =>
                            setCriteria((list) =>
                              list.map((x) =>
                                x.id === c.id
                                  ? { ...x, weight: Math.max(0.01, parseFloat(e.target.value) || 0.01) }
                                  : x,
                              ),
                            )
                          }
                          className="h-8 w-16 text-xs"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                          onClick={() => setCriteria((list) => list.filter((x) => x.id !== c.id))}
                          aria-label="Remove criterion"
                        >
                          <TrashIcon className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </th>
                ))}
                <th className="p-3 text-right font-medium w-28">Score /10</th>
              </tr>
            </thead>
            <tbody>
              {options.map((o) => (
                <tr key={o.id} className="border-b border-input last:border-0">
                  <td className="p-3 align-top">
                    <div className="flex gap-1">
                      <Input
                        value={o.label}
                        onChange={(e) =>
                          setOptions((list) =>
                            list.map((x) => (x.id === o.id ? { ...x, label: e.target.value } : x)),
                          )
                        }
                        className="h-9"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="shrink-0"
                        onClick={() => {
                          setOptions((list) => list.filter((x) => x.id !== o.id));
                          setScores((s) => {
                            const { [o.id]: _, ...rest } = s;
                            return rest;
                          });
                        }}
                        aria-label="Remove option"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                  {criteria.map((c) => (
                    <td key={c.id} className="p-2 align-middle">
                      <input
                        type="range"
                        min={0}
                        max={10}
                        value={scores[o.id]?.[c.id] ?? 5}
                        onChange={(e) => setScore(o.id, c.id, Number(e.target.value))}
                        className="w-full accent-primary"
                      />
                      <div className="text-center text-xs tabular-nums text-muted-foreground">
                        {scores[o.id]?.[c.id] ?? 5}
                      </div>
                    </td>
                  ))}
                  <td className="p-3 text-right font-semibold tabular-nums">
                    {computed ? totals[o.id].toFixed(2) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Button onClick={handleScore} className="gap-2 w-full sm:w-auto">
          <ScaleIcon className="h-4 w-4" />
          Score options
        </Button>

        {computed && (
          <div className="rounded-xl border border-input bg-muted/30 p-6 text-sm space-y-2">
            <p className="font-medium">Ranking (higher is better)</p>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              {[...options]
                .sort((a, b) => totals[b.id] - totals[a.id])
                .map((o) => (
                  <li key={o.id}>
                    <span className="text-foreground font-medium">{o.label}</span> —{" "}
                    {totals[o.id].toFixed(2)} / 10
                  </li>
                ))}
            </ol>
            <p className="text-xs text-muted-foreground pt-2">
              Each cell is 0–10. Option score = Σ(weight × score) / Σ(weights).
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
