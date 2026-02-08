"use client";

import { useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import DepositDialog from "components/DepositDialog";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { CurrencyDollarIcon, CheckIcon } from "@heroicons/react/24/outline";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

export default function PricingPage() {
  const { update } = useSession();
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);

  const monthlyUrl = process.env.NEXT_PUBLIC_GUMROAD_SUBSCRIPTION_URL || "";
  const annualUrl = process.env.NEXT_PUBLIC_GUMROAD_ANNUAL_URL || "";

  const handleSubscribe = (url: string) => {
    if (url) {
      window.open(url, "_blank");
      update();
    }
  };

  return (
    <DashboardLayout>
      <DepositDialog
        open={depositDialogOpen}
        onOpenChange={setDepositDialogOpen}
        onSuccess={async () => await update()}
      />

      <div className="mb-12">
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
                Billed monthly via Gumroad
              </p>
            </div>
          </div>
          <div className="mb-6">
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              $10 <span className="text-base font-normal text-slate-500 dark:text-slate-400">USD / month</span>
            </p>
          </div>
          <ul className="space-y-3 mb-8">
            <li className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
              <CheckIcon className="size-5 text-green-600 dark:text-green-400 shrink-0" />
              <span>Full access to all PDF tools</span>
            </li>
            <li className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
              <CheckIcon className="size-5 text-green-600 dark:text-green-400 shrink-0" />
              <span>Cancel anytime</span>
            </li>
          </ul>
          <Button
            onClick={() => handleSubscribe(monthlyUrl)}
            disabled={!monthlyUrl}
            className="w-full rounded-xl bg-dashboard-primary hover:bg-dashboard-primary/90 text-white font-semibold py-3 gap-2"
          >
            Subscribe monthly
            <ArrowTopRightOnSquareIcon className="size-5" />
          </Button>
        </div>

        {/* Annual */}
        <div className="rounded-2xl border-2 border-dashboard-primary/30 dark:border-dashboard-primary/40 bg-white dark:bg-slate-900/50 p-8 shadow-xl relative">
          <div className="absolute top-4 right-4 text-xs font-bold bg-dashboard-primary/20 text-dashboard-primary dark:text-dashboard-primary px-2 py-1 rounded-lg">
            Save 33%
          </div>
          <div className="flex items-center gap-3 mb-6">
            <div className="size-12 rounded-xl bg-dashboard-primary/10 flex items-center justify-center text-dashboard-primary">
              <CurrencyDollarIcon className="size-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Annual
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Billed once per year via Gumroad
              </p>
            </div>
          </div>
          <div className="mb-6">
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              $80 <span className="text-base font-normal text-slate-500 dark:text-slate-400">USD / year</span>
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              ~$6.67/month
            </p>
          </div>
          <ul className="space-y-3 mb-8">
            <li className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
              <CheckIcon className="size-5 text-green-600 dark:text-green-400 shrink-0" />
              <span>Full access to all PDF tools</span>
            </li>
            <li className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
              <CheckIcon className="size-5 text-green-600 dark:text-green-400 shrink-0" />
              <span>12 months for the price of 8</span>
            </li>
          </ul>
          <Button
            onClick={() => handleSubscribe(annualUrl)}
            disabled={!annualUrl}
            className="w-full rounded-xl bg-dashboard-primary hover:bg-dashboard-primary/90 text-white font-semibold py-3 gap-2"
          >
            Subscribe annually
            <ArrowTopRightOnSquareIcon className="size-5" />
          </Button>
        </div>
      </div>

      <p className="text-sm text-slate-500 dark:text-slate-400 mt-6 text-center max-w-2xl mx-auto">
        Use the same email as your account so we can activate your subscription automatically. Cancel anytime from Gumroad.
      </p>
    </DashboardLayout>
  );
}
