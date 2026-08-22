"use client";

import { useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useSubscribedToolAccess } from "@/hooks/useSubscribedToolAccess";
import { prettifyPem } from "@/lib/pem-prettify";
import { DocumentTextIcon } from "@heroicons/react/24/outline";

export default function PemPrettifierPage() {
  const { assertAccess } = useSubscribedToolAccess("/pem-prettifier");
  const [input, setInput] = useState(
    "-----BEGIN CERTIFICATE-----\nMIIBkTCB+wIJAKHhcg\n-----END CERTIFICATE-----",
  );
  const [output, setOutput] = useState("");

  const handlePrettify = () => {
    if (!assertAccess()) return;
    setOutput(prettifyPem(input));
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">
            <DocumentTextIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">PEM prettifier</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Normalize certificate and key blocks: trim headers, wrap Base64 at
              64 columns.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="pem">PEM text</Label>
            <textarea
              id="pem"
              className="w-full min-h-[200px] rounded-xl border border-input bg-background px-3 py-2 text-sm font-mono"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              spellCheck={false}
            />
          </div>

          <Button type="button" onClick={handlePrettify} className="gap-2">
            <DocumentTextIcon className="size-4" />
            Prettify
          </Button>

          {output && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-2">
              <Label>Result</Label>
              <pre className="rounded-xl bg-slate-900 text-slate-100 p-4 text-xs font-mono whitespace-pre-wrap break-all max-h-96 overflow-auto">
                {output}
              </pre>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
