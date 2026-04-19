"use client";

import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BoltIcon } from "@heroicons/react/24/outline";
import { estimateReadingTime } from "@/lib/text-productivity";

const SAMPLE_PASSAGE = `The ability to read quickly while keeping comprehension is useful for students and professionals alike. Rather than rushing through every page, most people benefit from a steady rhythm and short breaks. A simple way to measure speed is to time yourself on a passage of known length and then divide the word count by the minutes elapsed. Remember that charts, headings, and technical vocabulary can slow you down, and that is normal. Use this tool to benchmark your words per minute on a fixed sample and separately estimate how long a full article might take at your usual pace. Adjust your target speed based on the material: literature may deserve a slower rate than a news brief.`;

function countWords(s: string): number {
  const t = s.trim();
  return t.length === 0 ? 0 : t.split(/\s+/).length;
}

export default function ReadingSpeedTestPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const passageWords = useMemo(() => countWords(SAMPLE_PASSAGE), []);
  const [unlocked, setUnlocked] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [finishedAt, setFinishedAt] = useState<number | null>(null);
  const [article, setArticle] = useState("");
  const [wpmSetting, setWpmSetting] = useState("200");
  const [articleEstimate, setArticleEstimate] = useState<ReturnType<typeof estimateReadingTime> | null>(null);

  const elapsedSec =
    startedAt != null && finishedAt != null ? Math.max(1, (finishedAt - startedAt) / 1000) : null;
  const measuredWpm =
    elapsedSec != null ? Math.round((passageWords / elapsedSec) * 60) : null;

  const requirePremium = () => {
    if (status === "unauthenticated" || !session) {
      router.push(
        `/signup?callbackUrl=${encodeURIComponent(pathname || "/reading-speed-test")}`,
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
    setUnlocked(true);
    return true;
  };

  const handleStart = () => {
    if (!requirePremium()) return;
    setStartedAt(performance.now());
    setFinishedAt(null);
  };

  const handleFinish = () => {
    if (!requirePremium()) return;
    if (startedAt == null) return;
    setFinishedAt(performance.now());
  };

  const handleReset = () => {
    setStartedAt(null);
    setFinishedAt(null);
  };

  const handleArticleEstimate = () => {
    if (!requirePremium()) return;
    const n = Number.parseInt(wpmSetting, 10);
    setArticleEstimate(estimateReadingTime(article, Number.isFinite(n) ? n : 200));
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600">
            <BoltIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Reading speed test</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Measure WPM on a sample passage and estimate time to finish your own text
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-8">
          <section className="space-y-4">
            <h2 className="font-semibold text-slate-900 dark:text-white">1. Timed passage</h2>
            <p className="text-xs text-slate-500">
              {passageWords} words — read at a natural pace, then tap Done.
            </p>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/40 p-4 text-sm leading-relaxed text-slate-800 dark:text-slate-200 max-h-64 overflow-y-auto">
              {SAMPLE_PASSAGE}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={handleStart} disabled={startedAt != null && finishedAt == null}>
                Start timer
              </Button>
              <Button
                type="button"
                onClick={handleFinish}
                disabled={startedAt == null || finishedAt != null}
              >
                Done reading
              </Button>
              <Button type="button" variant="ghost" onClick={handleReset}>
                Reset
              </Button>
            </div>
            {unlocked && measuredWpm != null && (
              <p className="text-lg font-semibold text-cyan-600 dark:text-cyan-400">
                About {measuredWpm} WPM ({(elapsedSec! / 60).toFixed(2)} min)
              </p>
            )}
          </section>

          <section className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-700">
            <h2 className="font-semibold text-slate-900 dark:text-white">2. Time to finish an article</h2>
            <div className="space-y-2">
              <Label htmlFor="rsw-wpm">Your usual WPM</Label>
              <Input
                id="rsw-wpm"
                type="number"
                min={60}
                max={600}
                value={wpmSetting}
                onChange={(e) => setWpmSetting(e.target.value)}
                className="rounded-xl h-11 max-w-[200px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rsw-article">Paste article or chapter</Label>
              <textarea
                id="rsw-article"
                value={article}
                onChange={(e) => setArticle(e.target.value)}
                className="w-full min-h-[140px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 text-sm"
                placeholder="Paste text…"
                spellCheck={false}
              />
            </div>
            <Button type="button" onClick={handleArticleEstimate}>
              Estimate reading time
            </Button>
            {unlocked && articleEstimate && (
              <p className="text-slate-700 dark:text-slate-200">
                {articleEstimate.words} words at {articleEstimate.wordsPerMinute} WPM → about{" "}
                <span className="font-semibold text-cyan-600 dark:text-cyan-400">
                  {articleEstimate.minutes} min {articleEstimate.seconds} sec
                </span>
              </p>
            )}
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}
