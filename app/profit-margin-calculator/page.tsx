"use client";

import { useMemo, useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PresentationChartLineIcon, CalculatorIcon } from "@heroicons/react/24/outline";
import { useToolAccess } from "@/lib/use-tool-access";

export default function ProfitMarginCalculatorPage() {
  const { ensureAccess } = useToolAccess();
  const [cost, setCost] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  const parsed = useMemo(() => {
    const c = parseFloat(cost);
    const p = parseFloat(sellingPrice);
    if (!Number.isFinite(c) || c < 0 || !Number.isFinite(p) || p < 0) {
      return null;
    }
    if (p === 0 && c > 0) return null;
    const profit = p - c;
    const marginPercent = p > 0 ? (profit / p) * 100 : null;
    const markupPercent = c > 0 ? (profit / c) * 100 : null;
    return { c, p, profit, marginPercent, markupPercent };
  }, [cost, sellingPrice]);

  const handleCalculate = () => {
    if (!ensureAccess()) return;
    setUnlocked(true);
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600">
            <PresentationChartLineIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Profit Margin Calculator</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Profit, gross margin on revenue, and markup on cost
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="cost">Cost (COGS)</Label>
              <Input
                id="cost"
                type="number"
                min={0}
                step="0.01"
                inputMode="decimal"
                placeholder="e.g. 40"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className="rounded-xl h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Selling price (revenue)</Label>
              <Input
                id="price"
                type="number"
                min={0}
                step="0.01"
                inputMode="decimal"
                placeholder="e.g. 99"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                className="rounded-xl h-11"
              />
            </div>
          </div>

          <Button onClick={handleCalculate} disabled={!parsed} className="gap-2">
            <CalculatorIcon className="h-4 w-4" />
            Calculate
          </Button>

          {parsed && unlocked && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-4">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Gross profit</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {parsed.profit.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500 dark:text-slate-400">Margin (profit ÷ price)</p>
                  <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                    {parsed.marginPercent !== null
                      ? `${parsed.marginPercent.toFixed(2)}%`
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400">Markup (profit ÷ cost)</p>
                  <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                    {parsed.markupPercent !== null
                      ? `${parsed.markupPercent.toFixed(2)}%`
                      : parsed.c === 0
                        ? "N/A (zero cost)"
                        : "—"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-6">
          Margin % = (price − cost) ÷ price. Markup % = (price − cost) ÷ cost. Negative values mean a loss.
        </p>
      </div>
    </DashboardLayout>
  );
}
