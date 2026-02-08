"use client";

import { useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import DepositDialog from "components/DepositDialog";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { CurrencyDollarIcon, CheckIcon } from "@heroicons/react/24/outline";

export default function PricingPage() {
  const { update } = useSession();
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);

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
          Simple, transparent pricing. Subscribe monthly to use our PDF tools.
        </p>
      </div>

      <div className="max-w-md">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="size-12 rounded-xl bg-dashboard-primary/10 flex items-center justify-center text-dashboard-primary">
              <CurrencyDollarIcon className="size-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Monthly subscription
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Billed monthly via Gumroad
              </p>
            </div>
          </div>
          <div className="mb-6">
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              Monthly <span className="text-base font-normal text-slate-500 dark:text-slate-400">— see Gumroad</span>
            </p>
          </div>
          <ul className="space-y-3 mb-8">
            <li className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
              <CheckIcon className="size-5 text-green-600 dark:text-green-400 shrink-0" />
              <span>Full access to all PDF tools</span>
            </li>
            <li className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
              <CheckIcon className="size-5 text-green-600 dark:text-green-400 shrink-0" />
              <span>Sign, merge, convert, summarize — unlimited use</span>
            </li>
            <li className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
              <CheckIcon className="size-5 text-green-600 dark:text-green-400 shrink-0" />
              <span>Subscribe with Gumroad; use the same email as your account</span>
            </li>
          </ul>
          <Button
            onClick={() => setDepositDialogOpen(true)}
            className="w-full rounded-xl bg-dashboard-primary hover:bg-dashboard-primary/90 text-white font-semibold py-3"
          >
            Subscribe with Gumroad
          </Button>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 text-center">
            After you subscribe, your account is activated automatically. Cancel anytime from Gumroad.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
