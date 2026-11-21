"use client";

import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { BanknotesIcon, CalculatorIcon } from "@heroicons/react/24/outline";

export default function StartupValuationCalculatorPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [revenue, setRevenue] = useState("");
  const [growthRate, setGrowthRate] = useState("");
  const [margin, setMargin] = useState("");
  const [multiple, setMultiple] = useState("5");
  const [resultUnlocked, setResultUnlocked] = useState(false);

  const result = useMemo(() => {
    const rev = parseFloat(revenue) || 0;
    const growth = parseFloat(growthRate) || 0;
    const m = parseFloat(margin) || 0;
    const mult = parseFloat(multiple) || 5;
    if (rev <= 0) return null;
    const arr = rev * (1 + growth / 100);
    const profit = arr * (m / 100);
    const valuation = profit > 0 ? profit * mult : rev * Math.min(mult, 3);
    return {
      arr,
      profit,
      valuation,
      multiple: mult,
    };
  }, [revenue, growthRate, margin, multiple]);

  const handleCalculate = () => {
    if (status === "unauthenticated" || !session) {
      router.push(
        `/signup?callbackUrl=${encodeURIComponent(pathname || "/startup-valuation-calculator")}`
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
          <div className="size-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
            <BanknotesIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Startup Valuation Calculator
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Estimate valuation from revenue, growth, margin, and multiple.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="revenue">Annual revenue ($)</Label>
              <Input
                id="revenue"
                type="number"
                min="0"
                step="1000"
                placeholder="500000"
                value={revenue}
                onChange={(e) => setRevenue(e.target.value)}
                className="rounded-xl h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="growth">Growth rate (% per year)</Label>
              <Input
                id="growth"
                type="number"
                min="0"
                step="1"
                placeholder="50"
                value={growthRate}
                onChange={(e) => setGrowthRate(e.target.value)}
                className="rounded-xl h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="margin">Profit margin (%)</Label>
              <Input
                id="margin"
                type="number"
                min="0"
                max="100"
                step="1"
                placeholder="20"
                value={margin}
                onChange={(e) => setMargin(e.target.value)}
                className="rounded-xl h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="multiple">Revenue / profit multiple</Label>
              <Input
                id="multiple"
                type="number"
                min="1"
                step="0.5"
                placeholder="5"
                value={multiple}
                onChange={(e) => setMultiple(e.target.value)}
                className="rounded-xl h-11"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button onClick={handleCalculate} className="gap-2">
              <CalculatorIcon className="h-4 w-4" />
              Calculate
            </Button>
          </div>

          {result && resultUnlocked && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Estimated valuation
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                ${result.valuation.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
              <div className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
                <p>
                  Next-year ARR (at {parseFloat(growthRate) || 0}% growth): $
                  {result.arr.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
                <p>
                  Profit (at {parseFloat(margin) || 0}% margin): $
                  {result.profit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
                <p>Applied multiple: {result.multiple}x</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
