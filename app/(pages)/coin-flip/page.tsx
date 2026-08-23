"use client";

import { useState, useCallback } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { ArrowPathIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { useToolAccess } from "@/lib/use-tool-access";

type CoinSide = "heads" | "tails";

export default function CoinFlipPage() {
  const { ensureAccess } = useToolAccess();
  const [result, setResult] = useState<CoinSide | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);

  const flip = useCallback(() => {
    if (!ensureAccess()) return;
    setIsFlipping(true);
    setResult(null);
    window.setTimeout(() => {
      setResult(Math.random() < 0.5 ? "heads" : "tails");
      setIsFlipping(false);
    }, 500);
  }, [ensureAccess]);

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-lg space-y-8">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
            <SparklesIcon className="size-7" aria-hidden />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Coin Flip
            </h1>
            <p className="text-sm text-muted-foreground">
              Fair 50/50 heads or tails — tap flip when you are ready.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
          <div
            className="mx-auto mb-6 flex size-40 items-center justify-center rounded-full border-4 border-slate-200 bg-linear-to-br from-slate-100 to-slate-200 text-4xl font-bold text-slate-700 shadow-inner dark:border-slate-600 dark:from-slate-800 dark:to-slate-900 dark:text-slate-200"
            aria-live="polite"
          >
            {isFlipping ? (
              <span className="animate-pulse">…</span>
            ) : result === "heads" ? (
              "Heads"
            ) : result === "tails" ? (
              "Tails"
            ) : (
              <span className="text-lg font-medium text-muted-foreground">
                Ready
              </span>
            )}
          </div>

          <Button
            type="button"
            size="lg"
            onClick={flip}
            disabled={isFlipping}
            className="gap-2 rounded-xl"
          >
            <ArrowPathIcon
              className={`size-5 ${isFlipping ? "animate-spin" : ""}`}
            />
            {isFlipping ? "Flipping…" : "Flip coin"}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
