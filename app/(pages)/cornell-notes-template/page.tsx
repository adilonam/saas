"use client";

import { useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DocumentTextIcon } from "@heroicons/react/24/outline";
import { useSubscribedToolAccess } from "@/hooks/useSubscribedToolAccess";

function buildTemplate(title: string, rows: number) {
  const cues = Array.from({ length: rows }, (_, i) => `Cue ${i + 1}\tNotes for cue ${i + 1}`);
  const line = "-".repeat(48);
  return [
    title.trim() || "Topic",
    "",
    "CORNELL LAYOUT (2:1 notes : summary)",
    "",
    `Title: ${title.trim() || "________________"}`,
    "",
    "Cues (left, ~1/3)\tNotes (right, ~2/3)",
    ...cues,
    "",
    line,
    "Summary (after class, 2–4 sentences)",
    "",
    "",
  ].join("\n");
}

export default function CornellNotesTemplatePage() {
  const { assertAccess } = useSubscribedToolAccess("/cornell-notes-template");
  const [title, setTitle] = useState("");
  const [rows, setRows] = useState("8");
  const [out, setOut] = useState("");

  const handleSubmit = () => {
    if (!assertAccess()) return;
    const n = Math.min(30, Math.max(3, parseInt(rows, 10) || 8));
    setOut(buildTemplate(title, n));
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Cornell notes template</h1>
          <p className="mt-1 text-muted-foreground">
            Generate a printable-style plain-text grid: cues column, notes column, and summary band.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="title">Topic / course</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Lecture 4 — Demand curves"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rows">Cue rows (3–30)</Label>
            <Input id="rows" type="number" min={3} max={30} value={rows} onChange={(e) => setRows(e.target.value)} />
          </div>
        </div>

        <Button type="button" onClick={handleSubmit} className="gap-2">
          <DocumentTextIcon className="h-4 w-4" />
          Generate template
        </Button>

        {out && (
          <div className="space-y-2">
            <Label>Copy or print</Label>
            <textarea
              readOnly
              className="w-full min-h-[320px] rounded-lg border border-input bg-muted/30 p-3 text-xs font-mono"
              value={out}
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
