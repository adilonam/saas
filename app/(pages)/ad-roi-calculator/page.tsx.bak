"use client";

import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChartBarIcon, CalculatorIcon } from "@heroicons/react/24/outline";

export default function AdROICalculatorPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [adSpend, setAdSpend] = useState("");
  const [revenue, setRevenue] = useState("");
  const [resultUnlocked, setResultUnlocked] = useState(false);

  const result = useMemo(() => {
    const spend = parseFloat(adSpend) || 0;
    const rev = parseFloat(revenue) || 0;
    if (spend <= 0) return null;
    const roi = spend > 0 ? ((rev - spend) / spend) * 100 : 0;
    const roas = spend > 0 ? rev / spend : 0;
    const profit = rev - spend;
    return { roi, roas, profit, spend, rev };
  }, [adSpend, revenue]);

  const handleCalculate = () => {
    if (status === "unauthenticated" || !session) {
      router.push(
        `/signup?callbackUrl=${encodeURIComponent(pathname || "/ad-roi-calculator")}`
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

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600">
            <ChartBarIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Ad ROI Calculator
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Calculate return on ad spend (ROAS) and ROI from ad spend and revenue.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="ad-spend">Ad spend ($)</Label>
              <Input
                id="ad-spend"
                type="number"
                min="0"
                step="100"
                placeholder="1000"
                value={adSpend}
                onChange={(e) => setAdSpend(e.target.value)}
                className="rounded-xl h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="revenue">Revenue from ads ($)</Label>
              <Input
                id="revenue"
                type="number"
                min="0"
                step="100"
                placeholder="3500"
                value={revenue}
                onChange={(e) => setRevenue(e.target.value)}
                className="rounded-xl h-11"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              onClick={handleCalculate}
              disabled={!adSpend || parseFloat(adSpend) <= 0}
              className="gap-2"
            >
              <CalculatorIcon className="h-4 w-4" />
              Calculate
            </Button>
          </div>

          {result && resultUnlocked && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Results
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl bg-slate-100 dark:bg-slate-800/50 p-4">
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    ROI
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {result.roi.toFixed(1)}%
                  </p>
                </div>
                <div className="rounded-xl bg-slate-100 dark:bg-slate-800/50 p-4">
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    ROAS
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {result.roas.toFixed(2)}x
                  </p>
                </div>
                <div className="rounded-xl bg-slate-100 dark:bg-slate-800/50 p-4">
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Profit
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    ${result.profit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
