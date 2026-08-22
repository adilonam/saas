"use client";

import { useMemo, useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ClipboardDocumentCheckIcon } from "@heroicons/react/24/outline";
import { useToolAccess } from "@/lib/use-tool-access";

export default function AcceptanceCriteriaGeneratorPage() {
  const { ensureAccess } = useToolAccess();
  const [feature, setFeature] = useState("");
  const [context, setContext] = useState("");
  const [includeGwt, setIncludeGwt] = useState(true);
  const [includeChecklist, setIncludeChecklist] = useState(true);
  const [built, setBuilt] = useState(false);

  const doc = useMemo(() => {
    const title = feature.trim() || "Feature";
    let out = `# Acceptance criteria — ${title}\n\n`;
    if (context.trim()) {
      out += `## Context\n${context.trim()}\n\n`;
    }
    if (includeGwt) {
      out += `## Scenarios (Given / When / Then)\n\n`;
      out += `### Happy path\n`;
      out += `- **Given** _(initial state or preconditions)_\n`;
      out += `- **When** _(user or system action)_\n`;
      out += `- **Then** _(expected observable outcome)_\n\n`;
      out += `### Edge / negative\n`;
      out += `- **Given** _…_\n`;
      out += `- **When** _…_\n`;
      out += `- **Then** _…_\n\n`;
    }
    if (includeChecklist) {
      out += `## Checklist\n`;
      out += `- [ ] UI matches spec (copy, spacing, states)\n`;
      out += `- [ ] Validation errors are clear and recoverable\n`;
      out += `- [ ] Permissions / roles enforced\n`;
      out += `- [ ] Telemetry or audit events (if required)\n`;
      out += `- [ ] Performance acceptable under expected load\n`;
      out += `- [ ] Accessibility basics (focus, labels, contrast)\n`;
    }
    return out;
  }, [feature, context, includeGwt, includeChecklist]);

  const handleBuild = () => {
    if (!ensureAccess()) return;
    setBuilt(true);
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
            <ClipboardDocumentCheckIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Acceptance criteria generator</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Template-based Given/When/Then blocks plus a practical checklist
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="feature">Feature or story title</Label>
            <Input
              id="feature"
              value={feature}
              onChange={(e) => setFeature(e.target.value)}
              placeholder="e.g. CSV invoice export"
              className="rounded-xl h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ctx">Context (optional)</Label>
            <textarea
              id="ctx"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Constraints, data sources, roles, links to mocks…"
              className="w-full min-h-[100px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dashboard-primary/20"
            />
          </div>
          <div className="flex flex-col gap-3 text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeGwt}
                onChange={(e) => setIncludeGwt(e.target.checked)}
                className="rounded border-slate-300"
              />
              Include Given / When / Then skeleton
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeChecklist}
                onChange={(e) => setIncludeChecklist(e.target.checked)}
                className="rounded border-slate-300"
              />
              Include engineering checklist
            </label>
          </div>

          <Button onClick={handleBuild} className="gap-2">
            <ClipboardDocumentCheckIcon className="size-4" />
            Generate criteria doc
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
