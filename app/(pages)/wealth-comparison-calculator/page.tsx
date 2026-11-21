"use client";

import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { BanknotesIcon, CalculatorIcon } from "@heroicons/react/24/outline";

// Simplified global net worth percentiles (USD, approximate 2020s data)
const PERCENTILES = [
  { p: 10, label: "Bottom 10%", max: 0 },
  { p: 25, label: "25th percentile", max: 5000 },
  { p: 50, label: "Median (50%)", max: 120000 },
  { p: 75, label: "75th percentile", max: 500000 },
  { p: 90, label: "90th percentile", max: 1900000 },
  { p: 95, label: "95th percentile", max: 3500000 },
  { p: 99, label: "Top 1%", max: 11000000 },
];

function getPercentile(netWorth: number): { label: string; p: number } {
  for (let i = PERCENTILES.length - 1; i >= 0; i--) {
    if (netWorth >= PERCENTILES[i].max) {
      return { label: PERCENTILES[i].label, p: PERCENTILES[i].p };
    }
  }
  return { label: "Bottom 10%", p: 10 };
}

export default function WealthComparisonCalculatorPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [netWorth, setNetWorth] = useState("");
  const [resultUnlocked, setResultUnlocked] = useState(false);

  const handleCalculate = () => {
    if (status === "unauthenticated" || !session) {
      router.push(
        `/signup?callbackUrl=${encodeURIComponent(pathname || "/wealth-comparison-calculator")}`,
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
    const n = parseFloat(netWorth.replace(/[^0-9.-]/g, "")) || 0;
    if (n < 0) return null;
    return getPercentile(n);
  }, [netWorth]);

  const numNetWorth = parseFloat(netWorth.replace(/[^0-9.-]/g, "")) || 0;
  const hasValidInput = numNetWorth >= 0 && netWorth.trim() !== "";

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
            <BanknotesIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Wealth Comparison Calculator</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              See how your net worth compares to global percentiles (USD)
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="net-worth">Net worth (USD)</Label>
            <Input
              id="net-worth"
              type="text"
              inputMode="decimal"
              placeholder="e.g. 250000"
              value={netWorth}
              onChange={(e) => setNetWorth(e.target.value)}
              className="rounded-xl h-11"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button onClick={handleCalculate} disabled={!hasValidInput} className="gap-2">
              <CalculatorIcon className="h-4 w-4" />
              Compare
            </Button>
          </div>

          {result != null && hasValidInput && resultUnlocked && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-3">
              <p className="text-sm text-slate-500 dark:text-slate-400">Your position</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {result.label}
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                With a net worth of{" "}
                <span className="font-semibold">
                  ${numNetWorth.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
                , you have more wealth than roughly {result.p}% of adults globally (approximate).
              </p>
            </div>
          )}
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mt-6">
          Percentiles are approximate and based on global adult net worth estimates. Convert other currencies to USD for comparison.
        </p>
      </div>
    </DashboardLayout>
  );
}
