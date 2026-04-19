"use client";

import { useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ViewColumnsIcon } from "@heroicons/react/24/outline";
import { useToolAccess } from "@/lib/use-tool-access";

export default function RetrospectiveBoardPage() {
  const { ensureAccess } = useToolAccess();
  const [title, setTitle] = useState("");
  const [wentWell, setWentWell] = useState("");
  const [improve, setImprove] = useState("");
  const [actions, setActions] = useState("");
  const [doc, setDoc] = useState("");

  const handleCompile = () => {
    if (!ensureAccess()) return;
    const head = title.trim() || "Sprint retrospective";
    const w = wentWell.trim() || "—";
    const i = improve.trim() || "—";
    const a = actions.trim() || "—";
    setDoc(
      `# ${head}\n\n## Went well\n${w}\n\n## Improve\n${i}\n\n## Actions\n${a}\n`,
    );
  };

  const copy = async () => {
    if (!doc) return;
    await navigator.clipboard.writeText(doc);
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Retrospective board</h1>
          <p className="mt-1 text-muted-foreground">
            Capture went well, improve, and actions — then export as a short markdown note.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-2 md:col-span-3">
            <Label htmlFor="retro-title">Title / sprint</Label>
            <Input
              id="retro-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Sprint 24 retro"
            />
          </div>
          <div className="space-y-2 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20 p-4">
            <Label htmlFor="retro-ww" className="text-emerald-800 dark:text-emerald-300">
              Went well
            </Label>
            <textarea
              id="retro-ww"
              value={wentWell}
              onChange={(e) => setWentWell(e.target.value)}
              rows={8}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div className="space-y-2 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/40 dark:bg-amber-950/20 p-4">
            <Label htmlFor="retro-imp" className="text-amber-900 dark:text-amber-200">
              Improve
            </Label>
            <textarea
              id="retro-imp"
              value={improve}
              onChange={(e) => setImprove(e.target.value)}
              rows={8}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div className="space-y-2 rounded-xl border border-sky-200 dark:border-sky-900/50 bg-sky-50/40 dark:bg-sky-950/20 p-4">
            <Label htmlFor="retro-act" className="text-sky-900 dark:text-sky-200">
              Actions
            </Label>
            <textarea
              id="retro-act"
              value={actions}
              onChange={(e) => setActions(e.target.value)}
              rows={8}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </div>

        <Button onClick={handleCompile} className="gap-2 w-full sm:w-auto">
          <ViewColumnsIcon className="h-4 w-4" />
          Compile retro note
        </Button>

        {doc && (
          <div className="rounded-xl border border-input bg-muted/30 p-6 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-medium">Markdown</h2>
              <Button type="button" variant="outline" size="sm" onClick={copy}>
                Copy
              </Button>
            </div>
            <pre className="whitespace-pre-wrap rounded-lg border border-input bg-background p-4 text-sm max-h-[320px] overflow-auto">
              {doc}
            </pre>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
