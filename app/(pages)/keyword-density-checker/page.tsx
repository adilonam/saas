"use client";

import { useMemo, useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ChartBarIcon } from "@heroicons/react/24/outline";
import { keywordDensityPercent, tokenizeWords } from "@/lib/seo-tools";
import { useToolAccess } from "@/lib/use-tool-access";

export default function KeywordDensityCheckerPage() {
  const { ensureAccess } = useToolAccess();
  const [body, setBody] = useState("");
  const [keyword, setKeyword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const stats = useMemo(() => {
    if (!unlocked) return null;
    return keywordDensityPercent(body, keyword);
  }, [body, keyword, unlocked]);

  const topWords = useMemo(() => {
    if (!unlocked || !body.trim()) return [];
    const words = tokenizeWords(body);
    const freq = new Map<string, number>();
    for (const w of words) {
      if (w.length < 3) continue;
      freq.set(w, (freq.get(w) || 0) + 1);
    }
    return [...freq.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12);
  }, [body, unlocked]);

  const handleAnalyze = () => {
    if (!ensureAccess()) return;
    if (!body.trim()) {
      setFormError("Paste some content to analyze.");
      setUnlocked(false);
      return;
    }
    if (!keyword.trim()) {
      setFormError("Enter a focus keyword or phrase.");
      setUnlocked(false);
      return;
    }
    setFormError(null);
    setUnlocked(true);
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600">
            <ChartBarIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Keyword Density Checker</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Count how often a keyword appears relative to total words (phrase-aware)
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="kw-target">Focus keyword or phrase</Label>
            <Input
              id="kw-target"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="e.g. sustainability or content marketing"
              className="rounded-xl h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="kw-body">Content</Label>
            <textarea
              id="kw-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Paste your article or page copy..."
              className="w-full min-h-[200px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 text-sm"
            />
          </div>

          <Button onClick={handleAnalyze} className="gap-2">
            <ChartBarIcon className="size-4" />
            Analyze density
          </Button>

          {formError && (
            <p className="text-sm text-amber-600 dark:text-amber-400">{formError}</p>
          )}

          {unlocked && stats && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl border border-slate-200 dark:border-slate-600 p-4 bg-white dark:bg-slate-950">
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Occurrences</p>
                  <p className="text-2xl font-bold mt-1">{stats.occurrences}</p>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-slate-600 p-4 bg-white dark:bg-slate-950">
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Word count</p>
                  <p className="text-2xl font-bold mt-1">{stats.wordCount}</p>
                </div>
                <div className="rounded-xl border border-slate-200 dark:border-slate-600 p-4 bg-white dark:bg-slate-950">
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Density</p>
                  <p className="text-2xl font-bold mt-1">
                    {stats.wordCount ? stats.densityPercent.toFixed(2) : "0"}
                    %
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-500">
                Density is approximate (word tokens; punctuation removed). Use as a guide, not a ranking
                rule.
              </p>
              {topWords.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Frequent words (3+ chars, top 12)
                  </p>
                  <ul className="flex flex-wrap gap-2">
                    {topWords.map(([w, c]) => (
                      <li
                        key={w}
                        className="text-xs rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 font-mono"
                      >
                        {w}{" "}
                        <span className="text-slate-500">({c})</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
