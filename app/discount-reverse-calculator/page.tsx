"use client";

import { useMemo, useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowUturnLeftIcon, CalculatorIcon } from "@heroicons/react/24/outline";
import { useToolAccess } from "@/lib/use-tool-access";

export default function DiscountReverseCalculatorPage() {
  const { ensureAccess } = useToolAccess();
  const [salePrice, setSalePrice] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  const parsed = useMemo(() => {
    const sale = parseFloat(salePrice);
    const pct = parseFloat(discountPercent);
    if (
      !Number.isFinite(sale) ||
      sale < 0 ||
      !Number.isFinite(pct) ||
      pct <= 0 ||
      pct >= 100
    ) {
      return null;
    }
    const factor = 1 - pct / 100;
    const original = sale / factor;
    const savings = original - sale;
    return { sale, pct, original, savings };
  }, [salePrice, discountPercent]);

  const handleCalculate = () => {
    if (!ensureAccess()) return;
    setUnlocked(true);
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600">
            <ArrowUturnLeftIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Reverse Discount Calculator</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Original price from sale price and discount percentage off
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="sale">Sale price (after discount)</Label>
            <Input
              id="sale"
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              placeholder="e.g. 79.99"
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
              className="rounded-xl h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pct">Discount off list price (%)</Label>
            <Input
              id="pct"
              type="number"
              min={0}
              max={99.99}
              step="0.1"
              inputMode="decimal"
              placeholder="e.g. 20"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(e.target.value)}
              className="rounded-xl h-11"
            />
          </div>

          <Button onClick={handleCalculate} disabled={!parsed} className="gap-2">
            <CalculatorIcon className="h-4 w-4" />
            Calculate
          </Button>

          {parsed && unlocked && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-4">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Original (list) price</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {parsed.original.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                You save{" "}
                {parsed.savings.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                ({parsed.pct}% off {parsed.original.toFixed(2)})
              </p>
            </div>
          )}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-6">
          Formula: original = sale price ÷ (1 − discount%). Discount must be between 0% and 100%.
        </p>
      </div>
    </DashboardLayout>
  );
}
