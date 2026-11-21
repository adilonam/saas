"use client";

import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CurrencyDollarIcon, CalculatorIcon } from "@heroicons/react/24/outline";

export default function SaaSPricingSimulatorPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [mrr, setMrr] = useState("");
  const [customers, setCustomers] = useState("");
  const [churnPct, setChurnPct] = useState("");
  const [arpu, setArpu] = useState("");
  const [resultUnlocked, setResultUnlocked] = useState(false);

  const result = useMemo(() => {
    const m = parseFloat(mrr) || 0;
    const c = parseFloat(customers) || 0;
    const churn = parseFloat(churnPct) || 0;
    const a = parseFloat(arpu) || 0;
    const derivedArpu = c > 0 ? m / c : a;
    const monthlyChurned = c * (churn / 100);
    const netMrrChange = -monthlyChurned * derivedArpu;
    const annualMrr = m * 12;
    return {
      mrr: m,
      customers: c,
      arpu: c > 0 ? derivedArpu : a || 0,
      monthlyChurned,
      netMrrChange,
      annualMrr,
    };
  }, [mrr, customers, churnPct, arpu]);

  const handleCalculate = () => {
    if (status === "unauthenticated" || !session) {
      router.push(
        `/signup?callbackUrl=${encodeURIComponent(pathname || "/saas-pricing-simulator")}`
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
          <div className="size-12 rounded-2xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-sky-600">
            <CurrencyDollarIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              SaaS Pricing Simulator
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Simulate MRR, churn impact, and ARPU from your key metrics.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="mrr">Monthly recurring revenue ($)</Label>
              <Input
                id="mrr"
                type="number"
                min="0"
                step="100"
                placeholder="10000"
                value={mrr}
                onChange={(e) => setMrr(e.target.value)}
                className="rounded-xl h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customers">Number of customers</Label>
              <Input
                id="customers"
                type="number"
                min="0"
                step="1"
                placeholder="200"
                value={customers}
                onChange={(e) => setCustomers(e.target.value)}
                className="rounded-xl h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="churn">Monthly churn rate (%)</Label>
              <Input
                id="churn"
                type="number"
                min="0"
                max="100"
                step="0.1"
                placeholder="3"
                value={churnPct}
                onChange={(e) => setChurnPct(e.target.value)}
                className="rounded-xl h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="arpu">ARPU ($) — optional if MRR & customers set</Label>
              <Input
                id="arpu"
                type="number"
                min="0"
                step="1"
                placeholder="50"
                value={arpu}
                onChange={(e) => setArpu(e.target.value)}
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

          {resultUnlocked && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Simulated metrics
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl bg-slate-100 dark:bg-slate-800/50 p-4">
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    ARPU
                  </p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">
                    ${result.arpu.toFixed(2)}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-100 dark:bg-slate-800/50 p-4">
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Monthly churned (customers)
                  </p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">
                    {result.monthlyChurned.toFixed(1)}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-100 dark:bg-slate-800/50 p-4">
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Net MRR change from churn
                  </p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">
                    ${result.netMrrChange.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-100 dark:bg-slate-800/50 p-4">
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Annual run rate (MRR × 12)
                  </p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">
                    ${result.annualMrr.toLocaleString(undefined, { maximumFractionDigits: 0 })}
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
