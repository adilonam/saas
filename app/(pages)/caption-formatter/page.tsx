"use client";

import { useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ChatBubbleBottomCenterTextIcon } from "@heroicons/react/24/outline";
import { useToolAccess } from "@/lib/use-tool-access";

function formatCaption(raw: string, options: { collapseLines: boolean; trimLines: boolean }): string {
  let s = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  if (options.trimLines) {
    s = s
      .split("\n")
      .map((line) => line.trim())
      .join("\n");
  }
  if (options.collapseLines) {
    s = s.replace(/\n{3,}/g, "\n\n");
  }
  return s.trim();
}

export default function CaptionFormatterPage() {
  const { ensureAccess } = useToolAccess();
  const [input, setInput] = useState("");
  const [collapseLines, setCollapseLines] = useState(true);
  const [trimLines, setTrimLines] = useState(true);
  const [output, setOutput] = useState("");

  const handleFormat = () => {
    if (!ensureAccess()) return;
    setOutput(formatCaption(input, { collapseLines, trimLines }));
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-start gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-sky-600 dark:bg-sky-900/30">
            <ChatBubbleBottomCenterTextIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Caption formatter</h1>
            <p className="mt-1 text-muted-foreground text-sm">
              Normalize line breaks and trim spacing for Instagram, TikTok, or YouTube descriptions.
            </p>
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-input bg-card p-6">
          <div className="space-y-2">
            <Label htmlFor="caption-in">Raw caption</Label>
            <textarea
              id="caption-in"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste a messy caption…"
              className="min-h-[160px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={trimLines}
                onChange={(e) => setTrimLines(e.target.checked)}
                className="size-4 rounded border-input"
              />
              Trim each line
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={collapseLines}
                onChange={(e) => setCollapseLines(e.target.checked)}
                className="size-4 rounded border-input"
              />
              Collapse 3+ blank lines to 2
            </label>
          </div>
          <Button type="button" onClick={handleFormat} className="gap-2">
            Format caption
          </Button>
        </div>

        {output !== "" && (
          <div className="space-y-2 rounded-xl border border-input bg-muted/30 p-6">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="caption-out">Formatted</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => navigator.clipboard.writeText(output)}
              >
                Copy
              </Button>
            </div>
            <textarea
              id="caption-out"
              readOnly
              value={output}
              className="min-h-[160px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
