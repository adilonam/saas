"use client";

import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChartBarIcon, CalculatorIcon } from "@heroicons/react/24/outline";

export default function ROICalculatorPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [initialInvestment, setInitialInvestment] = useState("");
  const [finalValue, setFinalValue] = useState("");
  const [resultUnlocked, setResultUnlocked] = useState(false);

  const handleCalculate = () => {
    if (status === "unauthenticated" || !session) {
      router.push(
        `/signup?callbackUrl=${encodeURIComponent(pathname || "/roi-calculator")}`,
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
    setResultUnlocked(true);
  };

  const result = useMemo(() => {
    const initial = parseFloat(initialInvestment.replace(/,/g, "")) || 0;
    const final = parseFloat(finalValue.replace(/,/g, "")) || 0;
    if (initial <= 0) return null;
    const gain = final - initial;
    const roiPercent = (gain / initial) * 100;
    return {
      gain,
      roiPercent,
      initial,
      final,
    };
  }, [initialInvestment, finalValue]);

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
            <ChartBarIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">ROI Calculator</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Return on investment from initial and final value
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="initial">Initial investment</Label>
            <Input
              id="initial"
              type="text"
              inputMode="decimal"
              placeholder="e.g. 5000"
              value={initialInvestment}
              onChange={(e) => setInitialInvestment(e.target.value.replace(/[^0-9.]/g, ""))}
              className="rounded-xl h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="final">Final value (or sale price)</Label>
            <Input
              id="final"
              type="text"
              inputMode="decimal"
              placeholder="e.g. 6500"
              value={finalValue}
              onChange={(e) => setFinalValue(e.target.value.replace(/[^0-9.]/g, ""))}
              className="rounded-xl h-11"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              onClick={handleCalculate}
              disabled={!initialInvestment || !finalValue || parseFloat(initialInvestment) <= 0}
              className="gap-2"
            >
              <CalculatorIcon className="h-4 w-4" />
              Calculate
            </Button>
          </div>

          {result && resultUnlocked && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-4">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">ROI</p>
                <p
                  className={`text-3xl font-bold ${
                    result.roiPercent >= 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {result.roiPercent >= 0 ? "+" : ""}
                  {result.roiPercent.toFixed(2)}%
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Gain / Loss</p>
                <p
                  className={`text-lg font-semibold ${
                    result.gain >= 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {result.gain >= 0 ? "+" : ""}$
                  {result.gain.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Initial ${result.initial.toLocaleString("en-US")} → Final $
                {result.final.toLocaleString("en-US")}
              </p>
            </div>
          )}
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mt-6">
          ROI % = (Final value − Initial investment) ÷ Initial investment × 100.
        </p>
      </div>
    </DashboardLayout>
  );
}
