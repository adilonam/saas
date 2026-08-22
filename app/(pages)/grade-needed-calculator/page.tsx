"use client";

import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CalculatorIcon } from "@heroicons/react/24/outline";

export default function GradeNeededCalculatorPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [currentPct, setCurrentPct] = useState("82");
  const [weightDonePct, setWeightDonePct] = useState("70");
  const [weightFinalPct, setWeightFinalPct] = useState("30");
  const [targetPct, setTargetPct] = useState("80");
  const [unlocked, setUnlocked] = useState(false);

  const result = useMemo(() => {
    const c = Number.parseFloat(currentPct);
    const wd = Number.parseFloat(weightDonePct);
    const wf = Number.parseFloat(weightFinalPct);
    const t = Number.parseFloat(targetPct);
    if (![c, wd, wf, t].every((n) => Number.isFinite(n))) return null;
    const sum = wd + wf;
    if (sum <= 0) return null;
    const wdn = (wd / sum) * 100;
    const wfn = (wf / sum) * 100;
    const needed = (t - (wdn / 100) * c) / (wfn / 100);
    return { needed, wdn, wfn };
  }, [currentPct, weightDonePct, weightFinalPct, targetPct]);

  const handleCalculate = () => {
    if (status === "unauthenticated" || !session) {
      router.push(
        `/signup?callbackUrl=${encodeURIComponent(pathname || "/grade-needed-calculator")}`,
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
    setUnlocked(true);
  };

  const msg =
    result != null && Number.isFinite(result.needed)
      ? result.needed > 100
        ? "Not reachable with these weights — you would need over 100% on the final."
        : result.needed < 0
          ? "You could score 0 on the final and still meet the target (check inputs)."
          : null
      : "Enter valid numbers.";

  return (
    <DashboardLayout>
      <div className="max-w-xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-600">
            <CalculatorIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Grade needed on final</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Weighted average: known work plus one final exam
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="gnc-current">Current average in graded work so far (%)</Label>
            <Input
              id="gnc-current"
              type="number"
              value={currentPct}
              onChange={(e) => setCurrentPct(e.target.value)}
              className="rounded-xl h-11"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gnc-wd">Weight: graded so far (%)</Label>
              <Input
                id="gnc-wd"
                type="number"
                value={weightDonePct}
                onChange={(e) => setWeightDonePct(e.target.value)}
                className="rounded-xl h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gnc-wf">Weight: final (%)</Label>
              <Input
                id="gnc-wf"
                type="number"
                value={weightFinalPct}
                onChange={(e) => setWeightFinalPct(e.target.value)}
                className="rounded-xl h-11"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="gnc-target">Target course grade (%)</Label>
            <Input
              id="gnc-target"
              type="number"
              value={targetPct}
              onChange={(e) => setTargetPct(e.target.value)}
              className="rounded-xl h-11"
            />
          </div>
          <p className="text-xs text-slate-500">
            Weights are renormalized if they do not sum to 100 (e.g. 70 + 30).
          </p>
          <Button type="button" onClick={handleCalculate} className="gap-2">
            <CalculatorIcon className="size-4" />
            Calculate
          </Button>

          {unlocked && result != null && Number.isFinite(result.needed) && (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
              {result.needed >= 0 && result.needed <= 100 ? (
                <p className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">
                  Need {Math.round(result.needed * 10) / 10}% on the final
                </p>
              ) : (
                <p className="text-sm text-amber-700 dark:text-amber-300">{msg}</p>
              )}
              <p className="text-xs text-slate-500">
                Using normalized weights: {(Math.round(result.wdn * 10) / 10).toFixed(1)}% prior +{" "}
                {(Math.round(result.wfn * 10) / 10).toFixed(1)}% final.
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
