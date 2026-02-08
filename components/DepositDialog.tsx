"use client";

import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    dataLayer: any[];
  }
}

interface DepositDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function DepositDialog({
  open,
  onOpenChange,
  onSuccess,
}: DepositDialogProps) {
  const monthlyUrl = process.env.NEXT_PUBLIC_GUMROAD_SUBSCRIPTION_URL || "";
  const annualUrl = process.env.NEXT_PUBLIC_GUMROAD_ANNUAL_URL || "";

  const handleSubscribe = (url: string, plan: string) => {
    if (typeof window !== "undefined" && window.dataLayer) {
      window.dataLayer.push({
        event: "subscribe_click",
        eventCategory: "Subscription",
        eventAction: "Gumroad",
        eventLabel: plan,
      });
    }
    if (url) {
      window.open(url, "_blank");
      onSuccess?.();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-xl gap-0 [&>button]:right-4 [&>button]:top-4 [&>button]:rounded-xl [&>button]:text-slate-500 [&>button]:hover:text-slate-900 dark:[&>button]:hover:text-white [&>button]:focus:ring-dashboard-primary/20">
        <DialogHeader className="space-y-2 text-left">
          <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
            Subscribe
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500 dark:text-slate-400">
            Choose a plan and subscribe via Gumroad. Use the same email as your account so we can activate your subscription automatically.
          </DialogDescription>
        </DialogHeader>
        <div className="py-6 space-y-3">
          <Button
            type="button"
            onClick={() => handleSubscribe(monthlyUrl, "Monthly $10")}
            disabled={!monthlyUrl}
            className="w-full rounded-xl bg-dashboard-primary hover:bg-dashboard-primary/90 text-white font-semibold py-3 gap-2 h-auto justify-between"
          >
            <span>Monthly — $10 USD / month</span>
            <ArrowTopRightOnSquareIcon className="size-5 shrink-0" />
          </Button>
          <Button
            type="button"
            onClick={() => handleSubscribe(annualUrl, "Annual $80")}
            disabled={!annualUrl}
            variant="outline"
            className="w-full rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold py-3 gap-2 h-auto justify-between"
          >
            <span>Annual — $80 USD / year (Save 33%)</span>
            <ArrowTopRightOnSquareIcon className="size-5 shrink-0" />
          </Button>
          {!monthlyUrl && !annualUrl && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 text-center">
              Subscription links are not configured. Set NEXT_PUBLIC_GUMROAD_SUBSCRIPTION_URL and NEXT_PUBLIC_GUMROAD_ANNUAL_URL.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
