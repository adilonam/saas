"use client";

import { useEffect, useState } from "react";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";
import { StarIcon } from "@heroicons/react/24/solid";
import { IQ_TESTIMONIALS } from "@/lib/iq-test/testimonials";

const ANALYSIS_STEPS = [
  {
    title: "Processing responses",
    description: "Evaluating the accuracy of your answers",
  },
  {
    title: "Measuring cognitive dimensions",
    description:
      "Analyzing attention, reaction time, concentration, and logic",
  },
  {
    title: "Calculating processing speed",
    description: "Factoring in your completion time",
  },
  {
    title: "Computing IQ score",
    description: "Generating your cognitive profile",
  },
];

/** Per-step fill durations (ms). Sequential total ≈ 9–11s including pauses. */
const STEP_DURATIONS_MS = [1800, 2600, 2100, 2800] as const;
const STEP_PAUSE_MS = 350;
const COMPLETE_PAUSE_MS = 700;

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

export default function IqTestAnalyzing({
  onComplete,
}: {
  onComplete: () => void | Promise<void>;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState<number[]>([0, 0, 0, 0]);

  useEffect(() => {
    let cancelled = false;
    const runStep = (idx: number) => {
      if (cancelled || idx >= ANALYSIS_STEPS.length) {
        if (!cancelled) {
          setTimeout(onComplete, COMPLETE_PAUSE_MS);
        }
        return;
      }
      setStepIndex(idx);
      const start = Date.now();
      const duration = STEP_DURATIONS_MS[idx] ?? 2000;
      const tick = () => {
        if (cancelled) return;
        const linear = Math.min(1, (Date.now() - start) / duration);
        const pct = easeOutCubic(linear) * 100;
        setProgress((prev) => {
          const next = [...prev];
          next[idx] = pct;
          return next;
        });
        if (linear < 1) {
          requestAnimationFrame(tick);
        } else {
          setTimeout(() => runStep(idx + 1), STEP_PAUSE_MS);
        }
      };
      requestAnimationFrame(tick);
    };
    runStep(0);
    return () => {
      cancelled = true;
    };
  }, [onComplete]);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Calculating your IQ score…
        </h2>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white px-6 py-8 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="space-y-6">
          {ANALYSIS_STEPS.map((step, i) => (
            <div key={step.title} className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p
                    className={`font-semibold ${
                      i <= stepIndex
                        ? "text-slate-900 dark:text-white"
                        : "text-slate-400"
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-sm text-slate-500">{step.description}</p>
                </div>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-blue-500 transition-[width] duration-150 ease-out"
                  style={{ width: `${progress[i]}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {IQ_TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-800/50"
            >
              <div className="flex items-center gap-2">
                <div className="flex size-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {t.name}, {t.age}
                  </p>
                  <p className="text-xs text-slate-500">
                    {t.flag} {t.location}
                  </p>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-1">
                <CheckBadgeIcon className="size-4 text-emerald-500" />
                <span className="text-[10px] font-bold uppercase tracking-wide text-emerald-600">
                  Verified
                </span>
                <div className="ml-auto flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <StarIcon key={i} className="size-3 text-amber-400" />
                  ))}
                </div>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                &ldquo;{t.quote}&rdquo;
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
