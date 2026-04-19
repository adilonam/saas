"use client";

import { useMemo, useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SparklesIcon } from "@heroicons/react/24/outline";
import { useToolAccess } from "@/lib/use-tool-access";

function formatMinutes(raw: string): string {
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const decisions = lines.filter((line) => /decision|approved|agreed/i.test(line));
  const actions = lines.filter((line) => /action|todo|owner|follow up|next step/i.test(line));

  return [
    "## Meeting Minutes",
    "",
    "### Summary",
    lines.slice(0, 4).map((line) => `- ${line}`).join("\n") || "- No summary points detected.",
    "",
    "### Decisions",
    decisions.length ? decisions.map((line) => `- ${line}`).join("\n") : "- No explicit decisions detected.",
    "",
    "### Action Items",
    actions.length ? actions.map((line) => `- ${line}`).join("\n") : "- No explicit action items detected.",
  ].join("\n");
}

export default function MeetingMinutesFormatterPage() {
  const { ensureAccess } = useToolAccess();
  const [notes, setNotes] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  const result = useMemo(() => {
    const trimmed = notes.trim();
    if (!trimmed) return "";
    return formatMinutes(trimmed);
  }, [notes]);

  const handleSubmit = () => {
    if (!ensureAccess()) return;
    setUnlocked(true);
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Meeting Minutes Formatter</h1>
          <p className="mt-1 text-muted-foreground">
            Turn raw meeting notes into structured minutes with summary, decisions, and action items.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="minutes-input">Raw notes</Label>
          <textarea
            id="minutes-input"
            className="w-full min-h-[180px] rounded-lg border border-input bg-background px-3 py-2 text-sm"
            placeholder="Paste your notes, transcript, or bullets..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <Button onClick={handleSubmit} disabled={!result} className="gap-2">
            <SparklesIcon className="h-4 w-4" />
            Format minutes
          </Button>
        </div>

        {unlocked && result && (
          <div className="space-y-2">
            <Label>Formatted output</Label>
            <div className="w-full min-h-[140px] rounded-lg border border-input bg-muted/50 p-4 text-sm whitespace-pre-wrap">
              {result}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
