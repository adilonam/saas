"use client";

import { useMemo, useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SparklesIcon } from "@heroicons/react/24/outline";
import { useToolAccess } from "@/lib/use-tool-access";

function summarizeThread(text: string): string {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const senderLines = lines.filter((line) => /^from:/i.test(line));
  const actionLines = lines.filter((line) => /action|required|please|follow up|deadline/i.test(line));

  return [
    "## Email Thread Summary",
    "",
    `- Estimated messages: ${Math.max(senderLines.length, 1)}`,
    `- Potential action items: ${actionLines.length}`,
    "",
    "### Key points",
    lines.slice(0, 6).map((line) => `- ${line}`).join("\n") || "- No key points detected.",
    "",
    "### Action items",
    actionLines.length ? actionLines.slice(0, 8).map((line) => `- ${line}`).join("\n") : "- No action items detected.",
  ].join("\n");
}

export default function EmailThreadSummarizerPage() {
  const { ensureAccess } = useToolAccess();
  const [threadText, setThreadText] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  const result = useMemo(() => {
    const trimmed = threadText.trim();
    if (!trimmed) return "";
    return summarizeThread(trimmed);
  }, [threadText]);

  const handleSubmit = () => {
    if (!ensureAccess()) return;
    setUnlocked(true);
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Email Thread Summarizer</h1>
          <p className="mt-1 text-muted-foreground">
            Paste a long thread and get a compact summary with key points and likely action items.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="thread-input">Email thread</Label>
          <textarea
            id="thread-input"
            className="w-full min-h-[220px] rounded-lg border border-input bg-background px-3 py-2 text-sm"
            placeholder="Paste the full email thread..."
            value={threadText}
            onChange={(e) => setThreadText(e.target.value)}
          />
          <Button onClick={handleSubmit} disabled={!result} className="gap-2">
            <SparklesIcon className="h-4 w-4" />
            Summarize thread
          </Button>
        </div>

        {unlocked && result && (
          <div className="space-y-2">
            <Label>Summary</Label>
            <div className="w-full min-h-[140px] rounded-lg border border-input bg-muted/50 p-4 text-sm whitespace-pre-wrap">
              {result}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
