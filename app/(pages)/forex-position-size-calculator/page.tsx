"use client";

import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChartBarIcon, CalculatorIcon } from "@heroicons/react/24/outline";

function positionSizeLots(
  accountBalance: number,
  riskPercent: number,
  stopLossPips: number,
  pipValuePerLot: number,
): number {
  if (accountBalance <= 0 || riskPercent <= 0 || stopLossPips <= 0 || pipValuePerLot <= 0)
    return 0;
  const riskAmount = (accountBalance * riskPercent) / 100;
  return riskAmount / (stopLossPips * pipValuePerLot);
}

export default function ForexPositionSizeCalculatorPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [accountBalance, setAccountBalance] = useState("");
  const [riskPercent, setRiskPercent] = useState("");
  const [stopLossPips, setStopLossPips] = useState("");
  const [pipValuePerLot, setPipValuePerLot] = useState("10");
  const [resultUnlocked, setResultUnlocked] = useState(false);

  const handleCalculate = () => {
    if (status === "unauthenticated" || !session) {
      router.push(
        `/signup?callbackUrl=${encodeURIComponent(pathname || "/forex-position-size-calculator")}`,
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
    const balance = parseFloat(accountBalance.replace(/,/g, "")) || 0;
    const risk = parseFloat(riskPercent) || 0;
    const sl = parseFloat(stopLossPips) || 0;
    const pipVal = parseFloat(pipValuePerLot) || 10;
    if (balance <= 0 || risk <= 0 || sl <= 0 || pipVal <= 0) return null;
    const lots = positionSizeLots(balance, risk, sl, pipVal);
    const riskAmount = (balance * risk) / 100;
    return { lots, riskAmount, riskPercent: risk };
  }, [accountBalance, riskPercent, stopLossPips, pipValuePerLot]);

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600">
            <ChartBarIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Forex Position Size Calculator</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Lot size from account balance, risk %, and stop loss in pips
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="balance">Account balance</Label>
            <Input
              id="balance"
              type="text"
              inputMode="decimal"
              placeholder="e.g. 10000"
              value={accountBalance}
              onChange={(e) => setAccountBalance(e.target.value.replace(/[^0-9.]/g, ""))}
              className="rounded-xl h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="risk">Risk per trade (%)</Label>
            <Input
              id="risk"
              type="number"
              min="0.1"
              max="100"
              step="0.1"
              placeholder="e.g. 1"
              value={riskPercent}
              onChange={(e) => setRiskPercent(e.target.value)}
              className="rounded-xl h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sl-pips">Stop loss (pips)</Label>
            <Input
              id="sl-pips"
              type="number"
              min="1"
              step="1"
              placeholder="e.g. 20"
              value={stopLossPips}
              onChange={(e) => setStopLossPips(e.target.value)}
              className="rounded-xl h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pip-value">Pip value per standard lot (account currency)</Label>
            <Input
              id="pip-value"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="e.g. 10 (EUR/USD), 1000 (USD/JPY)"
              value={pipValuePerLot}
              onChange={(e) => setPipValuePerLot(e.target.value)}
              className="rounded-xl h-11"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Standard lot = 100,000 units. Typical: 10 for EUR/USD, 1000 for USD/JPY (JPY pairs).
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              onClick={handleCalculate}
              disabled={
                !accountBalance ||
                !riskPercent ||
                !stopLossPips ||
                !pipValuePerLot ||
                parseFloat(accountBalance) <= 0 ||
                parseFloat(riskPercent) <= 0 ||
                parseFloat(stopLossPips) <= 0 ||
                parseFloat(pipValuePerLot) <= 0
              }
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
                  Position size (lots)
                </p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {result.lots.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                  Risk amount ({result.riskPercent}%)
                </p>
                <p className="text-lg font-semibold text-amber-600 dark:text-amber-400">
                  ${result.riskAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Micro lots: {(result.lots * 10).toFixed(1)}. Adjust pip value for your pair and account currency.
              </p>
            </div>
          )}
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mt-6">
          Position size (lots) = (Account × Risk%) / (Stop loss pips × Pip value per lot). Use at your own risk.
        </p>
      </div>
    </DashboardLayout>
  );
}
