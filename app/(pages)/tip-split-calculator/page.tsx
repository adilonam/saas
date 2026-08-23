"use client";

import { useMemo, useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ReceiptPercentIcon, CalculatorIcon } from "@heroicons/react/24/outline";
import { useToolAccess } from "@/lib/use-tool-access";

export default function TipSplitCalculatorPage() {
  const { ensureAccess } = useToolAccess();
  const [bill, setBill] = useState("");
  const [tipPercent, setTipPercent] = useState("18");
  const [people, setPeople] = useState("2");
  const [unlocked, setUnlocked] = useState(false);

  const result = useMemo(() => {
    const b = parseFloat(bill);
    const tip = parseFloat(tipPercent);
    const p = parseInt(people, 10);
    if (!Number.isFinite(b) || b < 0 || !Number.isFinite(tip) || tip < 0 || !Number.isFinite(p) || p < 1) {
      return null;
    }
    const tipAmount = (b * tip) / 100;
    const total = b + tipAmount;
    const perPerson = total / p;
    const tipPerPerson = tipAmount / p;
    return { tipAmount, total, perPerson, tipPerPerson, b, tip, p };
  }, [bill, tipPercent, people]);

  const handleCalculate = () => {
    if (!ensureAccess()) return;
    setUnlocked(true);
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
            <ReceiptPercentIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Tip Split Calculator</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Bill + tip, split evenly across your party
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="bill">Bill amount</Label>
            <Input
              id="bill"
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              placeholder="e.g. 86.50"
              value={bill}
              onChange={(e) => setBill(e.target.value)}
              className="rounded-xl h-11"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="tip">Tip (%)</Label>
              <Input
                id="tip"
                type="number"
                min={0}
                step="0.5"
                inputMode="decimal"
                value={tipPercent}
                onChange={(e) => setTipPercent(e.target.value)}
                className="rounded-xl h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="people">People</Label>
              <Input
                id="people"
                type="number"
                min={1}
                step={1}
                inputMode="numeric"
                value={people}
                onChange={(e) => setPeople(e.target.value)}
                className="rounded-xl h-11"
              />
            </div>
          </div>

          <Button onClick={handleCalculate} disabled={!result} className="gap-2">
            <CalculatorIcon className="h-4 w-4" />
            Calculate
          </Button>

          {result && unlocked && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <div className="flex justify-between">
                <span>Tip amount</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {result.tipAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total with tip</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {result.total.toFixed(2)}
                </span>
              </div>
              <div className="pt-3 border-t border-slate-200 dark:border-slate-600">
                <p className="text-xs text-slate-500 mb-1">Per person</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {result.perPerson.toFixed(2)}
                </p>
                <p className="text-xs mt-1">Includes {result.tipPerPerson.toFixed(2)} tip each</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
