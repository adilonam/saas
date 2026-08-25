"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import EqTestAnalyzing from "@/components/eq-test/EqTestAnalyzing";
import { EqTestChooser } from "@/components/eq-test/EqTestChooser";
import EqTestQuiz, {
  EqTestConfirmation,
  EqTestIntro,
} from "@/components/eq-test/EqTestQuiz";
import EqTestResults from "@/components/eq-test/EqTestResults";
import { EQ_TEST_QUESTIONS, EQ_TEST_TOTAL } from "@/lib/eq-test/questions";
import { clientAnswersToSelected } from "@/lib/eq-test/scoring";
import type {
  EqAttemptPublic,
  EqAttemptStatus,
} from "@/lib/eq-test/attempts";
import type {
  EqTestAnswers,
  EqTestPhase,
  EqTestResult,
} from "@/lib/eq-test/types";
import { resolveStoredOrLatestAttempt } from "@/lib/resolve-test-attempt";
import {
  EQ_TEST_ATTEMPT_STORAGE_KEY,
  clearStoredAttemptId,
  getStoredAttemptId,
  setStoredAttemptId,
} from "@/lib/test-attempt-storage";
import { useToolAccess } from "@/lib/use-tool-access";
import { HeartIcon } from "@heroicons/react/24/outline";

type ScoreFetchResult =
  | { ok: true; result: EqTestResult }
  | { ok: false; status: number; code?: string };

function answerCount(answers: EqTestAnswers | null | undefined): number {
  return Object.keys(answers ?? {}).length;
}

async function fetchEqScore(
  answers: EqTestAnswers,
  elapsedSeconds: number,
  attemptId: string | null,
): Promise<ScoreFetchResult> {
  const res = await fetch("/api/eq-test/score", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      answers: clientAnswersToSelected(answers),
      elapsedSeconds,
      ...(attemptId ? { attemptId } : {}),
    }),
  });

  if (!res.ok) {
    let code: string | undefined;
    try {
      const data = (await res.json()) as { code?: string };
      code = data.code;
    } catch {
      /* ignore */
    }
    return { ok: false, status: res.status, code };
  }

  const data = (await res.json()) as EqTestResult & {
    attempt?: EqAttemptPublic;
  };
  const { attempt: _a, ...result } = data;
  return { ok: true, result };
}

async function saveAttempt(payload: {
  id?: string | null;
  answers: EqTestAnswers;
  elapsedSeconds: number;
  status: EqAttemptStatus;
  result?: EqTestResult | null;
}): Promise<EqAttemptPublic | null> {
  try {
    const res = await fetch("/api/eq-test/attempts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        ...(payload.id ? { id: payload.id } : {}),
        answers: payload.answers,
        elapsedSeconds: payload.elapsedSeconds,
        status: payload.status,
        ...(payload.result ? { result: payload.result } : {}),
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { attempt: EqAttemptPublic };
    if (data.attempt?.id) {
      setStoredAttemptId(EQ_TEST_ATTEMPT_STORAGE_KEY, data.attempt.id);
    }
    return data.attempt;
  } catch {
    return null;
  }
}

function statusLabel(status: string): string {
  if (status === "scored") return "scored report ready";
  if (status === "completed") return "completed — awaiting unlock";
  return "in progress";
}

export default function EqTestPage() {
  const { ensureAccess, session, status } = useToolAccess();
  const [phase, setPhase] = useState<EqTestPhase>("intro");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<EqTestAnswers>({});
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [result, setResult] = useState<EqTestResult | null>(null);
  const [scoreError, setScoreError] = useState<string | null>(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [scoring, setScoring] = useState(false);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [latestAttempt, setLatestAttempt] = useState<EqAttemptPublic | null>(
    null,
  );
  const [bootstrapping, setBootstrapping] = useState(true);

  const hasAccess = useMemo(() => {
    if (status !== "authenticated" || !session) return false;
    return (
      !!session.user.subscriptionExpiresAt &&
      new Date(session.user.subscriptionExpiresAt) > new Date()
    );
  }, [session, status]);

  // Prefer localStorage attempt (claim on login), else latest DB, else start UI.
  useEffect(() => {
    if (status === "loading") return;

    let cancelled = false;

    (async () => {
      try {
        const storedId = getStoredAttemptId(EQ_TEST_ATTEMPT_STORAGE_KEY);
        const attempt = await resolveStoredOrLatestAttempt<EqAttemptPublic>({
          storageKey: EQ_TEST_ATTEMPT_STORAGE_KEY,
          authenticated: status === "authenticated",
          attachUrl: "/api/eq-test/attempts/attach",
          latestUrl: "/api/eq-test/attempts/latest",
          attemptUrl: (id) => `/api/eq-test/attempts/${id}`,
        });
        if (cancelled || !attempt) return;

        setLatestAttempt(attempt);

        if (storedId && attempt.id === storedId) {
          setAttemptId(attempt.id);
          setAnswers(attempt.answers ?? {});
          setElapsedSeconds(attempt.elapsedSeconds ?? 0);
          setScoreError(null);
          setTimerRunning(false);

          if (attempt.status === "in_progress") {
            setResult(attempt.result);
            const answered = answerCount(attempt.answers);
            const idx = Math.min(answered, EQ_TEST_TOTAL - 1);
            setQuestionIndex(Math.max(0, idx));
            setPhase("quiz");
            setTimerRunning(true);
            return;
          }

          // Subscribed but empty/legacy attempt: don't trap on a dead results wall.
          if (
            hasAccess &&
            !attempt.result &&
            answerCount(attempt.answers) === 0
          ) {
            clearStoredAttemptId(EQ_TEST_ATTEMPT_STORAGE_KEY);
            setAttemptId(null);
            setResult(null);
            setPhase("chooser");
            return;
          }

          // Soft paywall: only show score when unlocked; auto-score if subscribed.
          setResult(hasAccess ? attempt.result : null);
          setPhase("results");

          if (
            hasAccess &&
            !attempt.result &&
            attempt.status === "completed" &&
            answerCount(attempt.answers) > 0
          ) {
            setScoring(true);
            try {
              const scored = await fetchEqScore(
                attempt.answers,
                attempt.elapsedSeconds,
                attempt.id,
              );
              if (cancelled) return;
              if (scored.ok === true) {
                setResult(scored.result);
              } else {
                setScoreError(
                  "Could not calculate your score. Please try again.",
                );
              }
            } finally {
              if (!cancelled) setScoring(false);
            }
          }
        } else {
          setPhase("chooser");
        }
      } catch {
        /* ignore bootstrap errors */
      } finally {
        if (!cancelled) setBootstrapping(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // Re-bootstrap on auth status only (login / logout / session ready).
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hasAccess read when status settles
  }, [status]);

  useEffect(() => {
    if (!timerRunning) return;
    const id = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [timerRunning]);

  const resetToIntro = () => {
    clearStoredAttemptId(EQ_TEST_ATTEMPT_STORAGE_KEY);
    setAttemptId(null);
    setLatestAttempt(null);
    setPhase("intro");
    setQuestionIndex(0);
    setAnswers({});
    setElapsedSeconds(0);
    setResult(null);
    setScoreError(null);
    setTimerRunning(false);
  };

  const handleStart = () => {
    clearStoredAttemptId(EQ_TEST_ATTEMPT_STORAGE_KEY);
    setAttemptId(null);
    setPhase("quiz");
    setQuestionIndex(0);
    setAnswers({});
    setElapsedSeconds(0);
    setResult(null);
    setScoreError(null);
    setTimerRunning(true);
  };

  const applyAttempt = async (attempt: EqAttemptPublic) => {
    setAttemptId(attempt.id);
    setAnswers(attempt.answers ?? {});
    setElapsedSeconds(attempt.elapsedSeconds ?? 0);
    setScoreError(null);
    setTimerRunning(false);

    if (attempt.status === "in_progress") {
      setResult(attempt.result);
      const answered = answerCount(attempt.answers);
      const idx = Math.min(answered, EQ_TEST_TOTAL - 1);
      setQuestionIndex(Math.max(0, idx));
      setPhase("quiz");
      setTimerRunning(true);
      return;
    }

    // Empty attempt (no score, no answers): clear restore id and offer a new test.
    if (hasAccess && !attempt.result && answerCount(attempt.answers) === 0) {
      clearStoredAttemptId(EQ_TEST_ATTEMPT_STORAGE_KEY);
      setAttemptId(null);
      setResult(null);
      setScoreError(
        "This attempt has no saved report. Please start a new test.",
      );
      setPhase("results");
      return;
    }

    setResult(hasAccess ? attempt.result : null);
    setPhase("results");

    if (
      hasAccess &&
      !attempt.result &&
      attempt.status === "completed" &&
      answerCount(attempt.answers) > 0
    ) {
      setScoring(true);
      try {
        const scored = await fetchEqScore(
          attempt.answers,
          attempt.elapsedSeconds,
          attempt.id,
        );
        if (scored.ok === true) {
          setResult(scored.result);
        } else {
          setScoreError("Could not calculate your score. Please try again.");
        }
      } finally {
        setScoring(false);
      }
    }
  };

  const handleViewLast = () => {
    if (!latestAttempt) return;
    // Empty scored/completed attempt: skip the dead wall — start a new test.
    if (
      hasAccess &&
      !latestAttempt.result &&
      answerCount(latestAttempt.answers) === 0 &&
      (latestAttempt.status === "completed" ||
        latestAttempt.status === "scored")
    ) {
      resetToIntro();
      return;
    }
    void applyAttempt(latestAttempt);
  };

  const handleStartNew = () => {
    resetToIntro();
  };

  const advance = useCallback((fromIndex: number) => {
    if (fromIndex + 1 >= EQ_TEST_TOTAL) {
      setTimerRunning(false);
      setPhase("confirmation");
    } else {
      setQuestionIndex(fromIndex + 1);
    }
  }, []);

  const handleAnswer = (questionId: string, value: number | string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    window.setTimeout(() => advance(questionIndex), 280);
  };

  const handleContinueCheckpoint = () => {
    advance(questionIndex);
  };

  const handleBack = () => {
    if (questionIndex > 0) setQuestionIndex((i) => i - 1);
  };

  const handleGetResults = async () => {
    const saved = await saveAttempt({
      id: attemptId,
      answers,
      elapsedSeconds,
      status: "completed",
    });
    if (saved) {
      setAttemptId(saved.id);
      setLatestAttempt(saved);
    }
    setPhase("analyzing");
  };

  const handleAnalyzingComplete = useCallback(async () => {
    setScoring(true);
    setScoreError(null);
    try {
      let id = attemptId;
      if (!id) {
        const saved = await saveAttempt({
          answers,
          elapsedSeconds,
          status: "completed",
        });
        if (saved) {
          id = saved.id;
          setAttemptId(saved.id);
          setLatestAttempt(saved);
        }
      }

      if (!hasAccess) {
        setResult(null);
        setPhase("results");
        return;
      }

      const scored = await fetchEqScore(answers, elapsedSeconds, id);
      if (scored.ok === true) {
        setResult(scored.result);
        if (id) {
          await saveAttempt({
            id,
            answers,
            elapsedSeconds,
            status: "scored",
            result: scored.result,
          });
        }
      } else {
        const gate =
          scored.status === 401 ||
          scored.status === 403 ||
          scored.code === "subscription_required";
        if (!gate) {
          setScoreError("Could not calculate your score. Please try again.");
        }
        setResult(null);
      }
      setPhase("results");
    } finally {
      setScoring(false);
    }
  }, [answers, attemptId, elapsedSeconds, hasAccess]);

  const handleUnlock = async () => {
    if (!ensureAccess()) return;
    setScoring(true);
    setScoreError(null);
    try {
      // Already scored in UI (e.g. race) or restored from attempt
      if (result) {
        setPhase("results");
        return;
      }
      if (latestAttempt?.result) {
        setResult(latestAttempt.result);
        setPhase("results");
        return;
      }

      let id = attemptId ?? latestAttempt?.id ?? null;
      let answersToScore = answers;
      let elapsed = elapsedSeconds;

      // Refetch attempt in case attach/bootstrap raced ahead of local state
      if (id) {
        const res = await fetch(`/api/eq-test/attempts/${id}`, {
          credentials: "include",
        }).catch(() => null);
        if (res?.ok) {
          const data = (await res.json()) as { attempt?: EqAttemptPublic };
          if (data.attempt?.result) {
            setLatestAttempt(data.attempt);
            setResult(data.attempt.result);
            setPhase("results");
            return;
          }
          if (data.attempt && answerCount(answersToScore) === 0) {
            answersToScore = data.attempt.answers ?? {};
            elapsed = data.attempt.elapsedSeconds ?? 0;
            setAnswers(answersToScore);
            setElapsedSeconds(elapsed);
            setLatestAttempt(data.attempt);
          }
        }
      }

      if (answerCount(answersToScore) === 0) {
        // No scoreable answers — clear stale id so Retry / Start new works.
        clearStoredAttemptId(EQ_TEST_ATTEMPT_STORAGE_KEY);
        setAttemptId(null);
        setScoreError(
          "This attempt has no saved report. Please start a new test.",
        );
        setPhase("results");
        return;
      }

      if (!id) {
        const saved = await saveAttempt({
          answers: answersToScore,
          elapsedSeconds: elapsed,
          status: "completed",
        });
        if (saved) {
          id = saved.id;
          setAttemptId(saved.id);
          setLatestAttempt(saved);
        }
      }

      const scored = await fetchEqScore(answersToScore, elapsed, id);
      if (scored.ok === true) {
        setResult(scored.result);
      } else {
        const gate =
          scored.status === 401 ||
          scored.status === 403 ||
          scored.code === "subscription_required";
        if (!gate) {
          setScoreError("Could not unlock your report. Please try again.");
        }
        setResult(null);
      }
    } finally {
      setScoring(false);
    }
  };

  const handleEdit = () => {
    setPhase("quiz");
    setQuestionIndex(EQ_TEST_TOTAL - 1);
    setTimerRunning(true);
  };

  const currentQuestion = EQ_TEST_QUESTIONS[questionIndex];
  const showMinimalHeader = phase !== "intro" && phase !== "chooser";

  const updatedAtLabel = latestAttempt
    ? new Date(latestAttempt.updatedAt).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "";

  return (
    <DashboardLayout fullWidth>
      <div className="min-h-[calc(100vh-8rem)] bg-[#f5f3ef] px-4 py-6 sm:py-8 dark:bg-slate-950">
        <div className="mx-auto w-full min-w-0 max-w-5xl">
          {showMinimalHeader && (
            <div className="mb-8 flex items-center justify-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                <HeartIcon className="size-5" />
              </div>
              <span className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                EQ Test
              </span>
            </div>
          )}

          {bootstrapping && (
            <div className="mx-auto max-w-lg py-16 text-center text-slate-500">
              Loading…
            </div>
          )}

          {!bootstrapping && phase === "chooser" && latestAttempt && (
            <EqTestChooser
              statusLabel={statusLabel(latestAttempt.status)}
              updatedAtLabel={updatedAtLabel}
              onViewLast={handleViewLast}
              onStartNew={handleStartNew}
            />
          )}

          {!bootstrapping && phase === "intro" && (
            <EqTestIntro onStart={handleStart} />
          )}

          {phase === "quiz" && currentQuestion && (
            <EqTestQuiz
              questionIndex={questionIndex}
              answers={answers}
              elapsedSeconds={elapsedSeconds}
              onAnswer={handleAnswer}
              onContinueCheckpoint={handleContinueCheckpoint}
              onBack={handleBack}
            />
          )}

          {phase === "confirmation" && (
            <EqTestConfirmation
              onGetResults={handleGetResults}
              onEdit={handleEdit}
            />
          )}

          {phase === "analyzing" && (
            <EqTestAnalyzing onComplete={handleAnalyzingComplete} />
          )}

          {phase === "results" && (
            <EqTestResults
              result={result}
              hasAccess={hasAccess}
              onUnlock={handleUnlock}
              onStartNew={handleStartNew}
              unlocking={scoring}
              error={scoreError}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
