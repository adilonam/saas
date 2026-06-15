"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  ChartBarIcon,
  ComputerDesktopIcon,
  ShieldCheckIcon,
  BoltIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ArrowTopRightOnSquareIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";
import { Loader2 } from "lucide-react";
import { SiFiverr } from "react-icons/si";

const PRICE_USD = 499;
const DEMO_URL = "https://www.cfi-trading.com/";
const FIVERR_REVIEWS_URL =
  "https://www.fiverr.com/adilonam/create-trading-platform-for-your-business";

type ForexOrder = {
  id: string;
  product: string;
  status: string;
  amountCents: number;
  currency: string;
  createdAt: string;
};

const FEATURES = [
  "Live charts with TradingView-style market views",
  "Built-in trade journal, analytics, and performance tracking",
  "Risk calculators: position size, stop loss, and R:R planning",
  "Responsive web app — deploy on your domain or cloud",
  "Modern UI with dark mode and mobile-friendly layouts",
  "Full source license for commercial use",
];

export default function ForexTradingAppPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingOrder, setExistingOrder] = useState<ForexOrder | null>(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") {
      setExistingOrder(null);
      return;
    }

    let cancelled = false;
    setIsLoadingOrder(true);

    fetch("/api/forex-app-order")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { order?: ForexOrder | null } | null) => {
        if (!cancelled) {
          setExistingOrder(data?.order ?? null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setExistingOrder(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingOrder(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [status]);

  const handleBuyNow = async () => {
    if (status === "unauthenticated" || !session) {
      router.push(
        `/signup?callbackUrl=${encodeURIComponent(pathname || "/forex-trading-app")}`,
      );
      return;
    }

    if (existingOrder) {
      return;
    }

    setIsCheckingOut(true);
    setError(null);

    try {
      const res = await fetch("/api/create-forex-app-checkout", {
        method: "POST",
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setError(data.error || "Failed to start checkout");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-dashboard-primary">
              Trading product
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Forex Trading Web App
            </h1>
            <p className="mt-3 max-w-2xl text-lg text-slate-500 dark:text-slate-400">
              A production-ready forex trading platform you can brand, host, and
              sell to your audience. Watch the preview, explore the live demo at{" "}
              <a
                href={DEMO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-dashboard-primary hover:underline"
              >
                CFI Trade
              </a>
              , then purchase the full license.
            </p>
          </div>
          <div className="shrink-0 rounded-2xl border border-slate-200 bg-white px-6 py-5 text-center shadow-xl dark:border-slate-700 dark:bg-slate-900/50">
            <p className="text-sm text-slate-500 dark:text-slate-400">One-time license</p>
            <p className="mt-1 text-4xl font-bold text-slate-900 dark:text-white">
              ${PRICE_USD.toLocaleString()}
              <span className="text-lg font-medium text-slate-500"> USD</span>
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-black shadow-xl dark:border-slate-700">
          <div className="border-b border-slate-800 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <ComputerDesktopIcon className="size-4" />
              App preview
            </div>
          </div>
          <video
            className="aspect-video w-full bg-slate-950"
            controls
            playsInline
            preload="metadata"
            poster=""
          >
            <source src="/video/forex-app.mov" type="video/quicktime" />
            <source src="/video/forex-app.mov" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900/50 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400">
                <GlobeAltIcon className="size-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Live demo website
                </h2>
                <p className="mt-1 max-w-2xl text-sm text-slate-600 dark:text-slate-400 sm:text-base">
                  Explore the full trading platform in production — charts, markets,
                  account flows, and mobile-ready UI on{" "}
                  <span className="font-semibold text-slate-900 dark:text-white">
                    CFI Trade
                  </span>
                  .
                </p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-500">
                  {DEMO_URL.replace(/^https:\/\//, "")}
                </p>
              </div>
            </div>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="shrink-0 gap-2 rounded-xl border-slate-200 dark:border-slate-700"
            >
              <a href={DEMO_URL} target="_blank" rel="noopener noreferrer">
                Open live demo
                <ArrowTopRightOnSquareIcon className="size-4" />
              </a>
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900/50 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-[#1DBF73] dark:bg-emerald-900/30">
                <SiFiverr className="size-7" aria-hidden />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Client reviews
                </h2>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-0.5" aria-label="5 out of 5 stars">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <StarIcon key={index} className="size-5 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    5.0
                  </span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    on Fiverr
                  </span>
                </div>
                <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400 sm:text-base">
                  See what buyers say about our trading platform builds — delivery,
                  quality, and support from real Fiverr orders.
                </p>
              </div>
            </div>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="shrink-0 gap-2 rounded-xl border-slate-200 dark:border-slate-700"
            >
              <a href={FIVERR_REVIEWS_URL} target="_blank" rel="noopener noreferrer">
                <SiFiverr className="size-4 text-[#1DBF73]" aria-hidden />
                Read reviews on Fiverr
                <ArrowTopRightOnSquareIcon className="size-4" />
              </a>
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900/50 sm:p-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              What you get
            </h2>
            <ul className="mt-5 space-y-3">
              {FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-slate-600 dark:text-slate-300">
                  <CheckCircleIcon className="mt-0.5 size-5 shrink-0 text-emerald-500" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900/50">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-xl bg-dashboard-primary/10 text-dashboard-primary">
                  <ChartBarIcon className="size-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">
                    Built for traders
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Charts, journal, risk tools in one app
                  </p>
                </div>
              </div>
              <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <p className="flex items-center gap-2">
                  <BoltIcon className="size-4 text-amber-500" />
                  Ship faster with a ready-made trading UI
                </p>
                <p className="flex items-center gap-2">
                  <ShieldCheckIcon className="size-4 text-emerald-500" />
                  Secure Stripe checkout for your purchase
                </p>
                <p className="flex items-center gap-2">
                  <CurrencyDollarIcon className="size-4 text-sky-500" />
                  One payment — no recurring fees for the license
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-900/40">
              {existingOrder ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/50 dark:bg-emerald-900/20">
                    <CheckCircleIcon className="mt-0.5 size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        License purchased
                      </p>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        Order confirmed on{" "}
                        {new Date(existingOrder.createdAt).toLocaleDateString()}.
                        Our team will deliver setup instructions within 1–2 business days.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Sign in to complete a one-time purchase via Stripe — no subscription
                    required. After payment, our team will deliver setup instructions within
                    1–2 business days.
                  </p>
                  <Button
                    onClick={handleBuyNow}
                    disabled={isCheckingOut || isLoadingOrder}
                    className="mt-4 w-full gap-2 rounded-xl bg-dashboard-primary text-white/90 hover:bg-dashboard-primary/90 hover:text-white"
                    size="lg"
                  >
                    {isCheckingOut ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Redirecting to checkout…
                      </>
                    ) : (
                      <>
                        <CurrencyDollarIcon className="size-5" />
                        Buy now — ${PRICE_USD.toLocaleString()} USD
                      </>
                    )}
                  </Button>
                </>
              )}
              {error && (
                <p className="mt-3 text-sm text-rose-600 dark:text-rose-400">
                  {error}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
