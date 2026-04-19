"use client";

import { useMemo, useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { BookOpenIcon } from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";
import { useToolAccess } from "@/lib/use-tool-access";
import { analyzeReadingLevel } from "@/lib/reading-level";

function freLabel(fre: number | null): string {
  if (fre == null) return "Add a bit more text for a stable score.";
  if (fre >= 90) return "Very easy (5th grade)";
  if (fre >= 80) return "Easy (6th grade)";
  if (fre >= 70) return "Fairly easy (7th grade)";
  if (fre >= 60) return "Standard (8th–9th grade)";
  if (fre >= 50) return "Fairly difficult (10th–12th)";
  if (fre >= 30) return "Difficult (college)";
  return "Very difficult (graduate)";
}

export default function ReadingLevelEstimatorPage() {
  const { ensureAccess } = useToolAccess();
  const [text, setText] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [coach, setCoach] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const stats = useMemo(() => analyzeReadingLevel(text), [text]);
  const statsSummary = useMemo(() => {
    const lines = [
      `words: ${stats.words}`,
      `sentences: ${stats.sentences}`,
      `syllables (est.): ${stats.syllables}`,
      `avg words/sentence: ${stats.avgWordsPerSentence.toFixed(1)}`,
      `avg syllables/word: ${stats.avgSyllablesPerWord.toFixed(2)}`,
    ];
    if (stats.fleschReadingEase != null) {
      lines.push(`Flesch Reading Ease: ${stats.fleschReadingEase.toFixed(1)}`);
    }
    if (stats.fleschKincaidGrade != null) {
      lines.push(`Flesch–Kincaid grade (approx): ${stats.fleschKincaidGrade.toFixed(1)}`);
    }
    return lines.join("\n");
  }, [stats]);

  const run = () => {
    if (!ensureAccess()) return;
    if (!text.trim()) return;
    setUnlocked(true);
    setCoach("");
    setErr(null);
  };

  const runCoach = async () => {
    if (!ensureAccess()) return;
    const t = text.trim();
    if (!t) return;
    setLoading(true);
    setErr(null);
    setCoach("");
    try {
      const res = await fetch("/api/reading-level-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: t, stats: statsSummary }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.code === "subscription_required") return;
        setErr(data.error || "Coach request failed.");
        return;
      }
      setCoach(data.text ?? "");
    } catch {
      setErr("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-start gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30">
            <BookOpenIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Reading level estimator</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Syllable heuristics and Flesch-style scores for drafts; optional AI coaching.
            </p>
          </div>
        </div>

        <div className="space-y-2 rounded-xl border border-input bg-card p-6">
          <Label htmlFor="body">Text</Label>
          <textarea
            id="body"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[200px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            placeholder="Paste article, email, or help copy…"
          />
          <Button type="button" onClick={run}>
            Estimate reading level
          </Button>
        </div>

        {unlocked && (
          <div className="space-y-4 rounded-xl border border-input bg-muted/30 p-6 text-sm">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-background p-4">
                <p className="text-muted-foreground">Words</p>
                <p className="text-2xl font-semibold text-foreground">{stats.words}</p>
              </div>
              <div className="rounded-lg border border-border bg-background p-4">
                <p className="text-muted-foreground">Sentences</p>
                <p className="text-2xl font-semibold text-foreground">{stats.sentences}</p>
              </div>
              <div className="rounded-lg border border-border bg-background p-4">
                <p className="text-muted-foreground">Syllables (est.)</p>
                <p className="text-2xl font-semibold text-foreground">{stats.syllables}</p>
              </div>
              <div className="rounded-lg border border-border bg-background p-4">
                <p className="text-muted-foreground">Avg words / sentence</p>
                <p className="text-2xl font-semibold text-foreground">
                  {stats.avgWordsPerSentence.toFixed(1)}
                </p>
              </div>
            </div>
            {stats.fleschReadingEase != null && (
              <div className="rounded-lg border border-border bg-background p-4">
                <p className="font-medium text-foreground">Flesch Reading Ease</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums">
                  {stats.fleschReadingEase.toFixed(1)}
                </p>
                <p className="mt-1 text-muted-foreground">{freLabel(stats.fleschReadingEase)}</p>
              </div>
            )}
            {stats.fleschKincaidGrade != null && (
              <p className="text-muted-foreground">
                Approx. grade level (Flesch–Kincaid):{" "}
                <span className="font-medium text-foreground">
                  {stats.fleschKincaidGrade.toFixed(1)}
                </span>
              </p>
            )}

            <div className="border-t border-border pt-4">
              <Button type="button" variant="secondary" onClick={runCoach} disabled={loading} className="gap-2">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Coaching…
                  </>
                ) : (
                  "Optional AI coach"
                )}
              </Button>
              {err && (
                <p className="mt-2 text-destructive" role="alert">
                  {err}
                </p>
              )}
              {coach && (
                <div className="mt-3 whitespace-pre-wrap rounded-lg border border-input bg-background p-4 text-foreground">
                  {coach}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
