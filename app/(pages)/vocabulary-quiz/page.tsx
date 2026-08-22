"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { BookOpenIcon } from "@heroicons/react/24/outline";
import { extractVocabularyWords } from "@/lib/study-meeting-utils";
import { Loader2 } from "lucide-react";

export default function VocabularyQuizPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [text, setText] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [words, setWords] = useState<string[]>([]);
  const [defs, setDefs] = useState<Record<string, string>>({});
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [idx, setIdx] = useState(0);
  const [choices, setChoices] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);

  const gate = () => {
    if (status === "unauthenticated" || !session) {
      router.push(`/signup?callbackUrl=${encodeURIComponent(pathname || "/vocabulary-quiz")}`);
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
    if (!gate()) return;
    const w = extractVocabularyWords(text, 32);
    setWords(w);
    setDefs({});
    setIdx(0);
    setChoices([]);
    setFeedback(null);
    setUnlocked(true);
    setAiError(null);
  };

  const buildChoicesForIndex = (list: string[], i: number, definitions: Record<string, string>) => {
    const target = list[i];
    const correct = definitions[target];
    if (!correct) return;
    const pool = list.filter((x) => x !== target).sort(() => Math.random() - 0.5).slice(0, 3);
    const wrongDefs = pool.map((x) => definitions[x]).filter(Boolean);
    while (wrongDefs.length < 3) {
      wrongDefs.push("A related concept from another field.");
    }
    const opts = [correct, ...wrongDefs.slice(0, 3)].sort(() => Math.random() - 0.5);
    setChoices(opts);
    setFeedback(null);
  };

  const loadAi = async () => {
    if (!gate() || words.length === 0) return;
    setLoadingAi(true);
    setAiError(null);
    try {
      const res = await fetch("/api/vocabulary-definitions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ words }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAiError(data.error || "Could not load definitions.");
        return;
      }
      const json = data.json as { definitions?: Record<string, string> };
      const d = json?.definitions && typeof json.definitions === "object" ? json.definitions : {};
      setDefs(d);
      buildChoicesForIndex(words, 0, d);
      setIdx(0);
    } catch {
      setAiError("Request failed.");
    } finally {
      setLoadingAi(false);
    }
  };

  const currentWord = words[idx] ?? null;

  const handleAnswer = (opt: string) => {
    const correct = defs[currentWord!];
    setFeedback(opt === correct ? "Correct." : `Not quite — meant: ${correct}`);
  };

  const nextCard = () => {
    if (words.length === 0) return;
    const ni = (idx + 1) % words.length;
    setIdx(ni);
    setFeedback(null);
    if (Object.keys(defs).length) buildChoicesForIndex(words, ni, defs);
    else setChoices([]);
  };

  const hasQuiz = choices.length > 0 && currentWord;

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
            <BookOpenIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Vocabulary quiz</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Words from pasted text; optional AI definitions for multiple choice
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="vq-text">Source text</Label>
            <textarea
              id="vq-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full min-h-[140px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 text-sm"
              placeholder="Paste an article or notes…"
              spellCheck={false}
            />
          </div>
          <Button type="button" onClick={handleBuild}>
            Build word list
          </Button>

          {unlocked && (
            <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {words.length === 0
                  ? "No suitable words found (try longer text with varied vocabulary)."
                  : `${words.length} words selected.`}
              </p>
              {words.length > 0 && (
                <>
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" onClick={loadAi} disabled={loadingAi}>
                      {loadingAi && <Loader2 className="size-4 animate-spin mr-2" />}
                      Load AI definitions
                    </Button>
                    <Button type="button" variant="ghost" onClick={nextCard} disabled={!words.length}>
                      Next word
                    </Button>
                  </div>
                  {aiError && <p className="text-sm text-rose-600">{aiError}</p>}
                  {currentWord && (
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">
                      Word: <span className="text-cyan-600 dark:text-cyan-400">{currentWord}</span>
                    </p>
                  )}
                  {hasQuiz && (
                    <div className="space-y-2">
                      <p className="text-sm text-slate-500">Pick the best definition:</p>
                      <div className="grid gap-2">
                        {choices.map((c) => (
                          <Button
                            key={c.slice(0, 40)}
                            type="button"
                            variant="outline"
                            className="justify-start text-left h-auto py-3 whitespace-normal"
                            onClick={() => handleAnswer(c)}
                          >
                            {c}
                          </Button>
                        ))}
                      </div>
                      {feedback && <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{feedback}</p>}
                    </div>
                  )}
                  {words.length > 0 && Object.keys(defs).length === 0 && !loadingAi && (
                    <p className="text-xs text-slate-500">
                      Load AI definitions to enable multiple choice. Words are filtered (length ≥ 5, common stopwords
                      removed).
                    </p>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
