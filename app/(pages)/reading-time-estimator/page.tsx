"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BookOpenIcon } from "@heroicons/react/24/outline";
import { estimateReadingTime } from "@/lib/text-productivity";

export default function ReadingTimeEstimatorPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [text, setText] = useState("");
  const [wpm, setWpm] = useState("200");
  const [unlocked, setUnlocked] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof estimateReadingTime> | null>(null);

  const handleSubmit = () => {
    if (status === "unauthenticated" || !session) {
      router.push(
        `/signup?callbackUrl=${encodeURIComponent(pathname || "/reading-time-estimator")}`,
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
    const n = Number.parseInt(wpm, 10);
    setResult(estimateReadingTime(text, Number.isFinite(n) ? n : 200));
    setUnlocked(true);
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
            <BookOpenIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Reading Time Estimator</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Based on words per minute (WPM)
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="rte-wpm">Reading speed (words per minute)</Label>
            <Input
              id="rte-wpm"
              type="number"
              min={1}
              max={600}
              value={wpm}
              onChange={(e) => setWpm(e.target.value)}
              className="rounded-xl h-11 max-w-[200px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rte-text">Your text</Label>
            <textarea
              id="rte-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full min-h-[160px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 text-sm"
              placeholder="Paste article, script, or notes…"
              spellCheck={false}
            />
          </div>
          <Button type="button" onClick={handleSubmit} className="gap-2">
            <BookOpenIcon className="h-4 w-4" />
            Estimate reading time
          </Button>

          {unlocked && result && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                <span className="font-semibold">{result.words}</span> words at{" "}
                <span className="font-semibold">{result.wordsPerMinute}</span> WPM
              </p>
              <p className="text-lg font-medium">
                About{" "}
                {result.minutes > 0 ? (
                  <>
                    {result.minutes} min
                    {result.seconds > 0 ? ` ${result.seconds} sec` : ""}
                  </>
                ) : (
                  <>{result.totalSeconds} sec</>
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
