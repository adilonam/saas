"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { CurrencyDollarIcon, CheckIcon, UserPlusIcon, ClipboardDocumentIcon, EnvelopeIcon } from "@heroicons/react/24/outline";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

export default function PricingPage() {
  const router = useRouter();
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

  const inviteMessage = "Get 1 free day and join the waitlist to get AI productivity tools for PDF and image processing. Join me on anycode.it: ";
  const inviteText = inviteUrl ? `${inviteMessage}${inviteUrl}` : "";

  const shareWhatsApp = () => {
    if (!inviteText) return;
    window.open(`https://wa.me/?text=${encodeURIComponent(inviteText)}`, "_blank", "noopener,noreferrer");
  };
  const shareTelegram = () => {
    if (!inviteText) return;
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(inviteUrl!)}&text=${encodeURIComponent(inviteText)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };
  const shareEmail = () => {
    if (!inviteText) return;
    const subject = "Get 1 free day — AI productivity tools for PDF & image";
    const body = inviteText;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

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
          <div className="relative space-y-3">
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
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-xl border-slate-200 dark:border-slate-700 gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white border-0"
                onClick={shareWhatsApp}
              >
                <svg className="size-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                WhatsApp
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-xl border-slate-200 dark:border-slate-700 gap-2 bg-[#0088cc] hover:bg-[#0077b5] text-white border-0"
                onClick={shareTelegram}
              >
                <svg className="size-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
                Telegram
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-xl border-slate-200 dark:border-slate-700 gap-2"
                onClick={shareEmail}
              >
                <EnvelopeIcon className="size-5" />
                Email
              </Button>
            </div>
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
