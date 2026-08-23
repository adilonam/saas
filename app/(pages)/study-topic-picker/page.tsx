"use client";

import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { QueueListIcon } from "@heroicons/react/24/outline";

function parsePool(text: string): string[] {
  const lines = text.split(/\r\n|\r|\n/);
  const out: string[] = [];
  const seen = new Set<string>();
  for (const line of lines) {
    const t = line.trim();
    if (!t) continue;
    const k = t.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(t);
  }
  return out;
}

export default function StudyTopicPickerPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [poolText, setPoolText] = useState(
    "Chapter 3 review\nPractice problems\nFlashcards\nPast exam\nOffice hours recap",
  );
  const [picked, setPicked] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [unlocked, setUnlocked] = useState(false);

  const pool = useMemo(() => parsePool(poolText), [poolText]);

  const gate = () => {
    if (status === "unauthenticated" || !session) {
      router.push(
        `/signup?callbackUrl=${encodeURIComponent(pathname || "/study-topic-picker")}`,
      );
      return false;
    }
    const hasActiveSubscription =
      session.user.subscriptionExpiresAt &&
      new Date(session.user.subscriptionExpiresAt) > new Date();
    if (!hasActiveSubscription) {
      router.push("/pricing");
      return false;
    }
    return true;
  };

  const handlePick = () => {
    if (!gate()) return;
    setUnlocked(true);
    if (pool.length === 0) {
      setPicked(null);
      return;
    }
    const i = Math.floor(Math.random() * pool.length);
    const choice = pool[i];
    setPicked(choice);
    setHistory((h) => [choice, ...h].slice(0, 12));
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600">
            <QueueListIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Study topic picker</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              One random line from your pool — good for breaking tie on what to study next
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="stp-pool">Topic pool (one per line)</Label>
            <textarea
              id="stp-pool"
              value={poolText}
              onChange={(e) => setPoolText(e.target.value)}
              className="w-full min-h-[200px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 text-sm"
              spellCheck={false}
            />
          </div>
          <p className="text-xs text-slate-500">{pool.length} unique topics loaded.</p>
          <Button type="button" onClick={handlePick} className="gap-2">
            Pick a topic
          </Button>

          {unlocked && picked && (
            <div className="rounded-2xl border border-cyan-200 dark:border-cyan-800 bg-cyan-50/60 dark:bg-cyan-900/20 p-5">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Next up</p>
              <p className="text-2xl font-bold text-cyan-700 dark:text-cyan-300">{picked}</p>
            </div>
          )}

          {unlocked && history.length > 1 && (
            <div className="text-sm text-slate-500">
              <p className="font-medium text-slate-700 dark:text-slate-300 mb-2">Recent picks</p>
              <ul className="list-disc pl-5 space-y-1">
                {history.map((h, idx) => (
                  <li key={`${h}-${idx}`}>{h}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
