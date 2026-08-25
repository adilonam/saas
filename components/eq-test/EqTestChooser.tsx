"use client";

import { ArrowPathIcon, DocumentTextIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";

type EqTestChooserProps = {
  statusLabel: string;
  updatedAtLabel: string;
  onViewLast: () => void;
  onStartNew: () => void;
};

export function EqTestChooser({
  statusLabel,
  updatedAtLabel,
  onViewLast,
  onStartNew,
}: EqTestChooserProps) {
  return (
    <div className="mx-auto w-full min-w-0 max-w-lg text-center">
      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-8 shadow-sm sm:rounded-3xl sm:px-6 sm:py-10 dark:border-slate-700 dark:bg-slate-900">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">
          Welcome back
        </h1>
        <p className="mt-3 text-sm text-pretty text-slate-600 sm:text-base dark:text-slate-300">
          We saved your last EQ test so you can pick up where you left off or
          start fresh.
        </p>
        <p className="mt-4 break-words text-sm text-slate-500 dark:text-slate-400">
          Last attempt: {statusLabel}
          {updatedAtLabel ? ` · ${updatedAtLabel}` : ""}
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <Button
            className="h-12 w-full bg-emerald-600 hover:bg-emerald-700"
            size="lg"
            onClick={onViewLast}
          >
            <DocumentTextIcon className="mr-2 size-5 shrink-0" />
            View last test
          </Button>
          <Button
            variant="outline"
            className="h-12 w-full"
            size="lg"
            onClick={onStartNew}
          >
            <ArrowPathIcon className="mr-2 size-5 shrink-0" />
            Start new test
          </Button>
        </div>
      </div>
    </div>
  );
}
