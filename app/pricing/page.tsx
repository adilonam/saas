"use client";

import { useState } from "react";
import Link from "next/link";
import DashboardLayout from "components/DashboardLayout";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { CurrencyDollarIcon, CheckIcon, UserPlusIcon, ClipboardDocumentIcon } from "@heroicons/react/24/outline";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

export default function PricingPage() {
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState<"monthly" | "annual" | null>(null);
  const [copied, setCopied] = useState(false);

  const inviteUrl =
    typeof window !== "undefined" && session?.user?.id
      ? `${window.location.origin}/signup?ref=${session.user.id}`
      : "";

  const copyInviteLink = () => {
    if (!inviteUrl) return;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubscribe = async (plan: "monthly" | "annual") => {
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

      {/* Invite friends — recommended for free access (first) */}
      <div className="mb-12 max-w-2xl rounded-2xl border-2 border-dashboard-primary/40 dark:border-dashboard-primary/50 bg-linear-to-br from-dashboard-primary/5 via-white to-dashboard-primary/10 dark:from-dashboard-primary/10 dark:via-slate-900/80 dark:to-dashboard-primary/15 p-6 sm:p-8 shadow-xl shadow-dashboard-primary/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-dashboard-primary/10 dark:bg-dashboard-primary/20 rounded-full -translate-y-1/2 translate-x-1/2" aria-hidden />
        <div className="absolute top-4 right-4 text-xs font-bold bg-dashboard-primary text-white dark:bg-dashboard-primary px-2.5 py-1 rounded-lg shadow-sm">
          Free
        </div>
        <div className="flex items-center gap-3 mb-3 relative">
          <div className="size-12 rounded-xl bg-dashboard-primary/20 dark:bg-dashboard-primary/30 flex items-center justify-center text-dashboard-primary">
            <UserPlusIcon className="size-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Invite friends
            </h2>
            <p className="text-sm font-medium text-dashboard-primary dark:text-dashboard-primary">
              It&apos;s free — get 1 free day and move up on the waitlist for AI tools on anycode.it
            </p>
          </div>
        </div>
        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base mb-4 relative">
          Share your link. When a friend signs up, you get <strong className="text-slate-900 dark:text-white">1 day free subscription and move closer on the waitlist </strong>for exclusive AI tools on anycode.it.
        </p>
        {session?.user?.id && session.user.waitlistNumber != null && (
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 relative">
            Your position: <span className="text-dashboard-primary">Waitlist {session.user.waitlistNumber}</span>
            {" "}— each invite moves you up one spot.
          </p>
        )}
        {session?.user?.id ? (
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              readOnly
              value={inviteUrl}
              className="flex-1 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 truncate"
            />
            <Button
              type="button"
              variant="outline"
              className="rounded-xl border-slate-200 dark:border-slate-700 shrink-0 gap-2"
              onClick={copyInviteLink}
            >
              <ClipboardDocumentIcon className="size-5" />
              {copied ? "Copied!" : "Copy link"}
            </Button>
          </div>
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            <Link href="/signin" className="font-medium text-dashboard-primary hover:underline">
              Sign in
            </Link>
            {" "}to get your invite link and start earning free access.
          </p>
        )}
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
              $10 <span className="text-base font-normal text-slate-500 dark:text-slate-400">USD / month</span>
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
                Billed once per year via Stripe
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
              <span>Full access to all productivity tools</span>
            </li>
            <li className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
              <CheckIcon className="size-5 text-green-600 dark:text-green-400 shrink-0" />
              <span>12 months for the price of 8</span>
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
