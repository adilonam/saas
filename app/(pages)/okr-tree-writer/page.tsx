"use client";

import { useMemo, useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FlagIcon } from "@heroicons/react/24/outline";
import { useToolAccess } from "@/lib/use-tool-access";

export default function OkrTreeWriterPage() {
  const { ensureAccess } = useToolAccess();
  const [period, setPeriod] = useState("");
  const [objective, setObjective] = useState("");
  const [keyResultsRaw, setKeyResultsRaw] = useState("");
  const [built, setBuilt] = useState(false);

  const tree = useMemo(() => {
    const lines = keyResultsRaw
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    const periodLine = period.trim() ? `**Period:** ${period.trim()}\n\n` : "";
    const obj = objective.trim() || "(Objective)";
    let body = `${periodLine}## Objective\n${obj}\n\n## Key results\n`;
    if (lines.length === 0) {
      body += "- (Add one key result per line)\n";
    } else {
      body += lines.map((l, i) => `- **KR${i + 1}:** ${l}`).join("\n");
    }
    return body;
  }, [period, objective, keyResultsRaw]);

  const handleBuild = () => {
    if (!ensureAccess()) return;
    setBuilt(true);
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600">
            <FlagIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">OKR tree writer</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              One objective plus key results, formatted as a clear tree you can paste anywhere
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="period">Period (optional)</Label>
            <Input
              id="period"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              placeholder="e.g. Q2 2026"
              className="rounded-xl h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="objective">Objective</Label>
            <textarea
              id="objective"
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder="What you want to achieve, in plain language"
              className="w-full min-h-[88px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dashboard-primary/20"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="krs">Key results (one per line)</Label>
            <textarea
              id="krs"
              value={keyResultsRaw}
              onChange={(e) => setKeyResultsRaw(e.target.value)}
              placeholder={"Increase trial-to-paid to 12%\nShip v2 API with 99.9% SLO"}
              className="w-full min-h-[140px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dashboard-primary/20"
            />
          </div>

          <Button onClick={handleBuild} className="gap-2">
            <FlagIcon className="size-4" />
            Format OKR tree
          </Button>

          {built && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-2">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Output</p>
              <pre className="text-xs sm:text-sm whitespace-pre-wrap rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-4 overflow-x-auto text-slate-800 dark:text-slate-200">
                {tree}
              </pre>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
