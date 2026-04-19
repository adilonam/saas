"use client";

import { useMemo, useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarDaysIcon } from "@heroicons/react/24/outline";
import { useToolAccess } from "@/lib/use-tool-access";

export default function RoadmapQuarterPlannerPage() {
  const { ensureAccess } = useToolAccess();
  const [quarter, setQuarter] = useState("");
  const [themesRaw, setThemesRaw] = useState("");
  const [initiativesRaw, setInitiativesRaw] = useState("");
  const [built, setBuilt] = useState(false);

  const doc = useMemo(() => {
    const q = quarter.trim() || "Quarter";
    const themes = themesRaw
      .split("\n")
      .map((t) => t.trim())
      .filter(Boolean);
    const initiativeLines = initiativesRaw
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    let out = `# Roadmap — ${q}\n\n## Themes\n`;
    if (themes.length === 0) {
      out += "- _(add one theme per line)_\n\n";
    } else {
      out += themes.map((t) => `- **${t}**`).join("\n") + "\n\n";
    }

    out += "## Initiatives\n";
    out += "_Use `Theme | Initiative` per line to nest under a theme; otherwise lines are listed as global._\n\n";

    const byTheme: Record<string, string[]> = {};
    const global: string[] = [];
    for (const line of initiativeLines) {
      const pipe = line.indexOf("|");
      if (pipe > 0) {
        const theme = line.slice(0, pipe).trim();
        const init = line.slice(pipe + 1).trim();
        if (!byTheme[theme]) byTheme[theme] = [];
        if (init) byTheme[theme].push(init);
      } else {
        global.push(line);
      }
    }

    for (const t of themes) {
      const list = byTheme[t];
      if (list?.length) {
        out += `### ${t}\n`;
        out += list.map((i) => `- ${i}`).join("\n") + "\n\n";
      }
    }
    for (const [t, list] of Object.entries(byTheme)) {
      if (!themes.includes(t) && list.length) {
        out += `### ${t}\n`;
        out += list.map((i) => `- ${i}`).join("\n") + "\n\n";
      }
    }
    if (global.length) {
      out += "### Unassigned / cross-cutting\n";
      out += global.map((i) => `- ${i}`).join("\n") + "\n";
    }
    if (initiativeLines.length === 0) {
      out += "- _(add initiatives; optional format: `Payments | Apple Pay rollout`)_\n";
    }

    return out;
  }, [quarter, themesRaw, initiativesRaw]);

  const handleBuild = () => {
    if (!ensureAccess()) return;
    setBuilt(true);
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-sky-600">
            <CalendarDaysIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Roadmap quarter planner</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Themes for the quarter, then initiatives (optionally tagged with `Theme | Initiative`)
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="quarter">Quarter label</Label>
            <Input
              id="quarter"
              value={quarter}
              onChange={(e) => setQuarter(e.target.value)}
              placeholder="e.g. Q2 2026"
              className="rounded-xl h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="themes">Themes (one per line)</Label>
            <textarea
              id="themes"
              value={themesRaw}
              onChange={(e) => setThemesRaw(e.target.value)}
              placeholder={"Reliability\nGrowth"}
              className="w-full min-h-[100px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dashboard-primary/20"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="inits">Initiatives</Label>
            <textarea
              id="inits"
              value={initiativesRaw}
              onChange={(e) => setInitiativesRaw(e.target.value)}
              placeholder={"Reliability | Zero-downtime deploys\nGrowth | Self-serve trials\nDocs refresh"}
              className="w-full min-h-[140px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dashboard-primary/20"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Optional: prefix with <code className="text-slate-700 dark:text-slate-300">Theme | </code> to group under that theme.
            </p>
          </div>

          <Button onClick={handleBuild} className="gap-2">
            <CalendarDaysIcon className="size-4" />
            Build roadmap outline
          </Button>

          {built && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-2">
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
