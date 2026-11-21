"use client";

import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { BanknotesIcon, CalculatorIcon } from "@heroicons/react/24/outline";

type Period = "yearly" | "monthly";

export default function SalaryAfterTaxCalculatorPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [grossInput, setGrossInput] = useState("");
  const [period, setPeriod] = useState<Period>("yearly");
  const [taxRatePct, setTaxRatePct] = useState("");
  const [resultUnlocked, setResultUnlocked] = useState(false);

  const handleCalculate = () => {
    if (status === "unauthenticated" || !session) {
      router.push(
        `/signup?callbackUrl=${encodeURIComponent(pathname || "/salary-after-tax-calculator")}`,
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
    const gross = parseFloat(grossInput) || 0;
    const pct = Math.min(100, Math.max(0, parseFloat(taxRatePct) || 0));
    if (gross < 0) return null;
    const taxDecimal = pct / 100;
    const taxAmount = gross * taxDecimal;
    const net = gross - taxAmount;
    const grossYearly = period === "yearly" ? gross : gross * 12;
    const taxYearly = period === "yearly" ? taxAmount : taxAmount * 12;
    const netYearly = period === "yearly" ? net : net * 12;
    const grossMonthly = grossYearly / 12;
    const netMonthly = netYearly / 12;
    return {
      gross,
      taxAmount,
      net,
      pct,
      grossYearly,
      taxYearly,
      netYearly,
      grossMonthly,
      netMonthly,
    };
  }, [grossInput, taxRatePct, period]);

  const hasValidInput = (parseFloat(grossInput) || 0) >= 0;

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
            <BanknotesIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Salary After Tax Calculator</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Estimate take-home pay from gross salary and tax rate
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <Label>Salary period</Label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPeriod("yearly")}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  period === "yearly"
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                Yearly
              </button>
              <button
                type="button"
                onClick={() => setPeriod("monthly")}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  period === "monthly"
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                Monthly
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="gross">Gross salary ({period === "yearly" ? "per year" : "per month"})</Label>
            <Input
              id="gross"
              type="number"
              min="0"
              step="0.01"
              placeholder={period === "yearly" ? "e.g. 60000" : "e.g. 5000"}
              value={grossInput}
              onChange={(e) => setGrossInput(e.target.value)}
              className="rounded-xl h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tax-rate">Effective tax rate (%)</Label>
            <Input
              id="tax-rate"
              type="number"
              min="0"
              max="100"
              step="0.1"
              placeholder="e.g. 25"
              value={taxRatePct}
              onChange={(e) => setTaxRatePct(e.target.value)}
              className="rounded-xl h-11"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Combined income tax (federal + state/local if applicable). Use an effective rate, not the top bracket.
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <Button onClick={handleCalculate} disabled={!hasValidInput} className="gap-2">
              <CalculatorIcon className="h-4 w-4" />
              Calculate
            </Button>
          </div>

          {result != null && hasValidInput && resultUnlocked && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">Take-home (approx.)</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Per year</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    ${result.netYearly.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Tax: ${result.taxYearly.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Per month</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    ${result.netMonthly.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Tax: ${(result.taxYearly / 12).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Based on {result.pct}% effective tax rate. This does not include deductions, credits, or other withholdings.
              </p>
            </div>
          )}
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mt-6">
          Enter your gross salary and an effective tax rate to estimate net pay. Actual take-home depends on your jurisdiction and situation.
        </p>
      </div>
    </DashboardLayout>
  );
}
