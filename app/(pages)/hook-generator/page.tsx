"use client";

import { useMemo, useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { BoltIcon } from "@heroicons/react/24/outline";
import { useToolAccess } from "@/lib/use-tool-access";

const HOOK_TEMPLATES = [
  (t: string) => `I almost quit ${t} until I learned this one thing.`,
  (t: string) => `Nobody talks about ${t} — but they should.`,
  (t: string) => `Stop scrolling if you care about ${t}.`,
  (t: string) => `3 mistakes everyone makes with ${t} (and how to fix them).`,
  (t: string) => `What I'd tell my past self about ${t}.`,
  (t: string) => `This changed how I think about ${t} forever.`,
  (t: string) => `If you're into ${t}, save this before it gets buried.`,
  (t: string) => `The truth about ${t} that took me years to accept.`,
];

export default function HookGeneratorPage() {
  const { ensureAccess } = useToolAccess();
  const [topic, setTopic] = useState("");
  const [hooks, setHooks] = useState<string[]>([]);

  const trimmed = topic.trim();

  const previewDisabled = useMemo(() => !trimmed, [trimmed]);

  const handleGenerate = () => {
    if (!ensureAccess()) return;
    if (!trimmed) return;
    setHooks(HOOK_TEMPLATES.map((fn) => fn(trimmed)));
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-start gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 dark:bg-violet-900/30">
            <BoltIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Hook generator</h1>
            <p className="mt-1 text-muted-foreground text-sm">
              Simple fill-in hooks for short-form video or posts. Add your topic and copy what fits.
            </p>
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-input bg-card p-6">
          <div className="space-y-2">
            <Label htmlFor="topic">Topic or niche</Label>
            <Input
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. morning routines, budgeting, Python"
            />
          </div>
          <Button type="button" onClick={handleGenerate} disabled={previewDisabled} className="gap-2">
            Generate hooks
          </Button>
        </div>

        {hooks.length > 0 && (
          <ul className="space-y-3">
            {hooks.map((h, i) => (
              <li
                key={i}
                className="flex flex-col gap-2 rounded-xl border border-input bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <p className="text-sm text-foreground">{h}</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  onClick={() => navigator.clipboard.writeText(h)}
                >
                  Copy
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </DashboardLayout>
  );
}
