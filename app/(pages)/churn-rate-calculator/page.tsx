"use client";

import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChartPieIcon, CalculatorIcon } from "@heroicons/react/24/outline";

export default function ChurnRateCalculatorPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [startCustomers, setStartCustomers] = useState("");
  const [endCustomers, setEndCustomers] = useState("");
  const [newCustomers, setNewCustomers] = useState("");
  const [resultUnlocked, setResultUnlocked] = useState(false);

  const result = useMemo(() => {
    const start = parseFloat(startCustomers) || 0;
    const end = parseFloat(endCustomers) || 0;
    const newC = parseFloat(newCustomers) || 0;
    if (start <= 0) return null;
    const churned = start + newC - end;
    const churnRate = churned > 0 ? (churned / start) * 100 : 0;
    return {
      churned: Math.max(0, churned),
      churnRate,
      start,
      end,
      newCustomers: newC,
    };
  }, [startCustomers, endCustomers, newCustomers]);

  const handleCalculate = () => {
    if (status === "unauthenticated" || !session) {
      router.push(
        `/signup?callbackUrl=${encodeURIComponent(pathname || "/churn-rate-calculator")}`
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
          <div className="size-12 rounded-2xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600">
            <ChartPieIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Churn Rate Calculator
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Calculate customer churn rate from period start, end, and new customers.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="start">Customers at period start</Label>
              <Input
                id="start"
                type="number"
                min="0"
                step="1"
                placeholder="500"
                value={startCustomers}
                onChange={(e) => setStartCustomers(e.target.value)}
                className="rounded-xl h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end">Customers at period end</Label>
              <Input
                id="end"
                type="number"
                min="0"
                step="1"
                placeholder="520"
                value={endCustomers}
                onChange={(e) => setEndCustomers(e.target.value)}
                className="rounded-xl h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new">New customers in period</Label>
              <Input
                id="new"
                type="number"
                min="0"
                step="1"
                placeholder="80"
                value={newCustomers}
                onChange={(e) => setNewCustomers(e.target.value)}
                className="rounded-xl h-11"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              onClick={handleCalculate}
              disabled={!startCustomers || parseFloat(startCustomers) <= 0}
              className="gap-2"
            >
              <CalculatorIcon className="h-4 w-4" />
              Calculate
            </Button>
          </div>

          {result && resultUnlocked && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Churn (customers lost)
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {result.churned.toFixed(0)} customers
              </p>
              <p className="text-xl font-semibold text-slate-700 dark:text-slate-300">
                Churn rate: {result.churnRate.toFixed(2)}%
              </p>
              <div className="text-sm text-slate-600 dark:text-slate-300">
                <p>Start: {result.start} → End: {result.end} (New: +{result.newCustomers})</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
