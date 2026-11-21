"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { QueueListIcon } from "@heroicons/react/24/outline";
import { removeDuplicateLines } from "@/lib/text-productivity";

export default function RemoveDuplicateLinesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [text, setText] = useState("");
  const [trimEach, setTrimEach] = useState(true);
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [output, setOutput] = useState("");
  const [removed, setRemoved] = useState(0);

  const handleSubmit = () => {
    if (status === "unauthenticated" || !session) {
      router.push(
        `/signup?callbackUrl=${encodeURIComponent(pathname || "/remove-duplicate-lines")}`,
      );
      return;
    }
    const hasActiveSubscription =
      session.user.subscriptionExpiresAt &&
      new Date(session.user.subscriptionExpiresAt) > new Date();
    if (!hasActiveSubscription) {
      router.push("/pricing");
      return;
    }
    const before = text.split(/\r\n|\r|\n/).length;
    const result = removeDuplicateLines(text, { trimEach, ignoreCase });
    const after = result.split(/\r\n|\r|\n/).length;
    setOutput(result);
    setRemoved(Math.max(0, before - after));
    setUnlocked(true);
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-sky-600">
            <QueueListIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Remove Duplicate Lines</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Keep first occurrence, drop later repeats
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={trimEach}
                onChange={(e) => setTrimEach(e.target.checked)}
                className="rounded border-slate-300"
              />
              Compare trimmed lines
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={ignoreCase}
                onChange={(e) => setIgnoreCase(e.target.checked)}
                className="rounded border-slate-300"
              />
              Ignore case when matching
            </label>
          </div>
          <div className="space-y-2">
            <Label htmlFor="rdl-input">Input</Label>
            <textarea
              id="rdl-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full min-h-[180px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 text-sm font-mono"
              placeholder="One line per row…"
              spellCheck={false}
            />
          </div>
          <Button type="button" onClick={handleSubmit} className="gap-2">
            <QueueListIcon className="h-4 w-4" />
            Remove duplicates
          </Button>

          {unlocked && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-3">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Removed <span className="font-semibold tabular-nums">{removed}</span> duplicate line
                {removed === 1 ? "" : "s"}
              </p>
              <div className="space-y-2">
                <Label htmlFor="rdl-output">Result</Label>
                <textarea
                  id="rdl-output"
                  readOnly
                  value={output}
                  className="w-full min-h-[180px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-950 p-4 text-sm font-mono"
                  spellCheck={false}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
