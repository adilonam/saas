"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  DocumentTextIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { guardToolAccess } from "@/lib/guard-tool-access";

type Action = "beautify" | "minify";

export default function JsonMinifyBeautifyPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [text, setText] = useState("");
  const [action, setAction] = useState<Action>("beautify");
  const [output, setOutput] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApply = () => {
    if (!guardToolAccess(status, session, pathname, "/json-minify-beautify", router)) {
      return;
    }
    setError(null);
    try {
      const parsed = JSON.parse(text.trim());
      if (action === "beautify") {
        setOutput(JSON.stringify(parsed, null, 2));
      } else {
        setOutput(JSON.stringify(parsed));
      }
      setUnlocked(true);
    } catch {
      setError("Invalid JSON. Check commas, quotes, and brackets.");
      setOutput("");
      setUnlocked(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
            <DocumentTextIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">JSON Minify / Beautify</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Pretty-print or compact JSON in the browser.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-slate-900 dark:text-white mb-2">
              Action
            </legend>
            <div className="flex flex-wrap gap-4 text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="json-act"
                  checked={action === "beautify"}
                  onChange={() => {
                    setAction("beautify");
                    setUnlocked(false);
                  }}
                />
                Beautify (2-space indent)
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="json-act"
                  checked={action === "minify"}
                  onChange={() => {
                    setAction("minify");
                    setUnlocked(false);
                  }}
                />
                Minify (single line)
              </label>
            </div>
          </fieldset>

          <div className="space-y-2">
            <Label htmlFor="json-in">JSON</Label>
            <textarea
              id="json-in"
              className="w-full min-h-[180px] rounded-xl border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setUnlocked(false);
              }}
              placeholder='{"hello": "world"}'
            />
          </div>

          <Button onClick={handleApply} disabled={!text.trim()} className="gap-2">
            <DocumentTextIcon className="h-4 w-4" />
            Apply
          </Button>

          {error && (
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm">
              <ExclamationTriangleIcon className="size-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {unlocked && output !== "" && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-2">
              <Label>Result</Label>
              <pre className="rounded-xl bg-slate-900 text-slate-100 p-4 text-xs overflow-auto max-h-[min(400px,50vh)] font-mono whitespace-pre-wrap break-all">
                {output}
              </pre>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
