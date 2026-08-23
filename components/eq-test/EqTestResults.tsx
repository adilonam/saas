"use client";

import { useEffect, useState } from "react";
import {
  ArrowDownTrayIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";
import UniversityLogos from "@/components/iq-test/UniversityLogos";
import { Button } from "@/components/ui/button";
import { SOCIAL_PROOF_NAMES } from "@/lib/eq-test/testimonials";
import type { EqTestResult } from "@/lib/eq-test/types";

type EqTestResultsProps = {
  result: EqTestResult | null;
  hasAccess: boolean;
  onUnlock: () => void;
  onStartNew: () => void;
  unlocking?: boolean;
  error?: string | null;
};

export default function EqTestResults({
  result,
  hasAccess,
  onUnlock,
  onStartNew,
  unlocking = false,
  error = null,
}: EqTestResultsProps) {
  const [proofIndex, setProofIndex] = useState(0);
  const [printing, setPrinting] = useState(false);
  const [printError, setPrintError] = useState<string | null>(null);
  const [deadline] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 15);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  });

  const handlePrintPdf = async () => {
    if (!result || printing) return;

    setPrinting(true);
    setPrintError(null);

    try {
      const res = await fetch("/api/eq-test/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ result }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setPrintError(
          (data as { error?: string }).error ||
            "Failed to generate PDF. Please try again.",
        );
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "eq-score-report.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setPrintError("Something went wrong while generating the PDF.");
    } finally {
      setPrinting(false);
    }
  };

  useEffect(() => {
    const id = setInterval(() => {
      setProofIndex((i) => (i + 1) % SOCIAL_PROOF_NAMES.length);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  const proof = SOCIAL_PROOF_NAMES[proofIndex];

  if (!hasAccess) {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-8">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Available until {deadline}
          </p>
        </div>

        <h2 className="text-center text-3xl font-bold text-slate-900 dark:text-white">
          Your EQ score report is ready!
        </h2>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-900/50">
            <div className="mb-4 rounded-xl bg-teal-50 px-4 py-2 text-sm text-teal-800 dark:bg-teal-950/40 dark:text-teal-200">
              {proof.name} just unlocked their report · EQ score: {proof.score}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Premium EQ score report
                  </h3>
                  <p className="text-sm text-slate-500">
                    Full access with your subscription
                  </p>
                </div>
                <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300">
                  <CheckCircleIcon className="size-8" />
                </div>
              </div>

              <ul className="mt-6 space-y-3 text-sm text-slate-700 dark:text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="mt-0.5 size-5 shrink-0 text-emerald-500" />
                  Discover your exact EQ score
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="mt-0.5 size-5 shrink-0 text-emerald-500" />
                  Explore strengths across 5 emotional intelligence domains
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="mt-0.5 size-5 shrink-0 text-emerald-500" />
                  Compare your position relative to the population
                </li>
              </ul>

              <Button
                className="mt-6 w-full bg-emerald-600 hover:bg-emerald-700"
                size="lg"
                onClick={onUnlock}
                disabled={unlocking}
              >
                {unlocking ? "Unlocking…" : "Unlock my report"}
              </Button>

              {error && (
                <p className="mt-3 text-center text-sm text-red-600">{error}</p>
              )}

              <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <ShieldCheckIcon className="size-4" />
                  Subscription required
                </span>
                <span>100% secure</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-6 text-xl font-bold text-slate-900 dark:text-white">
              What you will receive
            </h3>
            <div className="space-y-5">
              {[
                {
                  title: "Detailed report",
                  text: "EQ score plus breakdown across 5 core emotional intelligence domains.",
                },
                {
                  title: "Practical insights",
                  text: "Understand how you handle pressure, empathy, and relationships.",
                },
                {
                  title: "Personal PDF",
                  text: "Download a printable report of your scored profile.",
                },
                {
                  title: "Growth focus",
                  text: "See which domains to strengthen next for clearer interpersonal impact.",
                },
              ].map((item) => (
                <div key={item.title} className="flex gap-4">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                    <CheckCircleIcon className="size-6 text-teal-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {item.title}
                    </p>
                    <p className="text-sm text-slate-500">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <UniversityLogos className="pt-4" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      {!result ? (
        <div className="text-center">
          <p className="text-slate-600 dark:text-slate-300">
            {error ?? "Loading your report…"}
          </p>
          {error && (
            <Button className="mt-4" onClick={onUnlock} disabled={unlocking}>
              Retry
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="text-center">
            <p className="text-sm font-medium uppercase tracking-wide text-teal-600">
              Your emotional intelligence profile
            </p>
            <h2 className="mt-2 text-4xl font-bold text-slate-900 dark:text-white">
              EQ {result.eq}
            </h2>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
              You scored higher than {result.percentile}% of the population ·{" "}
              {result.accuracy}% response quality ·{" "}
              {Math.floor(result.elapsedSeconds / 60)}m{" "}
              {result.elapsedSeconds % 60}s
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">
              EQ dimensions
            </h3>
            <div className="space-y-4">
              {result.dimensions.map((dim) => (
                <div key={dim.label}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {dim.label}
                    </span>
                    <span className="text-slate-500">{dim.score}/99</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full bg-teal-500"
                      style={{ width: `${dim.score}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{dim.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center gap-3">
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                variant="outline"
                onClick={handlePrintPdf}
                disabled={printing}
                className="gap-2"
              >
                {printing ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Generating PDF…
                  </>
                ) : (
                  <>
                    <ArrowDownTrayIcon className="size-4" />
                    Print report
                  </>
                )}
              </Button>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={onStartNew}
              >
                Start new test
              </Button>
            </div>
            {printError && (
              <p className="text-center text-sm text-red-600" role="alert">
                {printError}
              </p>
            )}
          </div>

          <UniversityLogos className="border-t border-slate-200 pt-8 dark:border-slate-700" />
        </>
      )}
    </div>
  );
}
