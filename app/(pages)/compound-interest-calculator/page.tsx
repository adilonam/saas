"use client";

import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { BanknotesIcon, CalculatorIcon } from "@heroicons/react/24/outline";

function compoundAmount(
  principal: number,
  annualRatePercent: number,
  years: number,
  compoundingsPerYear: number,
): { amount: number; interest: number } {
  if (principal <= 0 || years < 0) return { amount: principal, interest: 0 };
  const r = annualRatePercent / 100 / compoundingsPerYear;
  const n = compoundingsPerYear * years;
  const amount = principal * Math.pow(1 + r, n);
  return { amount, interest: amount - principal };
}

export default function CompoundInterestCalculatorPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [principal, setPrincipal] = useState("");
  const [annualRate, setAnnualRate] = useState("");
  const [years, setYears] = useState("");
  const [compoundingsPerYear, setCompoundingsPerYear] = useState("12");
  const [resultUnlocked, setResultUnlocked] = useState(false);

  const handleCalculate = () => {
    if (status === "unauthenticated" || !session) {
      router.push(
        `/signup?callbackUrl=${encodeURIComponent(pathname || "/compound-interest-calculator")}`,
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
    const P = parseFloat(principal.replace(/,/g, "")) || 0;
    const r = parseFloat(annualRate) || 0;
    const t = parseFloat(years) || 0;
    const n = Math.max(1, Math.round(parseFloat(compoundingsPerYear) || 12));
    if (P <= 0 || t < 0) return null;
    return compoundAmount(P, r, t, n);
  }, [principal, annualRate, years, compoundingsPerYear]);

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
            <BanknotesIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Compound Interest Calculator</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Future value and interest with compound frequency
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="principal">Principal amount</Label>
            <Input
              id="principal"
              type="text"
              inputMode="decimal"
              placeholder="e.g. 10000"
              value={principal}
              onChange={(e) => setPrincipal(e.target.value.replace(/[^0-9.]/g, ""))}
              className="rounded-xl h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="annual-rate">Annual interest rate (%)</Label>
            <Input
              id="annual-rate"
              type="number"
              min="0"
              max="100"
              step="0.1"
              placeholder="e.g. 5"
              value={annualRate}
              onChange={(e) => setAnnualRate(e.target.value)}
              className="rounded-xl h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="years">Time (years)</Label>
            <Input
              id="years"
              type="number"
              min="0"
              step="0.5"
              placeholder="e.g. 10"
              value={years}
              onChange={(e) => setYears(e.target.value)}
              className="rounded-xl h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="compoundings">Compoundings per year</Label>
            <Input
              id="compoundings"
              type="number"
              min="1"
              max="365"
              placeholder="e.g. 12 (monthly)"
              value={compoundingsPerYear}
              onChange={(e) => setCompoundingsPerYear(e.target.value)}
              className="rounded-xl h-11"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              12 = monthly, 4 = quarterly, 1 = annually
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              onClick={handleCalculate}
              disabled={!principal || !annualRate || years === ""}
              className="gap-2"
            >
              <CalculatorIcon className="h-4 w-4" />
              Calculate
            </Button>
          </div>

          {result && resultUnlocked && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-4">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Future value</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  ${result.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Total interest</p>
                <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                  ${result.interest.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          )}
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mt-6">
          Formula: A = P(1 + r/n)^(nt), where P = principal, r = annual rate, n = compoundings per
          year, t = years.
        </p>
      </div>
    </DashboardLayout>
  );
}
