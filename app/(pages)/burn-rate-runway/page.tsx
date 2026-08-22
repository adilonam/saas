"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PresentationChartLineIcon } from "@heroicons/react/24/outline";

export default function BurnRateRunwayPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [cash, setCash] = useState("");
  const [monthlyExpenses, setMonthlyExpenses] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  const gate = () => {
    if (status === "unauthenticated" || !session) {
      router.push(`/signup?callbackUrl=${encodeURIComponent(pathname || "/burn-rate-runway")}`);
      return false;
    }
    const hasActiveSubscription =
      session.user.subscriptionExpiresAt &&
      new Date(session.user.subscriptionExpiresAt) > new Date();
    if (!hasActiveSubscription) {
      router.push("/pricing");
      return false;
    }
    return true;
  };

  const result = useMemo(() => {
    const balance = parseFloat(cash) || 0;
    const exp = parseFloat(monthlyExpenses) || 0;
    const inc = parseFloat(monthlyIncome) || 0;
    const netBurn = exp - inc;
    if (balance < 0) return { kind: "invalid" as const };
    if (netBurn <= 0) {
      return {
        kind: "surplus" as const,
        netBurn,
        monthlyNet: inc - exp,
      };
    }
    const months = balance / netBurn;
    return { kind: "runway" as const, netBurn, months };
  }, [cash, monthlyExpenses, monthlyIncome]);

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600">
            <PresentationChartLineIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Burn rate runway</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Cash ÷ average monthly net burn (expenses minus income). Planning only.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="cash">Cash on hand</Label>
            <Input
              id="cash"
              type="number"
              min="0"
              step="100"
              placeholder="e.g. 24000"
              value={cash}
              onChange={(e) => setCash(e.target.value)}
              className="rounded-xl h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="exp">Average monthly expenses</Label>
            <Input
              id="exp"
              type="number"
              min="0"
              step="100"
              placeholder="e.g. 6500"
              value={monthlyExpenses}
              onChange={(e) => setMonthlyExpenses(e.target.value)}
              className="rounded-xl h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="inc">Average monthly income (optional)</Label>
            <Input
              id="inc"
              type="number"
              min="0"
              step="100"
              placeholder="e.g. 4000 — leave 0 if none"
              value={monthlyIncome}
              onChange={(e) => setMonthlyIncome(e.target.value)}
              className="rounded-xl h-11"
            />
          </div>

          <Button
            onClick={() => {
              if (!gate()) return;
              setUnlocked(true);
            }}
            className="gap-2"
          >
            <PresentationChartLineIcon className="h-4 w-4" />
            Calculate runway
          </Button>

          {unlocked && result?.kind === "invalid" && (
            <p className="text-sm text-amber-600 dark:text-amber-400">Use a non-negative cash balance.</p>
          )}

          {unlocked && result?.kind === "surplus" && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
              <p className="text-emerald-600 dark:text-emerald-400 font-semibold">Net cash-flow positive</p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                Monthly surplus about{" "}
                {new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(
                  result.monthlyNet,
                )}
                . Runway is not shrinking from this snapshot; adjust if income is irregular.
              </p>
            </div>
          )}

          {unlocked && result?.kind === "runway" && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-2">
              <p className="text-sm text-slate-500 dark:text-slate-400">Net monthly burn</p>
              <p className="text-xl font-semibold text-slate-900 dark:text-white">
                {new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(result.netBurn)}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">Approx. runway</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {result.months.toFixed(1)} months
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                (~{Math.round(result.months * 4.33)} weeks at 4.33 weeks per month)
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
