"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Bars3BottomLeftIcon } from "@heroicons/react/24/outline";
import { countTextStats } from "@/lib/text-productivity";

export default function WordCounterPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [text, setText] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [stats, setStats] = useState<ReturnType<typeof countTextStats> | null>(null);

  const handleSubmit = () => {
    if (status === "unauthenticated" || !session) {
      router.push(`/signup?callbackUrl=${encodeURIComponent(pathname || "/word-counter")}`);
      return;
    }
    const hasActiveSubscription =
      session.user.subscriptionExpiresAt &&
      new Date(session.user.subscriptionExpiresAt) > new Date();
    if (!hasActiveSubscription) {
      router.push("/pricing");
      return;
    }
    setStats(countTextStats(text));
    setUnlocked(true);
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600">
            <Bars3BottomLeftIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Word Counter</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Words, characters, lines, and paragraphs
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="wc-text">Your text</Label>
            <textarea
              id="wc-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full min-h-[160px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 text-sm"
              placeholder="Paste or type text…"
              spellCheck={false}
            />
          </div>
          <Button type="button" onClick={handleSubmit} className="gap-2">
            <Bars3BottomLeftIcon className="h-4 w-4" />
            Count words
          </Button>

          {unlocked && stats && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 grid grid-cols-2 sm:grid-cols-3 gap-4">
              {(
                [
                  ["Words", stats.wordCount],
                  ["Characters (with spaces)", stats.charsWithSpaces],
                  ["Characters (no spaces)", stats.charsNoSpaces],
                  ["Lines", stats.lines],
                  ["Non-empty lines", stats.nonEmptyLines],
                  ["Paragraphs", stats.paragraphs],
                ] as const
              ).map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/60 p-4"
                >
                  <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
                  <p className="text-2xl font-semibold tabular-nums mt-1">{value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
