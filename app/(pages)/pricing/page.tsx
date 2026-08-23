"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { CurrencyDollarIcon, CheckIcon } from "@heroicons/react/24/outline";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

type PricingPayload = {
  monthlyUsd: number;
  annualUsd: number;
  currency: "USD";
};

export default function PricingPage() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState<"monthly" | "annual" | null>(null);
  const [prices, setPrices] = useState<PricingPayload | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/pricing");
        if (!res.ok) return;
        const data = (await res.json()) as PricingPayload;
        if (!cancelled && typeof data.monthlyUsd === "number" && typeof data.annualUsd === "number") {
          setPrices(data);
        }
      } catch {
        /* keep null; UI falls back */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const monthlyUsd = prices?.monthlyUsd ?? 10;
  const annualUsd = prices?.annualUsd ?? 80;
  const yearlyIfMonthly = monthlyUsd * 12;
  const savePercent =
    yearlyIfMonthly > annualUsd
      ? Math.round((1 - annualUsd / yearlyIfMonthly) * 100)
      : 0;
  const annualPerMonth = annualUsd / 12;
  const annualVsMonthlyMonths =
    monthlyUsd > 0 ? annualUsd / monthlyUsd : null;

  const handleSubscribe = async (plan: "monthly" | "annual") => {
    if (!session?.user) {
      router.push("/signup");
      return;
    }
    setLoading(plan);
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      throw new Error(data.error || "Failed to start checkout");
    } catch (e) {
      console.error(e);
      setLoading(null);
    } finally {
      update();
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Pricing
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
          Simple, transparent pricing. Subscribe monthly or annually.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 max-w-4xl">
        {/* Monthly */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="size-12 rounded-xl bg-dashboard-primary/10 flex items-center justify-center text-dashboard-primary">
              <CurrencyDollarIcon className="size-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Monthly
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Billed monthly via Stripe
              </p>
            </div>
          </div>
          <div className="mb-6">
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              ${monthlyUsd}{" "}
              <span className="text-base font-normal text-slate-500 dark:text-slate-400">
                USD / month
              </span>
            </p>
          </div>
          <ul className="space-y-3 mb-8">
            <li className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
              <CheckIcon className="size-5 text-green-600 dark:text-green-400 shrink-0" />
              <span>Full access to all productivity tools</span>
            </li>
            <li className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
              <CheckIcon className="size-5 text-green-600 dark:text-green-400 shrink-0" />
              <span>Cancel anytime</span>
            </li>
          </ul>
          <Button
            onClick={() => handleSubscribe("monthly")}
            disabled={loading !== null}
            className="w-full rounded-xl bg-dashboard-primary hover:bg-dashboard-primary/90 text-white font-semibold py-3 gap-2"
          >
            {loading === "monthly" ? "Redirecting…" : "Subscribe monthly"}
            <ArrowTopRightOnSquareIcon className="size-5" />
          </Button>
        </div>

        {/* Annual */}
        <div className="rounded-2xl border-2 border-dashboard-primary/30 dark:border-dashboard-primary/40 bg-white dark:bg-slate-900/50 p-8 shadow-xl relative">
          {savePercent > 0 && (
            <div className="absolute top-4 right-4 text-xs font-bold bg-dashboard-primary/20 text-dashboard-primary dark:text-dashboard-primary px-2 py-1 rounded-lg">
              Save {savePercent}%
            </div>
          )}
          <div className="flex items-center gap-3 mb-6">
            <div className="size-12 rounded-xl bg-dashboard-primary/10 flex items-center justify-center text-dashboard-primary">
              <CurrencyDollarIcon className="size-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Annual
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Billed once per year via Stripe
              </p>
            </div>
          </div>
          <div className="mb-6">
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              ${annualUsd}{" "}
              <span className="text-base font-normal text-slate-500 dark:text-slate-400">
                USD / year
              </span>
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              ~$
              {annualPerMonth % 1 === 0
                ? annualPerMonth.toFixed(0)
                : annualPerMonth.toFixed(2)}
              /month
            </p>
          </div>
          <ul className="space-y-3 mb-8">
            <li className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
              <CheckIcon className="size-5 text-green-600 dark:text-green-400 shrink-0" />
              <span>Full access to all productivity tools</span>
            </li>
            <li className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
              <CheckIcon className="size-5 text-green-600 dark:text-green-400 shrink-0" />
              <span>
                {annualVsMonthlyMonths != null && annualVsMonthlyMonths > 0
                  ? `12 months for the price of ~${Number.isInteger(annualVsMonthlyMonths) ? annualVsMonthlyMonths : annualVsMonthlyMonths.toFixed(1)} monthly payments`
                  : "Best value vs paying monthly for a year"}
              </span>
            </li>
          </ul>
          <Button
            onClick={() => handleSubscribe("annual")}
            disabled={loading !== null}
            className="w-full rounded-xl bg-dashboard-primary hover:bg-dashboard-primary/90 text-white font-semibold py-3 gap-2"
          >
            {loading === "annual" ? "Redirecting…" : "Subscribe annually"}
            <ArrowTopRightOnSquareIcon className="size-5" />
          </Button>
        </div>
      </div>

      <p className="text-sm text-slate-500 dark:text-slate-400 mt-6 text-center max-w-2xl mx-auto">
        Use the same email as your account so we can activate your subscription automatically. Cancel anytime from your Stripe customer portal.
      </p>
    </DashboardLayout>
  );
}
