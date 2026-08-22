"use client";

import { useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useToolAccess } from "@/lib/use-tool-access";

type Block = { title: string; start: string; end: string };

export default function TimeBlockingBuilderPage() {
  const { ensureAccess } = useToolAccess();
  const [title, setTitle] = useState("");
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("10:00");
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [error, setError] = useState<string | null>(null);

  const addBlock = () => {
    if (!ensureAccess()) return;
    if (!title.trim()) {
      setError("Block title is required.");
      return;
    }
    if (!start || !end || end <= start) {
      setError("End time must be after start time.");
      return;
    }
    setError(null);
    setBlocks((prev) => [...prev, { title: title.trim(), start, end }]);
    setTitle("");
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Time Blocking Builder</h1>
          <p className="mt-1 text-muted-foreground">
            Build a simple day schedule with focused time blocks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="Block title (e.g. Deep work)"
          />
          <input
            type="time"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <input
            type="time"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>

        <Button onClick={addBlock}>Add time block</Button>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <div className="rounded-xl border border-input bg-muted/30 p-5 space-y-3">
          <h2 className="text-sm font-semibold">Schedule</h2>
          {blocks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No blocks yet.</p>
          ) : (
            blocks.map((block, idx) => (
              <div key={`${block.start}-${block.end}-${idx}`} className="flex items-center justify-between text-sm">
                <span>{block.title}</span>
                <span className="text-muted-foreground">{block.start} - {block.end}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
