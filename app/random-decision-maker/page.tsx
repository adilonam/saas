"use client";

import { useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "components/lib/utils";
import { ArrowsRightLeftIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { useToolAccess } from "@/lib/use-tool-access";

function parseOptions(raw: string): string[] {
  return raw
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function RandomDecisionMakerPage() {
  const { ensureAccess } = useToolAccess();
  const [optionsText, setOptionsText] = useState("Pizza\nSushi\nTacos\nSalad");
  const [picked, setPicked] = useState<string | null>(null);
  const [unlocked, setUnlocked] = useState(false);

  const options = parseOptions(optionsText);
  const canPick = options.length >= 2;

  const handlePick = () => {
    if (!ensureAccess()) return;
    setUnlocked(true);
    const i = Math.floor(Math.random() * options.length);
    setPicked(options[i] ?? null);
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-fuchsia-100 dark:bg-fuchsia-900/30 flex items-center justify-center text-fuchsia-600">
            <ArrowsRightLeftIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Random Decision Maker</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              One option per line — we choose uniformly at random
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="opts">Options</Label>
            <textarea
              id="opts"
              rows={8}
              placeholder={"Option A\nOption B\nOption C"}
              value={optionsText}
              onChange={(e) => {
                setOptionsText(e.target.value);
                setPicked(null);
              }}
              className={cn(
                "flex w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-sm",
                "min-h-[160px] resize-y font-mono",
                "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
              )}
            />
            <p className="text-xs text-slate-500">
              {options.length} option{options.length !== 1 ? "s" : ""} detected
              {!canPick && options.length > 0 && " — add at least 2 non-empty lines"}
            </p>
          </div>

          <Button onClick={handlePick} disabled={!canPick} className="gap-2">
            <SparklesIcon className="h-4 w-4" />
            Pick randomly
          </Button>

          {unlocked && picked && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-2">
              <p className="text-sm text-slate-500 dark:text-slate-400">Result</p>
              <p className="text-2xl sm:text-3xl font-bold text-fuchsia-600 dark:text-fuchsia-400 wrap-break-word">
                {picked}
              </p>
            </div>
          )}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-6">
          For fun and quick decisions — not cryptographically secure randomness.
        </p>
      </div>
    </DashboardLayout>
  );
}
