"use client";

import { useMemo, useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SparklesIcon } from "@heroicons/react/24/outline";
import { useToolAccess } from "@/lib/use-tool-access";

function buildDiff(oldText: string, newText: string): string {
  const oldLines = oldText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const newLines = newText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const oldSet = new Set(oldLines);
  const newSet = new Set(newLines);

  const added = newLines.filter((line) => !oldSet.has(line));
  const removed = oldLines.filter((line) => !newSet.has(line));

  return [
    "## SOP Version Diff",
    "",
    "### Added",
    added.length ? added.map((line) => `+ ${line}`).join("\n") : "+ No added lines",
    "",
    "### Removed",
    removed.length ? removed.map((line) => `- ${line}`).join("\n") : "- No removed lines",
  ].join("\n");
}

export default function SopVersionDiffPage() {
  const { ensureAccess } = useToolAccess();
  const [oldVersion, setOldVersion] = useState("");
  const [newVersion, setNewVersion] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  const result = useMemo(() => {
    const oldTrimmed = oldVersion.trim();
    const newTrimmed = newVersion.trim();
    if (!oldTrimmed || !newTrimmed) return "";
    return buildDiff(oldTrimmed, newTrimmed);
  }, [oldVersion, newVersion]);

  const handleSubmit = () => {
    if (!ensureAccess()) return;
    setUnlocked(true);
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">SOP Version Diff Checker</h1>
          <p className="mt-1 text-muted-foreground">
            Compare two SOP drafts and quickly review added or removed lines.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="old-sop">Old version</Label>
            <textarea
              id="old-sop"
              className="w-full min-h-[220px] rounded-lg border border-input bg-background px-3 py-2 text-sm"
              placeholder="Paste previous SOP version..."
              value={oldVersion}
              onChange={(e) => setOldVersion(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-sop">New version</Label>
            <textarea
              id="new-sop"
              className="w-full min-h-[220px] rounded-lg border border-input bg-background px-3 py-2 text-sm"
              placeholder="Paste updated SOP version..."
              value={newVersion}
              onChange={(e) => setNewVersion(e.target.value)}
            />
          </div>
        </div>

        <Button onClick={handleSubmit} disabled={!result} className="gap-2">
          <SparklesIcon className="h-4 w-4" />
          Check diff
        </Button>

        {unlocked && result && (
          <div className="space-y-2">
            <Label>Diff result</Label>
            <div className="w-full min-h-[140px] rounded-lg border border-input bg-muted/50 p-4 text-sm whitespace-pre-wrap">
              {result}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
