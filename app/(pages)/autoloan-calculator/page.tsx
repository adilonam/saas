"use client";

import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { BanknotesIcon, CalculatorIcon } from "@heroicons/react/24/outline";

function monthlyPayment(principal: number, annualRatePercent: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0;
  const r = annualRatePercent / 100 / 12;
  if (r === 0) return principal / months;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

export default function AutoLoanCalculatorPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [loanAmount, setLoanAmount] = useState("");
  const [apr, setApr] = useState("");
  const [termYears, setTermYears] = useState("");
  const [resultUnlocked, setResultUnlocked] = useState(false);

  const handleCalculate = () => {
    if (status === "unauthenticated" || !session) {
      router.push(`/signup?callbackUrl=${encodeURIComponent(pathname || "/autoloan-calculator")}`);
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
    const P = parseFloat(loanAmount.replace(/,/g, "")) || 0;
    const rate = parseFloat(apr) || 0;
    const years = parseFloat(termYears) || 0;
    const months = Math.max(0, Math.round(years * 12));
    if (P <= 0 || months <= 0) return null;
    const payment = monthlyPayment(P, rate, months);
    const total = payment * months;
    const totalInterest = total - P;
    return {
      monthlyPayment: payment,
      totalPayment: total,
      totalInterest,
      months,
    };
  }, [loanAmount, apr, termYears]);

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-600">
            <BanknotesIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Auto Loan Calculator</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Monthly payment, total interest, and total cost
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="loan-amount">Loan amount</Label>
            <Input
              id="loan-amount"
              type="text"
              inputMode="decimal"
              placeholder="e.g. 25000"
              value={loanAmount}
              onChange={(e) => setLoanAmount(e.target.value.replace(/[^0-9.]/g, ""))}
              className="rounded-xl h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="apr">Annual interest rate (APR %)</Label>
            <Input
              id="apr"
              type="number"
              min="0"
              max="30"
              step="0.1"
              placeholder="e.g. 5.5"
              value={apr}
              onChange={(e) => setApr(e.target.value)}
              className="rounded-xl h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="term">Loan term (years)</Label>
            <Input
              id="term"
              type="number"
              min="1"
              max="10"
              step="0.5"
              placeholder="e.g. 5"
              value={termYears}
              onChange={(e) => setTermYears(e.target.value)}
              className="rounded-xl h-11"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button onClick={handleCalculate} disabled={!loanAmount || !apr || !termYears} className="gap-2">
              <CalculatorIcon className="h-4 w-4" />
              Calculate
            </Button>
          </div>

          {result && resultUnlocked && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-4">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Monthly payment</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  ${result.monthlyPayment.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Total interest</p>
                  <p className="text-lg font-semibold text-amber-600 dark:text-amber-400">
                    ${result.totalInterest.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Total amount paid</p>
                  <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">
                    ${result.totalPayment.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Over {result.months} months. This estimate does not include fees, taxes, or insurance.
              </p>
            </div>
          )}
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mt-6">
          Formula: M = P × [r(1+r)^n] / [(1+r)^n − 1], where P = principal, r = monthly rate, n = number of payments.
        </p>
      </div>
    </DashboardLayout>
  );
}
