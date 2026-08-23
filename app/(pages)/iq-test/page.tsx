"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import IqTestAnalyzing from "@/components/iq-test/IqTestAnalyzing";
import { IqTestChooser } from "@/components/iq-test/IqTestChooser";
import IqTestQuiz, {
  IqTestConfirmation,
  IqTestIntro,
} from "@/components/iq-test/IqTestQuiz";
import IqTestResults from "@/components/iq-test/IqTestResults";
import { IQ_TEST_QUESTIONS, IQ_TEST_TOTAL } from "@/lib/iq-test/questions";
import { clientAnswersToSelected } from "@/lib/iq-test/scoring";
import type { IqAttemptPublic } from "@/lib/iq-test/attempts";
import type {
  IqTestAnswers,
  IqTestPhase,
  IqTestResult,
} from "@/lib/iq-test/types";
import { useToolAccess } from "@/lib/use-tool-access";
import { LightBulbIcon } from "@heroicons/react/24/outline";

type ScoreFetchResult =
  | { ok: true; result: IqTestResult }
  | { ok: false; status: number; code?: string };

async function fetchIqScore(
  answers: IqTestAnswers,
  elapsedSeconds: number,
  attemptId: string | null,
): Promise<ScoreFetchResult> {
  const res = await fetch("/api/iq-test/score", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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

  const data = (await res.json()) as IqTestResult & {
    attempt?: IqAttemptPublic;
  };
  const { attempt: _a, ...result } = data;
  return { ok: true, result };
}

async function saveAttempt(payload: {
  id?: string | null;
  answers: IqTestAnswers;
  elapsedSeconds: number;
  status: "in_progress" | "completed" | "scored";
  result?: IqTestResult | null;
}): Promise<IqAttemptPublic | null> {
  try {
    const res = await fetch("/api/iq-test/attempts", {
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
    const data = (await res.json()) as { attempt: IqAttemptPublic };
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

export default function IqTestPage() {
  const { ensureAccess, session, status } = useToolAccess();
  const [phase, setPhase] = useState<IqTestPhase>("intro");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<IqTestAnswers>({});
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [result, setResult] = useState<IqTestResult | null>(null);
  const [scoreError, setScoreError] = useState<string | null>(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [scoring, setScoring] = useState(false);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [latestAttempt, setLatestAttempt] = useState<IqAttemptPublic | null>(
    null,
  );
  const [bootstrapping, setBootstrapping] = useState(true);
  const attachDone = useRef(false);

  const hasAccess = useMemo(() => {
    if (status !== "authenticated" || !session) return false;
    return (
      !!session.user.subscriptionExpiresAt &&
      new Date(session.user.subscriptionExpiresAt) > new Date()
    );
  }, [session, status]);

  // Attach guest attempts after login, then load latest for chooser.
  useEffect(() => {
    if (status === "loading") return;

    let cancelled = false;

    (async () => {
      try {
        if (status === "authenticated" && !attachDone.current) {
          attachDone.current = true;
          await fetch("/api/iq-test/attempts/attach", {
            method: "POST",
            credentials: "include",
          });
        }

        const res = await fetch("/api/iq-test/attempts/latest", {
          credentials: "include",
        });
        if (!res.ok) return;
        const data = (await res.json()) as {
          attempt: IqAttemptPublic | null;
        };
        if (cancelled) return;

        if (data.attempt) {
          setLatestAttempt(data.attempt);
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
  }, [status]);

  useEffect(() => {
    if (!timerRunning) return;
    const id = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [timerRunning]);

  const resetToIntro = () => {
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
    setAttemptId(null);
    setPhase("quiz");
    setQuestionIndex(0);
    setAnswers({});
    setElapsedSeconds(0);
    setResult(null);
    setScoreError(null);
    setTimerRunning(true);
  };

  const applyAttempt = async (attempt: IqAttemptPublic) => {
    setAttemptId(attempt.id);
    setAnswers(attempt.answers ?? {});
    setElapsedSeconds(attempt.elapsedSeconds ?? 0);
    setResult(attempt.result);
    setScoreError(null);
    setTimerRunning(false);

    if (attempt.status === "in_progress") {
      const answered = Object.keys(attempt.answers ?? {}).length;
      const idx = Math.min(answered, IQ_TEST_TOTAL - 1);
      setQuestionIndex(Math.max(0, idx));
      setPhase("quiz");
      setTimerRunning(true);
      return;
    }

    // completed or scored → results (paywall if no result / no access)
    setPhase("results");

    // Subscribed user with saved answers but no score yet → score now
    if (
      hasAccess &&
      !attempt.result &&
      attempt.status === "completed" &&
      Object.keys(attempt.answers ?? {}).length > 0
    ) {
      setScoring(true);
      try {
        const scored = await fetchIqScore(
          attempt.answers,
          attempt.elapsedSeconds,
          attempt.id,
        );
        if (scored.ok === true) {
          setResult(scored.result);
        }
      } finally {
        setScoring(false);
      }
    }
  };

  const handleViewLast = () => {
    if (!latestAttempt) return;
    void applyAttempt(latestAttempt);
  };

  const handleStartNew = () => {
    resetToIntro();
  };

  const advance = useCallback((fromIndex: number) => {
    if (fromIndex + 1 >= IQ_TEST_TOTAL) {
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
    // Persist before analyzing / auth gate so results survive signup.
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
      // Ensure attempt exists even if confirmation save failed
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

      const scored = await fetchIqScore(answers, elapsedSeconds, id);
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
        }
      }

      const scored = await fetchIqScore(answers, elapsedSeconds, id);
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
    setQuestionIndex(IQ_TEST_TOTAL - 1);
    setTimerRunning(true);
  };

  const currentQuestion = IQ_TEST_QUESTIONS[questionIndex];
  const showMinimalHeader = phase !== "intro" && phase !== "chooser";

  const updatedAtLabel = latestAttempt
    ? new Date(latestAttempt.updatedAt).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "";

  return (
    <DashboardLayout fullWidth>
      <div className="min-h-[calc(100vh-8rem)] bg-[#f5f3ef] px-4 py-8 dark:bg-slate-950">
        <div className="mx-auto max-w-5xl">
          {showMinimalHeader && (
            <div className="mb-8 flex items-center justify-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                <LightBulbIcon className="size-5" />
              </div>
              <span className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                IQ Test
              </span>
            </div>
          )}

          {bootstrapping && (
            <div className="mx-auto max-w-lg py-16 text-center text-slate-500">
              Loading…
            </div>
          )}

          {!bootstrapping && phase === "chooser" && latestAttempt && (
            <IqTestChooser
              statusLabel={statusLabel(latestAttempt.status)}
              updatedAtLabel={updatedAtLabel}
              onViewLast={handleViewLast}
              onStartNew={handleStartNew}
            />
          )}

          {!bootstrapping && phase === "intro" && (
            <IqTestIntro onStart={handleStart} />
          )}

          {phase === "quiz" && currentQuestion && (
            <IqTestQuiz
              questionIndex={questionIndex}
              answers={answers}
              elapsedSeconds={elapsedSeconds}
              onAnswer={handleAnswer}
              onContinueCheckpoint={handleContinueCheckpoint}
              onBack={handleBack}
            />
          )}

          {phase === "confirmation" && (
            <IqTestConfirmation
              onGetResults={handleGetResults}
              onEdit={handleEdit}
            />
          )}

          {phase === "analyzing" && (
            <IqTestAnalyzing onComplete={handleAnalyzingComplete} />
          )}

          {phase === "results" && (
            <IqTestResults
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
