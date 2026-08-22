"use client";

import { useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useSubscribedToolAccess } from "@/hooks/useSubscribedToolAccess";
import {
  normalizeStackTrace,
  type StackTraceNormalizeOptions,
} from "@/lib/stack-trace-normalize";
import { CommandLineIcon } from "@heroicons/react/24/outline";

const defaultSample = `Error: boom
    at foo (/app/node_modules/pkg/lib.js:12:3)
    at foo (/app/node_modules/pkg/lib.js:12:3)
    at foo (/app/node_modules/pkg/lib.js:12:3)
    at bar (/srv/src/handler.ts:45:10)`;

export default function StackTraceNormalizerPage() {
  const { assertAccess } = useSubscribedToolAccess("/stack-trace-normalizer");
  const [input, setInput] = useState(defaultSample);
  const [output, setOutput] = useState("");
  const [opts, setOpts] = useState<StackTraceNormalizeOptions>({
    foldDuplicates: true,
    stripAbsolutePaths: true,
    stripLineNumbers: false,
  });

  const handleNormalize = () => {
    if (!assertAccess()) return;
    setOutput(
      normalizeStackTrace(input, {
        foldDuplicates: opts.foldDuplicates,
        stripAbsolutePaths: opts.stripAbsolutePaths,
        stripLineNumbers: opts.stripLineNumbers,
      }),
    );
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">
            <CommandLineIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Stack trace normalizer
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Fold duplicate frames, shorten absolute paths, and tidy noisy logs.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="trace">Stack trace</Label>
            <textarea
              id="trace"
              className="w-full min-h-[200px] rounded-xl border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>

          <fieldset className="space-y-3">
            <legend className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Options
            </legend>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={opts.foldDuplicates}
                onChange={(e) =>
                  setOpts((o) => ({ ...o, foldDuplicates: e.target.checked }))
                }
                className="rounded border-slate-300"
              />
              Fold consecutive duplicate lines
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={opts.stripAbsolutePaths}
                onChange={(e) =>
                  setOpts((o) => ({
                    ...o,
                    stripAbsolutePaths: e.target.checked,
                  }))
                }
                className="rounded border-slate-300"
              />
              Shorten absolute paths to file names (common source extensions)
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={opts.stripLineNumbers}
                onChange={(e) =>
                  setOpts((o) => ({ ...o, stripLineNumbers: e.target.checked }))
                }
                className="rounded border-slate-300"
              />
              Strip :line:column markers
            </label>
          </fieldset>

          <Button type="button" onClick={handleNormalize} className="gap-2">
            <CommandLineIcon className="size-4" />
            Normalize
          </Button>

          {output && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-2">
              <Label>Result</Label>
              <pre className="rounded-xl bg-slate-900 text-slate-100 p-4 text-xs overflow-auto max-h-96 font-mono whitespace-pre-wrap">
                {output}
              </pre>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
