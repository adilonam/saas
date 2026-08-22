"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatBubbleBottomCenterTextIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";

const LANGS = ["TypeScript", "JavaScript", "Python", "Go", "Rust", "Java", "CSS", "SQL", "C#"];

export default function CodeCommentExpanderPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [language, setLanguage] = useState("TypeScript");
  const [line, setLine] = useState("// retry with backoff");
  const [expanded, setExpanded] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ensureAuth = () => {
    if (status === "unauthenticated" || !session) {
      router.push(`/signup?callbackUrl=${encodeURIComponent(pathname || "/code-comment-expander")}`);
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

  const handleExpand = async () => {
    if (!ensureAuth()) return;
    const t = line.trim();
    if (!t) {
      setError("Enter a one-line comment.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/code-comment-expander", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ line: t, language }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Request failed");
        return;
      }
      setExpanded(String(data.text || ""));
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
          <div className="size-12 rounded-2xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600">
            <ChatBubbleBottomCenterTextIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Code comment expander</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Optional AI expands a single-line comment into a short block comment for your language.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-5">
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full max-w-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
            >
              {LANGS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">One-line comment</label>
            <Input value={line} onChange={(e) => setLine(e.target.value)} className="font-mono text-sm" />
          </div>
          <Button type="button" onClick={handleExpand} disabled={loading} className="gap-2">
            {loading ? <Loader2 className="size-4 animate-spin" /> : <SparklesIcon className="size-4" />}
            Expand with AI
          </Button>
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          {expanded && (
            <div>
              <div className="flex justify-end mb-2">
                <Button type="button" variant="outline" size="sm" onClick={() => void navigator.clipboard.writeText(expanded)}>
                  Copy
                </Button>
              </div>
              <pre className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 font-mono text-sm whitespace-pre-wrap">
                {expanded}
              </pre>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
