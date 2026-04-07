"use client";

import { useMemo, useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SparklesIcon } from "@heroicons/react/24/outline";
import { useToolAccess } from "@/lib/use-tool-access";

function buildBrief(
  projectName: string,
  objective: string,
  stakeholders: string,
  scope: string,
  timeline: string,
): string {
  return [
    `## Project Kickoff Brief: ${projectName}`,
    "",
    "### Objective",
    objective,
    "",
    "### Key Stakeholders",
    stakeholders,
    "",
    "### Scope",
    scope,
    "",
    "### Timeline",
    timeline,
    "",
    "### Initial Milestones",
    "- Discovery and requirements alignment",
    "- Implementation and internal review",
    "- UAT and launch readiness",
  ].join("\n");
}

export default function ProjectKickoffBriefPage() {
  const { ensureAccess } = useToolAccess();
  const [projectName, setProjectName] = useState("");
  const [objective, setObjective] = useState("");
  const [stakeholders, setStakeholders] = useState("");
  const [scope, setScope] = useState("");
  const [timeline, setTimeline] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  const result = useMemo(() => {
    const p = projectName.trim();
    const o = objective.trim();
    const s = stakeholders.trim();
    const sc = scope.trim();
    const t = timeline.trim();
    if (!p || !o || !s || !sc || !t) return "";
    return buildBrief(p, o, s, sc, t);
  }, [projectName, objective, stakeholders, scope, timeline]);

  const handleSubmit = () => {
    if (!ensureAccess()) return;
    setUnlocked(true);
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Project Kickoff Brief Generator</h1>
          <p className="mt-1 text-muted-foreground">
            Create a concise kickoff brief from project basics for team alignment.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="project-name">Project name</Label>
            <Input id="project-name" value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="e.g. Customer Portal Redesign" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="objective">Objective</Label>
            <textarea id="objective" className="w-full min-h-[90px] rounded-lg border border-input bg-background px-3 py-2 text-sm" value={objective} onChange={(e) => setObjective(e.target.value)} placeholder="What are you trying to achieve?" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stakeholders">Stakeholders</Label>
            <textarea id="stakeholders" className="w-full min-h-[90px] rounded-lg border border-input bg-background px-3 py-2 text-sm" value={stakeholders} onChange={(e) => setStakeholders(e.target.value)} placeholder="Teams, owners, sponsors" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="timeline">Timeline</Label>
            <textarea id="timeline" className="w-full min-h-[90px] rounded-lg border border-input bg-background px-3 py-2 text-sm" value={timeline} onChange={(e) => setTimeline(e.target.value)} placeholder="Start date, target launch, key phases" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="scope">Scope</Label>
            <textarea id="scope" className="w-full min-h-[100px] rounded-lg border border-input bg-background px-3 py-2 text-sm" value={scope} onChange={(e) => setScope(e.target.value)} placeholder="In-scope and out-of-scope boundaries" />
          </div>
        </div>

        <Button onClick={handleSubmit} disabled={!result} className="gap-2">
          <SparklesIcon className="h-4 w-4" />
          Generate kickoff brief
        </Button>

        {unlocked && result && (
          <div className="space-y-2">
            <Label>Generated brief</Label>
            <div className="w-full min-h-[180px] rounded-lg border border-input bg-muted/50 p-4 text-sm whitespace-pre-wrap">
              {result}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
