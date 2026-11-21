"use client";

import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CalculatorIcon } from "@heroicons/react/24/outline";

export default function BreakevenCalculatorPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [fixedCosts, setFixedCosts] = useState("");
  const [variableCostPerUnit, setVariableCostPerUnit] = useState("");
  const [pricePerUnit, setPricePerUnit] = useState("");
  const [resultUnlocked, setResultUnlocked] = useState(false);

  const handleCalculate = () => {
    if (status === "unauthenticated" || !session) {
      router.push(`/signup?callbackUrl=${encodeURIComponent(pathname || "/breakeven-calculator")}`);
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
    const fixed = parseFloat(fixedCosts) || 0;
    const variable = parseFloat(variableCostPerUnit) || 0;
    const price = parseFloat(pricePerUnit) || 0;
    if (fixed <= 0 || price <= variable) return null;
    const contributionMargin = price - variable;
    const breakevenUnits = Math.ceil(fixed / contributionMargin);
    const breakevenRevenue = breakevenUnits * price;
    return { breakevenUnits, breakevenRevenue, contributionMargin };
  }, [fixedCosts, variableCostPerUnit, pricePerUnit]);

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-600">
            <CalculatorIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Break-even Calculator</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Find how many units you need to sell to cover costs
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="fixed-costs">Fixed costs ($)</Label>
            <Input
              id="fixed-costs"
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 10000"
              value={fixedCosts}
              onChange={(e) => setFixedCosts(e.target.value)}
              className="rounded-xl h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="variable-cost">Variable cost per unit ($)</Label>
            <Input
              id="variable-cost"
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 5"
              value={variableCostPerUnit}
              onChange={(e) => setVariableCostPerUnit(e.target.value)}
              className="rounded-xl h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Selling price per unit ($)</Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 15"
              value={pricePerUnit}
              onChange={(e) => setPricePerUnit(e.target.value)}
              className="rounded-xl h-11"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button onClick={handleCalculate} className="gap-2">
              <CalculatorIcon className="h-4 w-4" />
              Calculate
            </Button>
          </div>

          {result != null && resultUnlocked && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-3">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Break-even point</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {result.breakevenUnits.toLocaleString()} units
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                Revenue at break-even: <span className="font-semibold">${result.breakevenRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Contribution margin per unit: ${result.contributionMargin.toFixed(2)}
              </p>
            </div>
          )}
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mt-6">
          Break-even units = Fixed costs ÷ (Price per unit − Variable cost per unit). Assumes linear costs.
        </p>
      </div>
    </DashboardLayout>
  );
}
