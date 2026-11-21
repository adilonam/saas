"use client";

import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { UserGroupIcon, CalculatorIcon } from "@heroicons/react/24/outline";

export default function CLVCalculatorPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [arpu, setArpu] = useState("");
  const [churnPct, setChurnPct] = useState("");
  const [resultUnlocked, setResultUnlocked] = useState(false);

  const result = useMemo(() => {
    const a = parseFloat(arpu) || 0;
    const churn = parseFloat(churnPct) || 0;
    if (a <= 0) return null;
    if (churn <= 0 || churn >= 100) return { clv: a * 12, avgLifetimeMonths: 12 };
    const avgLifetimeMonths = 100 / churn;
    const clv = a * avgLifetimeMonths;
    return { clv, avgLifetimeMonths };
  }, [arpu, churnPct]);

  const handleCalculate = () => {
    if (status === "unauthenticated" || !session) {
      router.push(
        `/signup?callbackUrl=${encodeURIComponent(pathname || "/clv-calculator")}`
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
          <div className="size-12 rounded-2xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600">
            <UserGroupIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Customer Lifetime Value Calculator
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Estimate CLV from average revenue per user and monthly churn rate.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="arpu">Average revenue per user per month ($)</Label>
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
            <div className="space-y-2">
              <Label htmlFor="churn">Monthly churn rate (%)</Label>
              <Input
                id="churn"
                type="number"
                min="0"
                max="100"
                step="0.1"
                placeholder="5"
                value={churnPct}
                onChange={(e) => setChurnPct(e.target.value)}
                className="rounded-xl h-11"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              onClick={handleCalculate}
              disabled={!arpu || parseFloat(arpu) <= 0}
              className="gap-2"
            >
              <CalculatorIcon className="h-4 w-4" />
              Calculate
            </Button>
          </div>

          {result && resultUnlocked && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Customer lifetime value
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                ${result.clv.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
              <div className="text-sm text-slate-600 dark:text-slate-300">
                <p>
                  Average customer lifetime: {result.avgLifetimeMonths.toFixed(1)} months
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
