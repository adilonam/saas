"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MagnifyingGlassIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";

const FLAVORS = ["JavaScript", "PCRE", "Python", "Go", ".NET"];

export default function RegexPlainEnglishPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [pattern, setPattern] = useState("^https?://[^\\s]+$");
  const [flavor, setFlavor] = useState("JavaScript");
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ensureAuth = () => {
    if (status === "unauthenticated" || !session) {
      router.push(`/signup?callbackUrl=${encodeURIComponent(pathname || "/regex-plain-english")}`);
      return false;
    }
    const hasActiveSubscription =
      session.user.subscriptionExpiresAt &&
      new Date(session.user.subscriptionExpiresAt) > new Date();
    if (!hasActiveSubscription) {
      router.push("/pricing");
      return false;
    }
    return true;
  };

  const handleExplain = async () => {
    if (!ensureAuth()) return;
    const p = pattern.trim();
    if (!p) {
      setError("Enter a regex pattern.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/regex-plain-english", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pattern: p, flavor }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Request failed");
        return;
      }
      setExplanation(String(data.text || ""));
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600">
            <MagnifyingGlassIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Regex plain-English explainer</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Optional AI walks through your pattern; pick a regex flavor for context.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-5">
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">Flavor</label>
            <select
              value={flavor}
              onChange={(e) => setFlavor(e.target.value)}
              className="w-full max-w-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
            >
              {FLAVORS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">Pattern</label>
            <Input value={pattern} onChange={(e) => setPattern(e.target.value)} className="font-mono text-sm" spellCheck={false} />
          </div>
          <Button type="button" onClick={handleExplain} disabled={loading} className="gap-2">
            {loading ? <Loader2 className="size-4 animate-spin" /> : <SparklesIcon className="size-4" />}
            Explain with AI
          </Button>
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          {explanation && (
            <div>
              <div className="flex justify-end mb-2">
                <Button type="button" variant="outline" size="sm" onClick={() => void navigator.clipboard.writeText(explanation)}>
                  Copy
                </Button>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 text-sm whitespace-pre-wrap leading-relaxed">
                {explanation}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
