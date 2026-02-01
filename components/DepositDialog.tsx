"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Declare dataLayer for TypeScript
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
  const { data: session, update } = useSession();
  const [licenseKey, setLicenseKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const licenseKeyUrl = process.env.NEXT_PUBLIC_LICENSE_KEY_URL || "#";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/deposit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ licenseKey }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to redeem license key");
        setIsLoading(false);
        return;
      }

      setSuccess(`Successfully added ${data.amount} tokens to your account!`);
      setLicenseKey("");
      
      // Trigger Google Tag Manager event for deposit
      if (typeof window !== "undefined" && window.dataLayer) {
        window.dataLayer.push({
          event: "deposit",
          eventCategory: "Token",
          eventAction: "Deposit",
          eventLabel: "License Key Redeemed",
          value: data.amount,
          tokens: data.amount,
        });
      }
      
      // Update session to reflect new token balance
      await update();
      
      // Call onSuccess callback after a short delay
      setTimeout(() => {
        onSuccess?.();
        onOpenChange(false);
        setSuccess(null);
      }, 2000);
    } catch (err) {
      setError("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setLicenseKey("");
      setError(null);
      setSuccess(null);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-xl gap-0 [&>button]:right-4 [&>button]:top-4 [&>button]:rounded-xl [&>button]:text-slate-500 [&>button]:hover:text-slate-900 dark:[&>button]:hover:text-white [&>button]:focus:ring-dashboard-primary/20">
        <DialogHeader className="space-y-2 text-left">
          <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
            Deposit Tokens
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500 dark:text-slate-400">
            Enter your license key to add tokens to your account.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-6">
            <div className="grid gap-2">
              <Label htmlFor="licenseKey" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                License Key
              </Label>
              <Input
                id="licenseKey"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                placeholder="Enter your license key"
                disabled={isLoading}
                required
                className="rounded-xl bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-dashboard-primary/20 h-11"
              />
            </div>
            {error && (
              <div className="text-sm text-red-600 dark:text-red-400 rounded-xl bg-red-50 dark:bg-red-900/20 px-3 py-2 border border-red-200 dark:border-red-800">
                {error}
              </div>
            )}
            {success && (
              <div className="text-sm text-green-600 dark:text-green-400 rounded-xl bg-green-50 dark:bg-green-900/20 px-3 py-2 border border-green-200 dark:border-green-800">
                {success}
              </div>
            )}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => window.open(licenseKeyUrl, "_blank")}
                className="rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 gap-2 h-9"
              >
                Get License Key
                <ArrowTopRightOnSquareIcon className="size-4" />
              </Button>
            </div>
          </div>
          <DialogFooter className="flex flex-row gap-3 justify-end pt-2 sm:space-x-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
              className="rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !licenseKey}
              className="rounded-xl bg-dashboard-primary hover:bg-dashboard-primary/90 text-white"
            >
              {isLoading ? "Processing..." : "Redeem"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
