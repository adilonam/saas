"use client";

import { useMemo, useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { BugAntIcon } from "@heroicons/react/24/outline";
import { useToolAccess } from "@/lib/use-tool-access";

export default function BugReportTemplaterPage() {
  const { ensureAccess } = useToolAccess();
  const [title, setTitle] = useState("");
  const [severity, setSeverity] = useState("");
  const [environment, setEnvironment] = useState("");
  const [repro, setRepro] = useState("");
  const [expected, setExpected] = useState("");
  const [actual, setActual] = useState("");
  const [links, setLinks] = useState("");
  const [built, setBuilt] = useState(false);

  const doc = useMemo(() => {
    let out = `## Bug: ${title.trim() || "(title)"}\n\n`;
    if (severity.trim()) out += `**Severity / priority:** ${severity.trim()}\n\n`;
    out += `### Environment\n${environment.trim() || "_(browser, OS, app version, account type, feature flags…)_"}\n\n`;
    out += `### Steps to reproduce\n${repro.trim() || "1. …\n2. …\n3. …"}\n\n`;
    out += `### Expected\n${expected.trim() || "_(what should happen)_"}\n\n`;
    out += `### Actual\n${actual.trim() || "_(what happened instead)_"}\n\n`;
    if (links.trim()) {
      out += `### Links / attachments\n${links.trim()}\n`;
    }
    return out;
  }, [title, severity, environment, repro, expected, actual, links]);

  const handleBuild = () => {
    if (!ensureAccess()) return;
    setBuilt(true);
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600">
            <BugAntIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Bug report templater</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Repro steps, environment, expected vs actual — ready to paste into Linear or GitHub
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Short summary of the defect"
              className="rounded-xl h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sev">Severity / priority (optional)</Label>
            <Input
              id="sev"
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              placeholder="e.g. S2 — major, workaround exists"
              className="rounded-xl h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="env">Environment</Label>
            <textarea
              id="env"
              value={environment}
              onChange={(e) => setEnvironment(e.target.value)}
              placeholder={"Chrome 124 / macOS 14\nApp v3.2.1, staging, org ID …"}
              className="w-full min-h-[88px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dashboard-primary/20"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="repro">Steps to reproduce</Label>
            <textarea
              id="repro"
              value={repro}
              onChange={(e) => setRepro(e.target.value)}
              placeholder={"1. Log in as …\n2. Open …\n3. Click …"}
              className="w-full min-h-[120px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dashboard-primary/20"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="exp">Expected</Label>
            <textarea
              id="exp"
              value={expected}
              onChange={(e) => setExpected(e.target.value)}
              placeholder="What should happen"
              className="w-full min-h-[72px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dashboard-primary/20"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="act">Actual</Label>
            <textarea
              id="act"
              value={actual}
              onChange={(e) => setActual(e.target.value)}
              placeholder="What happened instead"
              className="w-full min-h-[72px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dashboard-primary/20"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="links">Links / attachments (optional)</Label>
            <textarea
              id="links"
              value={links}
              onChange={(e) => setLinks(e.target.value)}
              placeholder="Screenshots, HAR, trace IDs, PR links…"
              className="w-full min-h-[72px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dashboard-primary/20"
            />
          </div>

          <Button onClick={handleBuild} className="gap-2">
            <BugAntIcon className="size-4" />
            Format bug report
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
