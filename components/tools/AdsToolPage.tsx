"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { CalculatorIcon, ChartBarIcon } from "@heroicons/react/24/outline";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ADS_TOOLS_BY_SLUG } from "./adsToolsConfig";

type Props = {
  /** Resolved on the client from ADS_TOOLS_BY_SLUG so `calculate` is not passed from a Server Component. */
  slug: string;
};

export default function AdsToolPage({ slug }: Props) {
  const config = ADS_TOOLS_BY_SLUG[slug];
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [resultUnlocked, setResultUnlocked] = useState(false);
  const [values, setValues] = useState<Record<string, string>>(() =>
    config ? Object.fromEntries(config.inputs.map((field) => [field.key, ""])) : {},
  );

  const numericValues = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(values).map(([key, value]) => [key, parseFloat(value) || 0]),
      ) as Record<string, number>,
    [values],
  );

  const results = useMemo(() => {
    if (!config) return [];
    return config.calculate(numericValues);
  }, [config, numericValues]);

  const isReady =
    config?.inputs.every((input) => (parseFloat(values[input.key]) || 0) > 0) ?? false;

  const handleCalculate = () => {
    if (status === "unauthenticated" || !session) {
      router.push(`/signup?callbackUrl=${encodeURIComponent(pathname || `/${slug}`)}`);
      return;
    }
    const hasActiveSubscription =
      session.user.subscriptionExpiresAt &&
      new Date(session.user.subscriptionExpiresAt) > new Date();
    if (!hasActiveSubscription) {
      router.push("/pricing");
      return;
    }
    setResultUnlocked(true);
  };

  if (!config) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
            <ChartBarIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{config.title}</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">{config.description}</p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {config.inputs.map((input) => (
              <div key={input.key} className="space-y-2">
                <Label htmlFor={input.key}>{input.label}</Label>
                <Input
                  id={input.key}
                  type="text"
                  inputMode="decimal"
                  placeholder={input.placeholder}
                  value={values[input.key]}
                  onChange={(e) =>
                    setValues((prev) => ({
                      ...prev,
                      [input.key]: e.target.value.replace(/[^0-9.]/g, ""),
                    }))
                  }
                  className="rounded-xl h-11"
                />
              </div>
            ))}
          </div>

          <div className="flex gap-4 pt-2">
            <Button onClick={handleCalculate} disabled={!isReady} className="gap-2">
              <CalculatorIcon className="h-4 w-4" />
              Calculate
            </Button>
          </div>

          {resultUnlocked && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {results.map((result) => (
                  <div key={result.label} className="rounded-xl bg-slate-100 dark:bg-slate-800/50 p-4">
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {result.label}
                    </p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{result.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
