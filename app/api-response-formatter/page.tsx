"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { CodeBracketSquareIcon } from "@heroicons/react/24/outline";

export default function ApiResponseFormatterPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [rawInput, setRawInput] = useState('{"name":"API","version":1}');
  const [formatted, setFormatted] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleFormat = () => {
    if (status === "unauthenticated" || !session) {
      router.push(`/signup?callbackUrl=${encodeURIComponent(pathname || "/api-response-formatter")}`);
      return;
    }
    const hasActiveSubscription =
      session.user.subscriptionExpiresAt &&
      new Date(session.user.subscriptionExpiresAt) > new Date();
    if (!hasActiveSubscription) {
      router.push("/pricing");
      return;
    }
    setError(null);
    try {
      const parsed = JSON.parse(rawInput);
      setFormatted(JSON.stringify(parsed, null, 2));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON");
    }
  };

  const handleMinify = () => {
    if (status === "unauthenticated" || !session) {
      router.push(`/signup?callbackUrl=${encodeURIComponent(pathname || "/api-response-formatter")}`);
      return;
    }
    const hasActiveSubscription =
      session.user.subscriptionExpiresAt &&
      new Date(session.user.subscriptionExpiresAt) > new Date();
    if (!hasActiveSubscription) {
      router.push("/pricing");
      return;
    }
    setError(null);
    try {
      const parsed = JSON.parse(rawInput);
      setFormatted(JSON.stringify(parsed));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON");
    }
  };

  const handleCopy = () => {
    if (!formatted) return;
    navigator.clipboard.writeText(formatted);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600">
            <CodeBracketSquareIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">API Response Formatter</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Format or minify JSON (pretty-print or compact)
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">JSON input</label>
            <textarea
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              className="w-full min-h-[200px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 font-mono text-sm"
              placeholder='Paste API response or JSON...'
              spellCheck={false}
            />
          </div>
          <div className="flex gap-4 flex-wrap">
            <Button onClick={handleFormat} className="gap-2">
              <CodeBracketSquareIcon className="h-4 w-4" />
              Format (pretty)
            </Button>
            <Button variant="outline" onClick={handleMinify} className="gap-2">
              Minify
            </Button>
          </div>
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
          {formatted && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Output</label>
                <Button variant="outline" size="sm" onClick={handleCopy}>Copy</Button>
              </div>
              <pre className="w-full min-h-[120px] max-h-[400px] overflow-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 font-mono text-sm whitespace-pre-wrap break-all">
                {formatted}
              </pre>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
