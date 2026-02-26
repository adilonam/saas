"use client";

import Link from "next/link";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { CheckCircleIcon, ClockIcon } from "@heroicons/react/24/solid";

export default function ThankYouPage() {
  return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto text-center py-12 sm:py-16 px-4">
        <div className="size-16 sm:size-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
          <CheckCircleIcon className="size-10 sm:size-12 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          Thank you for your purchase
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-3 text-base sm:text-lg">
          Your payment was successful. You now have access to all productivity tools.
        </p>

        <div className="mt-8 p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex items-start gap-4 text-left">
          <div className="size-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
            <ClockIcon className="size-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base">
              Subscription activation
            </p>
            <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm sm:text-base">
              Activated within <strong>3 minutes</strong>. Refresh or use any tool once it’s ready.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="rounded-xl bg-dashboard-primary hover:bg-dashboard-primary/90">
            <Link href="/">Go to Home</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-xl border-slate-200 dark:border-slate-700">
            <Link href="/pricing">Back to Pricing</Link>
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
