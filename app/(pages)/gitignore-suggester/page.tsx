"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheckIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";
import {
  GITIGNORE_STACKS,
  mergeGitignoreStacks,
  type GitignoreStackId,
} from "@/lib/gitignore-by-stack";

export default function GitignoreSuggesterPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [selected, setSelected] = useState<Set<GitignoreStackId>>(new Set(["node", "nextjs"]));
  const [output, setOutput] = useState("");
  const [stackHint, setStackHint] = useState("");
  const [aiExtra, setAiExtra] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = (id: GitignoreStackId) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const ensureAuth = () => {
    if (status === "unauthenticated" || !session) {
      router.push(`/signup?callbackUrl=${encodeURIComponent(pathname || "/gitignore-suggester")}`);
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

  const handleBuild = () => {
    if (!ensureAuth()) return;
    setError(null);
    const ids = [...selected];
    if (ids.length === 0) {
      setError("Pick at least one stack.");
      return;
    }
    setOutput(mergeGitignoreStacks(ids));
  };

  const handleAiSuggest = async () => {
    if (!ensureAuth()) return;
    const hint = stackHint.trim() || [...selected].join(", ");
    if (!hint) {
      setError("Describe your stack or select templates first.");
      return;
    }
    setAiLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/gitignore-ai-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stack: hint,
          existing: output || mergeGitignoreStacks([...selected]),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "AI suggestion failed");
        return;
      }
      if (data.text) setAiExtra(String(data.text));
    } catch {
      setError("Something went wrong.");
    } finally {
      setAiLoading(false);
    }
  };

  const copy = (text: string) => {
    if (!text) return;
    void navigator.clipboard.writeText(text);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
            <ShieldCheckIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">.gitignore by stack</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Merge curated rules per stack; optionally ask AI for extra patterns.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Stacks</p>
            <div className="flex flex-wrap gap-2">
              {GITIGNORE_STACKS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggle(s.id)}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium border transition-colors ${
                    selected.has(s.id)
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200"
                      : "border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-600"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <Button type="button" onClick={handleBuild}>
              Build .gitignore
            </Button>
          </div>
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

          {output && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Output</label>
                <Button type="button" variant="outline" size="sm" onClick={() => copy(output)}>
                  Copy
                </Button>
              </div>
              <pre className="w-full min-h-[160px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 font-mono text-sm overflow-x-auto whitespace-pre-wrap">
                {output}
              </pre>
            </div>
          )}

          <div className="border-t border-slate-200 dark:border-slate-700 pt-6 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              <SparklesIcon className="size-5 text-violet-500" />
              Optional AI extras
            </div>
            <Input
              value={stackHint}
              onChange={(e) => setStackHint(e.target.value)}
              placeholder="e.g. Node 22 + Prisma + Docker Compose (refines AI context)"
            />
            <Button type="button" variant="secondary" onClick={handleAiSuggest} disabled={aiLoading} className="gap-2">
              {aiLoading ? <Loader2 className="size-4 animate-spin" /> : <SparklesIcon className="size-4" />}
              Suggest more lines (AI)
            </Button>
            {aiExtra && (
              <div>
                <div className="flex justify-end mb-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => copy(aiExtra)}>
                    Copy AI block
                  </Button>
                </div>
                <pre className="w-full min-h-[100px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 font-mono text-sm overflow-x-auto whitespace-pre-wrap">
                  {aiExtra}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
