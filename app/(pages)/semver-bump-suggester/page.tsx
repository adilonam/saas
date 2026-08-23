"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TagIcon } from "@heroicons/react/24/outline";
import { parseConventionalBlock, suggestSemverBump } from "@/lib/conventional-commits";

export default function SemverBumpSuggesterPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [current, setCurrent] = useState("1.4.2");
  const [commits, setCommits] = useState("feat(api): add filters\nfix: null guard on totals");
  const [result, setResult] = useState<ReturnType<typeof suggestSemverBump>>(null);
  const [error, setError] = useState<string | null>(null);

  const ensureAuth = () => {
    if (status === "unauthenticated" || !session) {
      router.push(`/signup?callbackUrl=${encodeURIComponent(pathname || "/semver-bump-suggester")}`);
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

  const handleSuggest = () => {
    if (!ensureAuth()) return;
    setError(null);
    const parsed = parseConventionalBlock(commits);
    const suggestion = suggestSemverBump(current, parsed);
    if (!suggestion) {
      setError("Current version must look like semver: MAJOR.MINOR.PATCH (optional pre-release/build).");
      setResult(null);
      return;
    }
    setResult(suggestion);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600">
            <TagIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Semantic version bump suggester</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Heuristic from Conventional Commits: breaking → major, feat → minor, else patch.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-5">
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">Current version</label>
            <Input value={current} onChange={(e) => setCurrent(e.target.value)} placeholder="1.0.0" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">Commits since last tag (one header per line)</label>
            <textarea
              value={commits}
              onChange={(e) => setCommits(e.target.value)}
              className="w-full min-h-[180px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 font-mono text-sm"
              spellCheck={false}
            />
          </div>
          <Button type="button" onClick={handleSuggest}>
            Suggest next version
          </Button>
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          {result && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 space-y-2 text-sm">
              <p>
                <span className="text-slate-500">Current:</span>{" "}
                <code className="font-mono">{result.current}</code>
              </p>
              <p>
                <span className="text-slate-500">Suggested:</span>{" "}
                <code className="font-mono text-lg font-semibold text-emerald-600 dark:text-emerald-400">{result.suggested}</code>{" "}
                <span className="text-slate-400">({result.bump})</span>
              </p>
              <p className="text-slate-600 dark:text-slate-300">{result.summary}</p>
              {Object.keys(result.counts).length > 0 && (
                <p className="text-slate-500 font-mono text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                  Types: {Object.entries(result.counts).map(([k, v]) => `${k}:${v}`).join("  ")}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
