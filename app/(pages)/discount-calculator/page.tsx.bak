"use client";

import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CalculatorIcon } from "@heroicons/react/24/outline";

export default function DiscountCalculatorPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [mode, setMode] = useState<"discount" | "sale">("discount");
  const [originalPrice, setOriginalPrice] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [resultUnlocked, setResultUnlocked] = useState(false);

  const handleCalculate = () => {
    if (status === "unauthenticated" || !session) {
      router.push(`/signup?callbackUrl=${encodeURIComponent(pathname || "/discount-calculator")}`);
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
    const original = parseFloat(originalPrice);
    if (Number.isNaN(original) || original < 0) return null;
    if (mode === "discount") {
      const pct = parseFloat(discountPercent);
      if (Number.isNaN(pct) || pct < 0 || pct > 100) return null;
      const discountAmount = (original * pct) / 100;
      const finalPrice = original - discountAmount;
      return { finalPrice, discountAmount, discountPercent: pct };
    }
    const sale = parseFloat(salePrice);
    if (Number.isNaN(sale) || sale < 0 || sale > original) return null;
    const discountAmount = original - sale;
    const discountPercentCalc = original > 0 ? (discountAmount / original) * 100 : 0;
    return { finalPrice: sale, discountAmount, discountPercent: discountPercentCalc };
  }, [mode, originalPrice, discountPercent, salePrice]);

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
            <CalculatorIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Discount & Sale Price Calculator</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Find sale price from discount %, or discount % from original and sale price
            </p>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => setMode("discount")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              mode === "discount"
                ? "bg-emerald-600 text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            From discount %
          </button>
          <button
            type="button"
            onClick={() => setMode("sale")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              mode === "sale"
                ? "bg-emerald-600 text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            From sale price
          </button>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="original">Original price ($)</Label>
            <Input
              id="original"
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 99.99"
              value={originalPrice}
              onChange={(e) => setOriginalPrice(e.target.value)}
              className="rounded-xl h-11"
            />
          </div>
          {mode === "discount" && (
            <div className="space-y-2">
              <Label htmlFor="discount-pct">Discount (%)</Label>
              <Input
                id="discount-pct"
                type="number"
                min="0"
                max="100"
                step="0.1"
                placeholder="e.g. 20"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
                className="rounded-xl h-11"
              />
            </div>
          )}
          {mode === "sale" && (
            <div className="space-y-2">
              <Label htmlFor="sale-price">Sale price ($)</Label>
              <Input
                id="sale-price"
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 79.99"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                className="rounded-xl h-11"
              />
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <Button onClick={handleCalculate} className="gap-2">
              <CalculatorIcon className="h-4 w-4" />
              Calculate
            </Button>
          </div>

          {result != null && resultUnlocked && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-2">
              <p className="text-sm text-slate-500 dark:text-slate-400">You save</p>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                ${result.discountAmount.toFixed(2)} ({result.discountPercent.toFixed(1)}%)
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Final price</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                ${result.finalPrice.toFixed(2)}
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
