"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { ExternalLink } from "lucide-react";
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Deposit Tokens</DialogTitle>
          <DialogDescription>
            Enter your license key to add tokens to your account.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="licenseKey">License Key</Label>
              <Input
                id="licenseKey"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                placeholder="Enter your license key"
                disabled={isLoading}
                required
              />
            </div>
            {error && (
              <div className="text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}
            {success && (
              <div className="text-sm text-green-600 dark:text-green-400">
                {success}
              </div>
            )}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => window.open(licenseKeyUrl, "_blank")}
                className="flex items-center gap-2"
              >
                Get License Key
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !licenseKey}>
              {isLoading ? "Processing..." : "Redeem"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
