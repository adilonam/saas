"use client";

import { useMemo, useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { LightBulbIcon } from "@heroicons/react/24/outline";
import { useToolAccess } from "@/lib/use-tool-access";

const PROMPTS = [
  { key: "S", label: "Specific", hint: "What exactly will be done? Who is involved? Where?" },
  { key: "M", label: "Measurable", hint: "How will you know it is achieved? Which numbers or signals?" },
  { key: "A", label: "Achievable", hint: "Do you have the skills, time, and resources?" },
  { key: "R", label: "Relevant", hint: "Why does this matter now? How does it support larger priorities?" },
  { key: "T", label: "Time-bound", hint: "What is the deadline or review cadence?" },
] as const;

export default function SmartGoalCheckerPage() {
  const { ensureAccess } = useToolAccess();
  const [headline, setHeadline] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({ S: "", M: "", A: "", R: "", T: "" });
  const [built, setBuilt] = useState(false);

  const doc = useMemo(() => {
    const h = headline.trim() || "(Your goal in one line)";
    let out = `# SMART goal worksheet\n\n## Goal (summary)\n${h}\n\n`;
    for (const { key, label, hint } of PROMPTS) {
      const body = answers[key]?.trim() || "_(not filled yet)_";
      out += `### ${key} — ${label}\n_${hint}_\n\n${body}\n\n`;
    }
    out += `---\n**Check:** each letter should have a concrete answer before you commit to the goal.\n`;
    return out;
  }, [headline, answers]);

  const handleBuild = () => {
    if (!ensureAccess()) return;
    setBuilt(true);
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600">
            <LightBulbIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">SMART goal checker</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Prompts for each letter so your goal is specific, measurable, achievable, relevant, and time-bound
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="headline">Goal in one line</Label>
            <textarea
              id="headline"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g. Ship self-serve billing to 100% of new teams by June 30"
              className="w-full min-h-[72px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dashboard-primary/20"
            />
          </div>

          <div className="space-y-5">
            {PROMPTS.map(({ key, label, hint }) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={`smart-${key}`} className="text-base">
                  <span className="inline-flex size-7 items-center justify-center rounded-lg bg-slate-200 dark:bg-slate-800 text-sm font-bold mr-2">
                    {key}
                  </span>
                  {label}
                </Label>
                <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>
                <textarea
                  id={`smart-${key}`}
                  value={answers[key]}
                  onChange={(e) => setAnswers((a) => ({ ...a, [key]: e.target.value }))}
                  className="w-full min-h-[80px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dashboard-primary/20"
                  placeholder="Your notes…"
                />
              </div>
            ))}
          </div>

          <Button onClick={handleBuild} className="gap-2">
            <LightBulbIcon className="size-4" />
            Compile SMART worksheet
          </Button>

          {built && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-2">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Document</p>
              <pre className="text-xs sm:text-sm whitespace-pre-wrap rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-4 overflow-x-auto text-slate-800 dark:text-slate-200">
                {doc}
              </pre>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
