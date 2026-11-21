"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowsRightLeftIcon } from "@heroicons/react/24/outline";

type Mode = "hourly-to-annual" | "annual-to-hourly";

export default function FreelanceRateConverterPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [mode, setMode] = useState<Mode>("hourly-to-annual");
  const [hourly, setHourly] = useState("");
  const [annual, setAnnual] = useState("");
  const [hoursPerWeek, setHoursPerWeek] = useState("40");
  const [weeksPerYear, setWeeksPerYear] = useState("48");
  const [utilizationPct, setUtilizationPct] = useState("100");
  const [unlocked, setUnlocked] = useState(false);

  const gate = () => {
    if (status === "unauthenticated" || !session) {
      router.push(
        `/signup?callbackUrl=${encodeURIComponent(pathname || "/freelance-rate-converter")}`,
      );
      return false;
    }
    const hasActiveSubscription =
      session.user.subscriptionExpiresAt &&
      new Date(session.user.subscriptionExpiresAt) > new Date();
    if (!hasActiveSubscription) {
      router.push("/pricing");
      return false;
    }
    return true;
  };

  const handleConvert = () => {
    if (!gate()) return;
    setUnlocked(true);
  };

  const math = useMemo(() => {
    const hpw = Math.max(parseFloat(hoursPerWeek) || 0, 0);
    const wpy = Math.max(parseFloat(weeksPerYear) || 0, 0);
    const util = Math.min(100, Math.max(parseFloat(utilizationPct) || 0, 0)) / 100;
    const billableHoursYear = hpw * wpy * util;
    if (billableHoursYear <= 0) return null;

    const h = parseFloat(hourly) || 0;
    const a = parseFloat(annual) || 0;

    if (mode === "hourly-to-annual") {
      if (h <= 0) return null;
      return {
        billableHoursYear,
        annualFromHourly: h * billableHoursYear,
        impliedHourly: null as number | null,
      };
    }
    if (a <= 0) return null;
    return {
      billableHoursYear,
      annualFromHourly: null as number | null,
      impliedHourly: a / billableHoursYear,
    };
  }, [mode, hourly, annual, hoursPerWeek, weeksPerYear, utilizationPct]);

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600">
            <ArrowsRightLeftIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Freelance rate ↔ annual income</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Uses billable hours per year (hours × weeks × utilization).
            </p>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => {
              setMode("hourly-to-annual");
              setUnlocked(false);
            }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              mode === "hourly-to-annual"
                ? "bg-teal-600 text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            Hourly → annual
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("annual-to-hourly");
              setUnlocked(false);
            }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              mode === "annual-to-hourly"
                ? "bg-teal-600 text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            Annual → hourly
          </button>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hpw">Hours / week</Label>
              <Input
                id="hpw"
                type="number"
                min="1"
                max="80"
                step="1"
                value={hoursPerWeek}
                onChange={(e) => setHoursPerWeek(e.target.value)}
                className="rounded-xl h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wpy">Weeks / year</Label>
              <Input
                id="wpy"
                type="number"
                min="1"
                max="52"
                step="1"
                value={weeksPerYear}
                onChange={(e) => setWeeksPerYear(e.target.value)}
                className="rounded-xl h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="util">Billable utilization %</Label>
              <Input
                id="util"
                type="number"
                min="0"
                max="100"
                step="1"
                value={utilizationPct}
                onChange={(e) => setUtilizationPct(e.target.value)}
                className="rounded-xl h-11"
              />
            </div>
          </div>

          {mode === "hourly-to-annual" ? (
            <div className="space-y-2">
              <Label htmlFor="hourly">Hourly bill rate</Label>
              <Input
                id="hourly"
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 125"
                value={hourly}
                onChange={(e) => setHourly(e.target.value)}
                className="rounded-xl h-11"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="annual">Target annual income</Label>
              <Input
                id="annual"
                type="number"
                min="0"
                step="100"
                placeholder="e.g. 150000"
                value={annual}
                onChange={(e) => setAnnual(e.target.value)}
                className="rounded-xl h-11"
              />
            </div>
          )}

          <Button onClick={handleConvert} className="gap-2">
            <ArrowsRightLeftIcon className="h-4 w-4" />
            Convert
          </Button>

          {unlocked && math && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-3 text-sm">
              <p className="text-slate-500 dark:text-slate-400">
                Billable hours per year:{" "}
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {Math.round(math.billableHoursYear * 10) / 10}
                </span>
              </p>
              {mode === "hourly-to-annual" && math.annualFromHourly != null && (
                <p className="text-lg font-bold text-slate-900 dark:text-white">
                  Estimated annual:{" "}
                  {new Intl.NumberFormat(undefined, {
                    style: "currency",
                    currency: "USD",
                    maximumFractionDigits: 0,
                  }).format(math.annualFromHourly)}
                </p>
              )}
              {mode === "annual-to-hourly" && math.impliedHourly != null && (
                <p className="text-lg font-bold text-slate-900 dark:text-white">
                  Required hourly rate:{" "}
                  {new Intl.NumberFormat(undefined, {
                    style: "currency",
                    currency: "USD",
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(math.impliedHourly)}
                  <span className="text-sm font-normal text-slate-500"> / hr</span>
                </p>
              )}
            </div>
          )}

          {unlocked && !math && (
            <p className="text-sm text-amber-600 dark:text-amber-400">
              Enter positive numbers for hours, weeks, utilization, and your rate or annual target.
            </p>
          )}
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mt-6">
          This is a planning estimate only. Taxes, benefits, and non-billable time are not modeled beyond utilization %.
        </p>
      </div>
    </DashboardLayout>
  );
}
