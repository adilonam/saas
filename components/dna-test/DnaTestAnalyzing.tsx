"use client";

import { useEffect, useState } from "react";

const ANALYSIS_STEPS = [
  {
    title: "Reading facial landmarks",
    description: "Detecting face structure and key features",
  },
  {
    title: "Comparing regional traits",
    description: "Matching visible cues to world regions",
  },
  {
    title: "Estimating country shares",
    description: "Building percentage mixes for likely origins",
  },
  {
    title: "Preparing your report",
    description: "Formatting flags and ancestry breakdown",
  },
];

const STEP_DURATIONS_MS = [1600, 2200, 2000, 1800] as const;
const STEP_PAUSE_MS = 300;
const COMPLETE_PAUSE_MS = 500;

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

export default function DnaTestAnalyzing({
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
    <div className="mx-auto w-full min-w-0 max-w-2xl space-y-8">
      <div className="text-center">
        <h2 className="text-xl font-bold text-slate-900 sm:text-2xl dark:text-white">
          Analyzing your ancestry estimate…
        </h2>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-6 shadow-sm sm:rounded-3xl sm:px-6 sm:py-8 dark:border-slate-700 dark:bg-slate-900">
        <div className="space-y-6">
          {ANALYSIS_STEPS.map((step, i) => (
            <div key={step.title} className="min-w-0 space-y-2">
              <div className="min-w-0">
                <p
                  className={`font-semibold ${
                    i <= stepIndex
                      ? "text-slate-900 dark:text-white"
                      : "text-slate-400"
                  }`}
                >
                  {step.title}
                </p>
                <p className="text-sm text-pretty text-slate-500">
                  {step.description}
                </p>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-fuchsia-500 transition-[width] duration-150 ease-out"
                  style={{ width: `${progress[i]}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
