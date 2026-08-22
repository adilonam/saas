"use client";

import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ScaleIcon, CalculatorIcon } from "@heroicons/react/24/outline";

export default function LeverageMarginCalculatorPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [notionalValue, setNotionalValue] = useState("");
  const [leverage, setLeverage] = useState("");
  const [resultUnlocked, setResultUnlocked] = useState(false);

  const handleCalculate = () => {
    if (status === "unauthenticated" || !session) {
      router.push(
        `/signup?callbackUrl=${encodeURIComponent(pathname || "/leverage-margin-calculator")}`,
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
    const notional = parseFloat(notionalValue.replace(/,/g, "")) || 0;
    const lev = parseFloat(leverage) || 0;
    if (notional <= 0 || lev <= 0) return null;
    const marginRequired = notional / lev;
    const marginPercent = 100 / lev;
    return {
      marginRequired,
      marginPercent,
      notional,
      leverage: lev,
    };
  }, [notionalValue, leverage]);

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600">
            <ScaleIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Leverage & Margin Calculator</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Required margin from position size and leverage ratio
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="notional">Position size / Notional value</Label>
            <Input
              id="notional"
              type="text"
              inputMode="decimal"
              placeholder="e.g. 100000"
              value={notionalValue}
              onChange={(e) => setNotionalValue(e.target.value.replace(/[^0-9.]/g, ""))}
              className="rounded-xl h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="leverage">Leverage (e.g. 10 for 10:1)</Label>
            <Input
              id="leverage"
              type="number"
              min="1"
              max="1000"
              step="1"
              placeholder="e.g. 10"
              value={leverage}
              onChange={(e) => setLeverage(e.target.value)}
              className="rounded-xl h-11"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              10 = 10:1, margin = 10%; 20 = 20:1, margin = 5%
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              onClick={handleCalculate}
              disabled={!notionalValue || !leverage || parseFloat(notionalValue) <= 0 || parseFloat(leverage) <= 0}
              className="gap-2"
            >
              <CalculatorIcon className="h-4 w-4" />
              Calculate
            </Button>
          </div>

          {result && resultUnlocked && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-4">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                  Margin required
                </p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  ${result.marginRequired.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Margin %</p>
                <p className="text-lg font-semibold text-violet-600 dark:text-violet-400">
                  {result.marginPercent.toFixed(2)}%
                </p>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {result.leverage}:1 leverage on ${result.notional.toLocaleString("en-US")} notional.
              </p>
            </div>
          )}
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mt-6">
          Margin required = Notional value ÷ Leverage. Margin % = 100 ÷ Leverage. Trading on leverage involves significant risk.
        </p>
      </div>
    </DashboardLayout>
  );
}
