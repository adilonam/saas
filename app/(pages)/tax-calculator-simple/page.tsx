"use client";

import { useMemo, useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ReceiptPercentIcon, CalculatorIcon } from "@heroicons/react/24/outline";
import { useToolAccess } from "@/lib/use-tool-access";

type Mode = "add" | "included";

export default function TaxCalculatorSimplePage() {
  const { ensureAccess } = useToolAccess();
  const [mode, setMode] = useState<Mode>("add");
  const [amount, setAmount] = useState("");
  const [taxRatePercent, setTaxRatePercent] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  const parsed = useMemo(() => {
    const base = parseFloat(amount);
    const rate = parseFloat(taxRatePercent);
    if (!Number.isFinite(base) || base < 0 || !Number.isFinite(rate) || rate < 0) {
      return null;
    }
    if (mode === "add") {
      const tax = (base * rate) / 100;
      const total = base + tax;
      return { mode, subtotal: base, rate, tax, total };
    }
    const divisor = 1 + rate / 100;
    if (divisor <= 0) return null;
    const subtotal = base / divisor;
    const tax = base - subtotal;
    return { mode, subtotal, rate, tax, total: base };
  }, [mode, amount, taxRatePercent]);

  const handleCalculate = () => {
    if (!ensureAccess()) return;
    setUnlocked(true);
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center text-sky-600">
            <ReceiptPercentIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Simple Tax Calculator</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Add tax to a subtotal, or extract tax from a total that already includes it
            </p>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => {
              setMode("add");
              setUnlocked(false);
            }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              mode === "add"
                ? "bg-sky-600 text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            Tax on top
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("included");
              setUnlocked(false);
            }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              mode === "included"
                ? "bg-sky-600 text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            Tax included
          </button>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="amt">
              {mode === "add" ? "Subtotal (before tax)" : "Total (including tax)"}
            </Label>
            <Input
              id="amt"
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              placeholder="e.g. 100"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="rounded-xl h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rate">Tax rate (%)</Label>
            <Input
              id="rate"
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              placeholder="e.g. 8.25"
              value={taxRatePercent}
              onChange={(e) => setTaxRatePercent(e.target.value)}
              className="rounded-xl h-11"
            />
          </div>

          <Button onClick={handleCalculate} disabled={!parsed} className="gap-2">
            <CalculatorIcon className="h-4 w-4" />
            Calculate
          </Button>

          {parsed && unlocked && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Subtotal</p>
                  <p className="text-xl font-semibold text-slate-900 dark:text-white">
                    {parsed.subtotal.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Tax amount</p>
                  <p className="text-xl font-semibold text-slate-900 dark:text-white">
                    {parsed.tax.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Total</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {parsed.total.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>
          )}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-6">
          For estimation only. Not legal or accounting advice. &quot;Tax included&quot; assumes tax is calculated on top of the net subtotal (standard VAT/sales-tax style).
        </p>
      </div>
    </DashboardLayout>
  );
}
