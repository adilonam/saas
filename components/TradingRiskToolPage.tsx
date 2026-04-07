"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { CalculatorIcon, ChartBarIcon } from "@heroicons/react/24/outline";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ToolField = {
  key: string;
  label: string;
  placeholder?: string;
  type?: "number" | "text" | "select";
  step?: string;
  min?: string;
  defaultValue?: string;
  options?: { value: string; label: string }[];
  helperText?: string;
};

type ToolResult = {
  label: string;
  value: string;
  tone?: "default" | "positive" | "danger";
};

type TradingRiskToolPageProps = {
  title: string;
  description: string;
  formulaNote: string;
  fields: ToolField[];
  compute: (values: Record<string, number | string>) => ToolResult[] | null;
};

export default function TradingRiskToolPage({
  title,
  description,
  formulaNote,
  fields,
  compute,
}: TradingRiskToolPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const initialState = useMemo(() => {
    const map: Record<string, string> = {};
    for (const field of fields) map[field.key] = field.defaultValue ?? "";
    return map;
  }, [fields]);
  const [values, setValues] = useState<Record<string, string>>(initialState);
  const [resultUnlocked, setResultUnlocked] = useState(false);

  const handleCalculate = () => {
    if (status === "unauthenticated" || !session) {
      router.push(`/signup?callbackUrl=${encodeURIComponent(pathname || "/")}`);
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

  const normalized = useMemo(() => {
    const output: Record<string, number | string> = {};
    for (const field of fields) {
      if (field.type === "select" || field.type === "text") {
        output[field.key] = (values[field.key] ?? "").trim();
      } else {
        const parsed = parseFloat((values[field.key] ?? "").replace(/,/g, ""));
        output[field.key] = Number.isFinite(parsed) ? parsed : 0;
      }
    }
    return output;
  }, [fields, values]);

  const results = useMemo(() => compute(normalized), [compute, normalized]);

  const isDisabled = fields.some((field) => {
    const current = (values[field.key] ?? "").trim();
    return current.length === 0;
  });

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600">
            <ChartBarIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">{description}</p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          {fields.map((field) => (
            <div className="space-y-2" key={field.key}>
              <Label htmlFor={field.key}>{field.label}</Label>
              {field.type === "select" ? (
                <select
                  id={field.key}
                  value={values[field.key] ?? ""}
                  onChange={(e) => setValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  {(field.options ?? []).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : field.type === "text" ? (
                <Input
                  id={field.key}
                  type="text"
                  placeholder={field.placeholder}
                  value={values[field.key] ?? ""}
                  onChange={(e) => setValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  className="rounded-xl h-11"
                />
              ) : (
                <Input
                  id={field.key}
                  type="number"
                  min={field.min}
                  step={field.step}
                  inputMode="decimal"
                  placeholder={field.placeholder}
                  value={values[field.key] ?? ""}
                  onChange={(e) => setValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  className="rounded-xl h-11"
                />
              )}
              {field.helperText ? (
                <p className="text-xs text-slate-500 dark:text-slate-400">{field.helperText}</p>
              ) : null}
            </div>
          ))}

          <div className="flex gap-4 pt-4">
            <Button onClick={handleCalculate} disabled={isDisabled} className="gap-2">
              <CalculatorIcon className="h-4 w-4" />
              Generate Results
            </Button>
          </div>

          {results && resultUnlocked ? (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-4">
              {results.map((result) => (
                <div key={result.label}>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{result.label}</p>
                  <p
                    className={`text-lg font-semibold whitespace-pre-wrap ${
                      result.tone === "positive"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : result.tone === "danger"
                          ? "text-rose-600 dark:text-rose-400"
                          : "text-slate-900 dark:text-white"
                    }`}
                  >
                    {result.value}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mt-6">{formulaNote}</p>
      </div>
    </DashboardLayout>
  );
}
