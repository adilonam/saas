"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChartPieIcon } from "@heroicons/react/24/outline";

export default function UtilizationCalculatorPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [billable, setBillable] = useState("");
  const [available, setAvailable] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  const gate = () => {
    if (status === "unauthenticated" || !session) {
      router.push(
        `/signup?callbackUrl=${encodeURIComponent(pathname || "/utilization-calculator")}`,
      );
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
    const b = parseFloat(billable) || 0;
    const a = parseFloat(available) || 0;
    if (a <= 0 || b < 0) return null;
    const pct = (b / a) * 100;
    return { pct, nonBillable: Math.max(a - b, 0) };
  }, [billable, available]);

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-600">
            <ChartPieIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Utilization calculator</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Billable hours ÷ available hours (same period).
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="billable">Billable hours</Label>
            <Input
              id="billable"
              type="number"
              min="0"
              step="0.25"
              placeholder="e.g. 112"
              value={billable}
              onChange={(e) => setBillable(e.target.value)}
              className="rounded-xl h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="available">Available / capacity hours</Label>
            <Input
              id="available"
              type="number"
              min="0"
              step="0.25"
              placeholder="e.g. 160"
              value={available}
              onChange={(e) => setAvailable(e.target.value)}
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
            <ChartPieIcon className="h-4 w-4" />
            Calculate
          </Button>

          {unlocked && result && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Utilization</p>
              <p className="text-4xl font-bold text-slate-900 dark:text-white">
                {result.pct.toFixed(1)}%
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
                Non-billable hours in period:{" "}
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {result.nonBillable.toFixed(2)}
                </span>
              </p>
            </div>
          )}

          {unlocked && !result && (
            <p className="text-sm text-amber-600 dark:text-amber-400">
              Enter billable hours and a positive capacity.
            </p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
