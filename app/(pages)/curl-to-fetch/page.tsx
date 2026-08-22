"use client";

import { useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useSubscribedToolAccess } from "@/hooks/useSubscribedToolAccess";
import { parseLooseCurl } from "@/lib/curl-parse";
import { snippetsFromParsed } from "@/lib/curl-snippets";
import { ArrowsRightLeftIcon } from "@heroicons/react/24/outline";

const sample = `curl -X POST https://api.example.com/v1/items \\
  -H "Authorization: Bearer token" \\
  -H "Content-Type: application/json" \\
  -d '{"name":"test"}'`;

type Tab = "fetch" | "fetchTs" | "axios" | "python";

export default function CurlToFetchPage() {
  const { assertAccess } = useSubscribedToolAccess("/curl-to-fetch");
  const [curl, setCurl] = useState(sample);
  const [tab, setTab] = useState<Tab>("fetch");
  const [error, setError] = useState<string | null>(null);
  const [snippets, setSnippets] = useState<ReturnType<
    typeof snippetsFromParsed
  > | null>(null);

  const handleConvert = () => {
    if (!assertAccess()) return;
    const parsed = parseLooseCurl(curl);
    if ("error" in parsed) {
      setError(parsed.error);
      setSnippets(null);
      return;
    }
    setError(null);
    setSnippets(snippetsFromParsed(parsed));
  };

  const active =
    snippets === null
      ? ""
      : tab === "fetch"
        ? snippets.fetchJs
        : tab === "fetchTs"
          ? snippets.fetchTs
          : tab === "axios"
            ? snippets.axios
            : snippets.pythonRequests;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600">
            <ArrowsRightLeftIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">cURL to snippets</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Turn a typical curl command into fetch, TypeScript fetch, axios, or
              Python requests.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="curl">cURL command</Label>
            <textarea
              id="curl"
              className="w-full min-h-[160px] rounded-xl border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={curl}
              onChange={(e) => setCurl(e.target.value)}
            />
          </div>

          <Button type="button" onClick={handleConvert} className="gap-2">
            <ArrowsRightLeftIcon className="size-4" />
            Convert
          </Button>

          {error && (
            <p className="text-sm text-amber-600 dark:text-amber-400">{error}</p>
          )}

          {snippets && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ["fetch", "JavaScript fetch"],
                    ["fetchTs", "TypeScript fetch"],
                    ["axios", "axios"],
                    ["python", "Python requests"],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setTab(id)}
                    className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                      tab === id
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                        : "bg-slate-200/80 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <pre className="rounded-xl bg-slate-900 text-slate-100 p-4 text-xs overflow-auto max-h-[420px] font-mono whitespace-pre-wrap">
                {active}
              </pre>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
