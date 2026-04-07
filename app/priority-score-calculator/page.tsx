"use client";

import { useMemo, useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CalculatorIcon } from "@heroicons/react/24/outline";
import { useToolAccess } from "@/lib/use-tool-access";

export default function PriorityScoreCalculatorPage() {
  const { ensureAccess } = useToolAccess();
  const [impact, setImpact] = useState("");
  const [urgency, setUrgency] = useState("");
  const [confidence, setConfidence] = useState("");
  const [effort, setEffort] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  const result = useMemo(() => {
    const i = parseFloat(impact);
    const u = parseFloat(urgency);
    const c = parseFloat(confidence);
    const e = parseFloat(effort);
    if (
      !Number.isFinite(i) ||
      !Number.isFinite(u) ||
      !Number.isFinite(c) ||
      !Number.isFinite(e) ||
      i <= 0 ||
      u <= 0 ||
      c <= 0 ||
      e <= 0
    ) {
      return null;
    }
    const score = (i * u * c) / e;
    return { score };
  }, [impact, urgency, confidence, effort]);

  const handleSubmit = () => {
    if (!ensureAccess()) return;
    setUnlocked(true);
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Priority Score Calculator</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Use a simple prioritization model: (Impact x Urgency x Confidence) / Effort.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 p-6 space-y-6 bg-slate-50/50 dark:bg-slate-900/40">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="impact">Impact (1-10)</Label>
              <Input id="impact" type="number" min={1} max={10} value={impact} onChange={(e) => setImpact(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="urgency">Urgency (1-10)</Label>
              <Input id="urgency" type="number" min={1} max={10} value={urgency} onChange={(e) => setUrgency(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confidence">Confidence (1-10)</Label>
              <Input id="confidence" type="number" min={1} max={10} value={confidence} onChange={(e) => setConfidence(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="effort">Effort (1-10)</Label>
              <Input id="effort" type="number" min={1} max={10} value={effort} onChange={(e) => setEffort(e.target.value)} />
            </div>
          </div>

          <Button onClick={handleSubmit} disabled={!result} className="gap-2">
            <CalculatorIcon className="size-4" />
            Calculate
          </Button>

          {result && unlocked && (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-500 dark:text-slate-400">Priority score</p>
              <p className="text-3xl font-bold">{result.score.toFixed(2)}</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
