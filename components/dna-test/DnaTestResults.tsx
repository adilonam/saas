"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  CheckCircleIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { countryCodeToFlag } from "@/lib/dna-test/country-flag";
import type { DnaTestResult } from "@/lib/dna-test/types";

type DnaTestResultsProps = {
  result: DnaTestResult | null;
  /** Authorized selfie image URL (e.g. /api/dna-test/attempts/[id]/selfie). */
  selfieUrl?: string | null;
  hasAccess: boolean;
  onUnlock: () => void;
  onStartNew: () => void;
  unlocking?: boolean;
  error?: string | null;
};

const SOCIAL_PROOF = [
  { name: "Maya", countries: "PH · ES · MX" },
  { name: "Leo", countries: "IT · GR · TR" },
  { name: "Amina", countries: "MA · FR · SN" },
  { name: "Noah", countries: "US · IE · DE" },
];

export default function DnaTestResults({
  result,
  selfieUrl = null,
  hasAccess,
  onUnlock,
  onStartNew,
  unlocking = false,
  error = null,
}: DnaTestResultsProps) {
  const [proofIndex, setProofIndex] = useState(0);
  const [deadline] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 15);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  });

  useEffect(() => {
    const id = setInterval(() => {
      setProofIndex((i) => (i + 1) % SOCIAL_PROOF.length);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  const proof = SOCIAL_PROOF[proofIndex];

  if (!hasAccess) {
    return (
      <div className="mx-auto w-full min-w-0 max-w-5xl space-y-6 sm:space-y-8">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">Available until {deadline}</p>
        </div>

        <h2 className="text-center text-2xl font-bold text-pretty text-slate-900 sm:text-3xl dark:text-white">
          Your ancestry report is ready!
        </h2>

        <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:rounded-3xl sm:p-6 dark:border-slate-700 dark:bg-slate-900/50">
            <div className="mb-4 rounded-xl bg-fuchsia-50 px-3 py-2 text-sm text-pretty text-fuchsia-800 sm:px-4 dark:bg-fuchsia-950/40 dark:text-fuchsia-200">
              {proof.name} just unlocked their report · {proof.countries}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 dark:border-slate-700 dark:bg-slate-900">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Premium ancestry report
              </h3>
              <p className="text-sm text-slate-500">
                Full access with your subscription
              </p>
              <div className="mt-6 space-y-3 opacity-40 blur-[2px] select-none">
                {["Country A", "Country B", "Country C"].map((label, i) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 rounded-xl bg-slate-100 px-3 py-3 sm:px-4 dark:bg-slate-800"
                  >
                    <span className="text-2xl">🏳️</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between gap-2 text-sm font-medium">
                        <span className="truncate">{label}</span>
                        <span className="shrink-0">{[48, 32, 20][i]}%</span>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700">
                        <div
                          className="h-full rounded-full bg-fuchsia-400"
                          style={{ width: `${[48, 32, 20][i]}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center space-y-6">
            <div className="space-y-4">
              {[
                {
                  icon: CheckCircleIcon,
                  title: "Up to 6 country origins",
                  text: "See estimated ancestry shares with flags and percentages",
                },
                {
                  icon: ShieldCheckIcon,
                  title: "Saved to your account",
                  text: "Revisit your last report anytime or start a new test",
                },
              ].map((item) => (
                <div key={item.title} className="flex gap-3">
                  <item.icon className="mt-0.5 size-6 shrink-0 text-emerald-600" />
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {item.title}
                    </p>
                    <p className="text-sm text-slate-500">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <Button
              size="lg"
              className="h-12 w-full bg-emerald-600 hover:bg-emerald-700"
              onClick={onUnlock}
              disabled={unlocking}
            >
              {unlocking ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Unlocking…
                </>
              ) : (
                "Unlock my ancestry report"
              )}
            </Button>
            {error && (
              <p className="text-center text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
            <Button
              variant="outline"
              className="h-12 w-full"
              onClick={onStartNew}
            >
              Start new test
            </Button>
          </div>
        </div>
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
            <p className="text-sm font-medium uppercase tracking-wide text-fuchsia-600">
              Your ancestry estimate
            </p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl dark:text-white">
              Estimated origins
            </h2>
            <p className="mt-2 text-sm text-pretty text-slate-600 sm:text-base dark:text-slate-300">
              Entertainment-only guess from facial appearance · up to{" "}
              {result.origins.length} countries
            </p>
          </div>

          {selfieUrl && (
            <div className="flex justify-center">
              <div className="relative size-36 overflow-hidden rounded-2xl border border-slate-200 shadow-sm sm:size-44 dark:border-slate-700">
                <Image
                  src={selfieUrl}
                  alt="Your selfie used for this ancestry estimate"
                  fill
                  unoptimized
                  className="object-cover"
                  sizes="176px"
                />
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6 dark:border-slate-700 dark:bg-slate-900">
            <ul className="space-y-3">
              {result.origins.map((o) => (
                <li
                  key={o.countryCode}
                  className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-3 sm:px-4 dark:bg-slate-800/60"
                >
                  <span
                    className="text-2xl leading-none"
                    role="img"
                    aria-label={`${o.country} flag`}
                  >
                    {countryCodeToFlag(o.countryCode)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="truncate font-medium text-slate-900 dark:text-white">
                        {o.country}
                      </span>
                      <span className="shrink-0 text-sm font-semibold tabular-nums text-slate-900 dark:text-white">
                        {o.percentage}%
                      </span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                      <div
                        className="h-full rounded-full bg-fuchsia-500 transition-all"
                        style={{ width: `${o.percentage}%` }}
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-pretty text-slate-500">
              Entertainment estimate only — not a real DNA or genetic test.
              Results are speculative guesses from facial appearance.
            </p>
          </div>

          <div className="flex justify-center">
            <Button
              className="h-12 w-full bg-emerald-600 hover:bg-emerald-700 sm:w-auto"
              onClick={onStartNew}
            >
              Start new test
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
