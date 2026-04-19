"use client";

import { useMemo, useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ChatBubbleBottomCenterTextIcon } from "@heroicons/react/24/outline";
import { useToolAccess } from "@/lib/use-tool-access";

export default function UserStorySplitterPage() {
  const { ensureAccess } = useToolAccess();
  const [persona, setPersona] = useState("");
  const [want, setWant] = useState("");
  const [soThat, setSoThat] = useState("");
  const [notes, setNotes] = useState("");
  const [built, setBuilt] = useState(false);

  const story = useMemo(() => {
    const a = persona.trim() || "…";
    const w = want.trim() || "…";
    const s = soThat.trim() || "…";
    const n = notes.trim();
    let out = `## User story\n\n**As a** ${a},  \n**I want** ${w},  \n**so that** ${s}.\n`;
    if (n) out += `\n### Notes / acceptance hints\n${n}\n`;
    return out;
  }, [persona, want, soThat, notes]);

  const handleBuild = () => {
    if (!ensureAccess()) return;
    setBuilt(true);
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600">
            <ChatBubbleBottomCenterTextIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">User story splitter</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Structured “As a / I want / So that” with optional notes for backlog cards
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="persona">As a</Label>
            <textarea
              id="persona"
              value={persona}
              onChange={(e) => setPersona(e.target.value)}
              placeholder="e.g. finance admin on the Growth plan"
              className="w-full min-h-[72px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dashboard-primary/20"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="want">I want</Label>
            <textarea
              id="want"
              value={want}
              onChange={(e) => setWant(e.target.value)}
              placeholder="e.g. to export paid invoices as CSV for a date range"
              className="w-full min-h-[72px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dashboard-primary/20"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="so">So that</Label>
            <textarea
              id="so"
              value={soThat}
              onChange={(e) => setSoThat(e.target.value)}
              placeholder="e.g. month-end close takes less manual copy-paste"
              className="w-full min-h-[72px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dashboard-primary/20"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Links, edge cases, or draft acceptance ideas"
              className="w-full min-h-[80px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dashboard-primary/20"
            />
          </div>

          <Button onClick={handleBuild} className="gap-2">
            <ChatBubbleBottomCenterTextIcon className="size-4" />
            Format user story
          </Button>

          {built && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-2">
              <pre className="text-xs sm:text-sm whitespace-pre-wrap rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-4 overflow-x-auto text-slate-800 dark:text-slate-200">
                {story}
              </pre>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
