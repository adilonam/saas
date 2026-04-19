"use client";

import { useMemo, useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CalculatorIcon } from "@heroicons/react/24/outline";
import { useToolAccess } from "@/lib/use-tool-access";

export default function RiceScoreCalculatorPage() {
  const { ensureAccess } = useToolAccess();
  const [reach, setReach] = useState("");
  const [impact, setImpact] = useState("");
  const [confidence, setConfidence] = useState("");
  const [effort, setEffort] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  const result = useMemo(() => {
    const r = parseFloat(reach);
    const i = parseFloat(impact);
    const c = parseFloat(confidence);
    const e = parseFloat(effort);
    if (
      !Number.isFinite(r) ||
      !Number.isFinite(i) ||
      !Number.isFinite(c) ||
      !Number.isFinite(e) ||
      r <= 0 ||
      i <= 0 ||
      c <= 0 ||
      e <= 0
    ) {
      return null;
    }
    const score = (r * i * (c / 100)) / e;
    return { score };
  }, [reach, impact, confidence, effort]);

  const handleSubmit = () => {
    if (!ensureAccess()) return;
    setUnlocked(true);
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">RICE Score Calculator</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Calculate RICE score with the standard formula: Reach x Impact x Confidence / Effort.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 p-6 space-y-6 bg-slate-50/50 dark:bg-slate-900/40">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reach">Reach</Label>
              <Input id="reach" type="number" min={0} value={reach} onChange={(e) => setReach(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="impact">Impact</Label>
              <Input id="impact" type="number" min={0} step="0.1" value={impact} onChange={(e) => setImpact(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confidence">Confidence (%)</Label>
              <Input id="confidence" type="number" min={0} max={100} value={confidence} onChange={(e) => setConfidence(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="effort">Effort (person-months)</Label>
              <Input id="effort" type="number" min={0.1} step="0.1" value={effort} onChange={(e) => setEffort(e.target.value)} />
            </div>
          </div>

          <Button onClick={handleSubmit} disabled={!result} className="gap-2">
            <CalculatorIcon className="size-4" />
            Calculate
          </Button>

          {result && unlocked && (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-500 dark:text-slate-400">RICE score</p>
              <p className="text-3xl font-bold">{result.score.toFixed(2)}</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
