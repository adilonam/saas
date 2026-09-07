"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  ArrowDownTrayIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";
import UniversityLogos from "@/components/iq-test/UniversityLogos";
import { Button } from "@/components/ui/button";
import { SOCIAL_PROOF_NAMES } from "@/lib/iq-test/testimonials";
import type { IqTestResult } from "@/lib/iq-test/types";

type IqTestResultsProps = {
  result: IqTestResult | null;
  hasAccess: boolean;
  onUnlock: () => void;
  onStartNew: () => void;
  unlocking?: boolean;
  error?: string | null;
};

export default function IqTestResults({
  result,
  hasAccess,
  onUnlock,
  onStartNew,
  unlocking = false,
  error = null,
}: IqTestResultsProps) {
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
      const res = await fetch("/api/iq-test/pdf", {
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
      a.download = "iq-score-report.pdf";
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
      <div className="mx-auto w-full min-w-0 max-w-5xl space-y-6 sm:space-y-8">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Available until {deadline}
          </p>
        </div>

        <h2 className="text-center text-2xl font-bold text-pretty text-slate-900 sm:text-3xl dark:text-white">
          Your IQ score report is ready!
        </h2>

        <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:rounded-3xl sm:p-6 dark:border-slate-700 dark:bg-slate-900/50">
            <div className="mb-4 rounded-xl bg-blue-50 px-3 py-2 text-sm text-pretty text-blue-800 sm:px-4 dark:bg-blue-950/40 dark:text-blue-200">
              {proof.name} just unlocked their report · IQ score: {proof.score}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-start justify-between gap-3 sm:gap-4">
                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Premium IQ score report
                  </h3>
                  <p className="text-sm text-slate-500">
                    Full access with your subscription
                  </p>
                </div>
                <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:size-16 dark:bg-slate-800">
                  <Image
                    src="/images/iq-test/iq-q22-question.png"
                    alt="IQ report preview"
                    fill
                    sizes="64px"
                    className="object-contain p-1"
                  />
                </div>
              </div>

              <ul className="mt-6 space-y-3 text-sm text-slate-700 dark:text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="mt-0.5 size-5 shrink-0 text-emerald-500" />
                  Discover your exact IQ score
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="mt-0.5 size-5 shrink-0 text-emerald-500" />
                  Explore your cognitive abilities across 5 dimensions
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="mt-0.5 size-5 shrink-0 text-emerald-500" />
                  Compare your position relative to the population
                </li>
              </ul>

              <Button
                className="mt-6 h-12 w-full bg-emerald-600 hover:bg-emerald-700"
                size="lg"
                onClick={onUnlock}
                disabled={unlocking}
              >
                {unlocking ? "Unlocking…" : "Unlock my report"}
              </Button>

              {error && (
                <p className="mt-3 text-center text-sm text-red-600">{error}</p>
              )}

              <Button
                variant="outline"
                className="mt-3 h-12 w-full"
                onClick={onStartNew}
              >
                Start new test
              </Button>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500 sm:gap-4">
                <span className="flex items-center gap-1">
                  <ShieldCheckIcon className="size-4 shrink-0" />
                  Subscription required
                </span>
                <span>100% secure</span>
              </div>
            </div>
          </div>

          <div className="min-w-0">
            <h3 className="mb-6 text-xl font-bold text-slate-900 dark:text-white">
              What you will receive
            </h3>
            <div className="space-y-5">
              {[
                {
                  icon: "📋",
                  title: "Detailed report",
                  text: "IQ score plus breakdown across 5 main cognitive abilities.",
                },
                {
                  icon: "🔍",
                  title: "Full test library",
                  text: "Access to specialized assessments across reasoning and study skills.",
                },
                {
                  icon: "📄",
                  title: "Personal reports",
                  text: "Detailed reports for every assessment you complete.",
                },
                {
                  icon: "📅",
                  title: "Daily challenges",
                  text: "Personalized challenges adapted to your progress goals.",
                },
              ].map((item) => (
                <div key={item.title} className="flex gap-3 sm:gap-4">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xl dark:bg-slate-800">
                    {item.icon}
                  </div>
                  <div className="min-w-0">
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
    <div className="mx-auto w-full min-w-0 max-w-3xl space-y-6 sm:space-y-8">
      {!result ? (
        <div className="text-center">
          <p className="text-slate-600 dark:text-slate-300">
            {error ?? "Loading your report…"}
          </p>
          {error && (
            <Button className="mt-4" onClick={onStartNew}>
              Retry
            </Button>
          )}
        </div>
      ) : (
        <>
      <div className="text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-blue-600">
          Your cognitive profile
        </p>
        <h2 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl dark:text-white">
          IQ {result.iq}
        </h2>
        <p className="mt-2 text-sm text-pretty text-slate-600 sm:text-base dark:text-slate-300">
          You scored higher than {result.percentile}% of the population ·{" "}
          {result.accuracy}% puzzle accuracy ·{" "}
          {Math.floor(result.elapsedSeconds / 60)}m {result.elapsedSeconds % 60}s
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6 dark:border-slate-700 dark:bg-slate-900">
        <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">
          Cognitive dimensions
        </h3>
        <div className="space-y-4">
          {result.dimensions.map((dim) => (
            <div key={dim.label} className="min-w-0">
              <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                <span className="min-w-0 font-medium text-slate-800 dark:text-slate-200">
                  {dim.label}
                </span>
                <span className="shrink-0 text-slate-500">{dim.score}/99</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-blue-500"
                  style={{ width: `${dim.score}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-pretty text-slate-500">
                {dim.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-stretch gap-3 sm:items-center">
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-center">
          <Button
            variant="outline"
            onClick={handlePrintPdf}
            disabled={printing}
            className="h-12 w-full gap-2 sm:w-auto"
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
            className="h-12 w-full bg-emerald-600 hover:bg-emerald-700 sm:w-auto"
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
