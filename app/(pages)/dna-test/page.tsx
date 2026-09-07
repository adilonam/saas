"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import DnaTestAnalyzing from "@/components/dna-test/DnaTestAnalyzing";
import { DnaTestChooser } from "@/components/dna-test/DnaTestChooser";
import DnaTestForm from "@/components/dna-test/DnaTestForm";
import DnaTestResults from "@/components/dna-test/DnaTestResults";
import type {
  DnaAttemptPublic,
  DnaAttemptStatus,
} from "@/lib/dna-test/attempts";
import type { DnaTestPhase, DnaTestResult } from "@/lib/dna-test/types";
import { resolveStoredOrLatestAttempt } from "@/lib/resolve-test-attempt";
import {
  DNA_TEST_ATTEMPT_STORAGE_KEY,
  clearStoredAttemptId,
  getStoredAttemptId,
  setStoredAttemptId,
} from "@/lib/test-attempt-storage";
import { useToolAccess } from "@/lib/use-tool-access";
import { BeakerIcon } from "@heroicons/react/24/outline";

type AnalyzeFetchResult =
  | { ok: true; result: DnaTestResult; attempt?: DnaAttemptPublic }
  | { ok: false; status: number; code?: string; error?: string };

async function analyzeSelfie(
  image: File,
  attemptId: string | null,
): Promise<AnalyzeFetchResult> {
  const formData = new FormData();
  formData.append("image", image);
  if (attemptId) formData.append("attemptId", attemptId);

  const res = await fetch("/api/dna-test", {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  const data = (await res.json().catch(() => ({}))) as {
    origins?: DnaTestResult["origins"];
    result?: DnaTestResult;
    attempt?: DnaAttemptPublic;
    error?: string;
    code?: string;
  };

  if (!res.ok) {
    return {
      ok: false,
      status: res.status,
      code: data.code,
      error: data.error,
    };
  }

  const origins = data.result?.origins ?? data.origins;
  if (!origins?.length) {
    return {
      ok: false,
      status: 502,
      error: "No ancestry results returned.",
    };
  }

  return {
    ok: true,
    result: { origins },
    attempt: data.attempt,
  };
}

async function saveAttempt(payload: {
  id?: string | null;
  status: DnaAttemptStatus;
  result?: DnaTestResult | null;
}): Promise<DnaAttemptPublic | null> {
  try {
    const res = await fetch("/api/dna-test/attempts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        ...(payload.id ? { id: payload.id } : {}),
        status: payload.status,
        ...(payload.result ? { result: payload.result } : {}),
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { attempt: DnaAttemptPublic };
    if (data.attempt?.id) {
      setStoredAttemptId(DNA_TEST_ATTEMPT_STORAGE_KEY, data.attempt.id);
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

export default function DnaTestPage() {
  const { ensureAccess, session, status } = useToolAccess();
  const [phase, setPhase] = useState<DnaTestPhase>("form");
  const [result, setResult] = useState<DnaTestResult | null>(null);
  const [scoreError, setScoreError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [scoring, setScoring] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [latestAttempt, setLatestAttempt] = useState<DnaAttemptPublic | null>(
    null,
  );
  const [pendingImage, setPendingImage] = useState<File | null>(null);
  const [bootstrapping, setBootstrapping] = useState(true);
  const pendingImageRef = useRef<File | null>(null);

  const hasAccess = useMemo(() => {
    if (status !== "authenticated" || !session) return false;
    return (
      !!session.user.subscriptionExpiresAt &&
      new Date(session.user.subscriptionExpiresAt) > new Date()
    );
  }, [session, status]);

  useEffect(() => {
    pendingImageRef.current = pendingImage;
  }, [pendingImage]);

  // Prefer localStorage attempt (claim on login), else latest DB, else start UI.
  useEffect(() => {
    if (status === "loading") return;

    let cancelled = false;

    (async () => {
      try {
        const storedId = getStoredAttemptId(DNA_TEST_ATTEMPT_STORAGE_KEY);
        const attempt = await resolveStoredOrLatestAttempt<DnaAttemptPublic>({
          storageKey: DNA_TEST_ATTEMPT_STORAGE_KEY,
          authenticated: status === "authenticated",
          attachUrl: "/api/dna-test/attempts/attach",
          latestUrl: "/api/dna-test/attempts/latest",
          attemptUrl: (id) => `/api/dna-test/attempts/${id}`,
        });
        if (cancelled || !attempt) return;

        setLatestAttempt(attempt);
        // Guest→login: open that attempt’s report/paywall. Otherwise chooser.
        if (storedId && attempt.id === storedId) {
          setAttemptId(attempt.id);
          setScoreError(null);
          setFormError(null);

          if (
            attempt.status === "completed" ||
            attempt.status === "scored"
          ) {
            // Subscribed but empty report: don't trap on a dead results wall.
            // Clear stale restore id so refresh doesn't bounce back here.
            if (hasAccess && !attempt.result) {
              clearStoredAttemptId(DNA_TEST_ATTEMPT_STORAGE_KEY);
              setAttemptId(null);
              setPhase("chooser");
            } else {
              // Soft paywall: origins stay on the attempt; only show when unlocked.
              setResult(hasAccess ? attempt.result : null);
              setPhase("results");
            }
          } else {
            setResult(attempt.result);
            setPhase("chooser");
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
    // Mirror IQ: re-bootstrap on auth status only (login / logout / session ready).
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hasAccess read when status settles
  }, [status]);

  const resetToForm = () => {
    clearStoredAttemptId(DNA_TEST_ATTEMPT_STORAGE_KEY);
    setAttemptId(null);
    setLatestAttempt(null);
    setPhase("form");
    setResult(null);
    setScoreError(null);
    setFormError(null);
    setPendingImage(null);
    setSubmitting(false);
    setScoring(false);
  };

  const applyAttempt = (attempt: DnaAttemptPublic) => {
    setAttemptId(attempt.id);
    setScoreError(null);
    setFormError(null);

    if (attempt.status === "in_progress") {
      setResult(attempt.result);
      setPhase("chooser");
      return;
    }

    // completed / scored → results (paywall until access; show saved origins when unlocked)
    if (hasAccess && !attempt.result) {
      // Empty attempt (no origins): clear restore id and offer a working new test.
      clearStoredAttemptId(DNA_TEST_ATTEMPT_STORAGE_KEY);
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
  };

  const handleViewLast = () => {
    if (!latestAttempt) return;
    // Empty scored/completed attempt: skip the dead wall — start a new upload.
    if (
      hasAccess &&
      !latestAttempt.result &&
      (latestAttempt.status === "completed" ||
        latestAttempt.status === "scored")
    ) {
      resetToForm();
      return;
    }
    applyAttempt(latestAttempt);
  };

  const handleStartNew = () => {
    resetToForm();
  };

  const handleFormSubmit = async (file: File) => {
    setSubmitting(true);
    setFormError(null);
    setScoreError(null);
    try {
      // Persist before analyzing / auth gate so results survive signup.
      const saved = await saveAttempt({
        id: attemptId,
        status: "completed",
      });
      if (saved) {
        setAttemptId(saved.id);
        setLatestAttempt(saved);
      }
      setPendingImage(file);
      setPhase("analyzing");
    } catch {
      setFormError("Could not save your attempt. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const runAnalysis = useCallback(
    async (
      image: File,
      id: string | null,
      reveal: boolean,
    ): Promise<{ ok: true } | { ok: false; error: string }> => {
      const analyzed = await analyzeSelfie(image, id);
      if (analyzed.ok === true) {
        if (analyzed.attempt) {
          setAttemptId(analyzed.attempt.id);
          setLatestAttempt(analyzed.attempt);
          setStoredAttemptId(
            DNA_TEST_ATTEMPT_STORAGE_KEY,
            analyzed.attempt.id,
          );
        } else if (id) {
          const saved = await saveAttempt({
            id,
            status: "scored",
            result: analyzed.result,
          });
          if (saved) setLatestAttempt(saved);
        }
        // Soft paywall: keep origins on attempt; only put them in UI when unlocked.
        setResult(reveal ? analyzed.result : null);
        return { ok: true };
      }

      const error =
        analyzed.error || "Could not analyze your selfie. Please try again.";
      setScoreError(error);
      setResult(null);
      return { ok: false, error };
    },
    [],
  );

  const handleAnalyzingComplete = useCallback(async () => {
    setScoring(true);
    setScoreError(null);
    try {
      let id = attemptId;
      if (!id) {
        const saved = await saveAttempt({ status: "completed" });
        if (saved) {
          id = saved.id;
          setAttemptId(saved.id);
          setLatestAttempt(saved);
        }
      }

      const image = pendingImageRef.current;
      if (!image) {
        setScoreError(
          "Photo missing for analysis. Please start a new test and upload again.",
        );
        setResult(null);
        setPhase("results");
        return;
      }

      // Always analyze once (guest or subscribed). Origins are saved on the
      // attempt; UI paywalls until auth + subscription.
      const outcome = await runAnalysis(image, id, hasAccess);
      if (outcome.ok === false) {
        setFormError(outcome.error);
        setPhase("form");
        return;
      }
      setPendingImage(null);
      setPhase("results");
    } finally {
      setScoring(false);
    }
  }, [attemptId, hasAccess, runAnalysis]);

  const handleUnlock = async () => {
    if (!ensureAccess()) return;
    setScoring(true);
    setScoreError(null);
    try {
      // Already scored (e.g. guest analyzed → subscribe → unlock)
      if (result) {
        setPhase("results");
        return;
      }
      if (latestAttempt?.result) {
        setResult(latestAttempt.result);
        setPhase("results");
        return;
      }

      // Refetch attempt in case attach/bootstrap raced ahead of local state
      const id = attemptId ?? latestAttempt?.id;
      if (id) {
        const res = await fetch(`/api/dna-test/attempts/${id}`, {
          credentials: "include",
        }).catch(() => null);
        if (res?.ok) {
          const data = (await res.json()) as { attempt?: DnaAttemptPublic };
          if (data.attempt?.result) {
            setLatestAttempt(data.attempt);
            setResult(data.attempt.result);
            setPhase("results");
            return;
          }
        }
      }

      // No origins on this attempt — clear stale id so Retry / Start new works.
      clearStoredAttemptId(DNA_TEST_ATTEMPT_STORAGE_KEY);
      setAttemptId(null);
      setScoreError(
        "This attempt has no saved report. Please start a new test.",
      );
      setPhase("results");
    } finally {
      setScoring(false);
    }
  };

  const showMinimalHeader = phase !== "form" && phase !== "chooser";

  const updatedAtLabel = latestAttempt
    ? new Date(latestAttempt.updatedAt).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "";

  return (
    <DashboardLayout fullWidth={phase !== "form"}>
      <div
        className={
          phase === "form"
            ? ""
            : phase === "chooser"
              ? "px-4 py-6 sm:px-6 sm:py-8"
              : "min-h-[calc(100vh-8rem)] bg-[#f5f3ef] px-4 py-8 dark:bg-slate-950"
        }
      >
        <div
          className={
            phase === "form" ? "" : "mx-auto w-full min-w-0 max-w-5xl"
          }
        >
          {showMinimalHeader && (
            <div className="mb-8 flex items-center justify-center gap-2">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-fuchsia-600 text-white">
                <BeakerIcon className="size-5" />
              </div>
              <span className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                DNA Test
              </span>
            </div>
          )}

          {(phase === "form" || phase === "chooser") && !bootstrapping && (
            <div className="mb-6 min-w-0 sm:mb-8">
              <div className="mb-2 flex min-w-0 items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-fuchsia-100 text-fuchsia-600 sm:size-10 dark:bg-fuchsia-900/30 dark:text-fuchsia-400">
                  <BeakerIcon className="size-5" />
                </div>
                <h1 className="min-w-0 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                  DNA Test
                </h1>
              </div>
              <p className="text-base text-pretty text-slate-500 sm:text-lg dark:text-slate-400">
                Upload a selfie or take a photo for a fun ancestry-style
                estimate by country — for entertainment only, not real DNA.
              </p>
            </div>
          )}

          {bootstrapping && (
            <div className="mx-auto max-w-lg py-16 text-center text-slate-500">
              Loading…
            </div>
          )}

          {!bootstrapping && phase === "chooser" && latestAttempt && (
            <DnaTestChooser
              statusLabel={statusLabel(latestAttempt.status)}
              updatedAtLabel={updatedAtLabel}
              onViewLast={handleViewLast}
              onStartNew={handleStartNew}
            />
          )}

          {!bootstrapping && phase === "form" && (
            <DnaTestForm
              onSubmit={handleFormSubmit}
              submitting={submitting}
              error={formError}
            />
          )}

          {phase === "analyzing" && (
            <DnaTestAnalyzing onComplete={handleAnalyzingComplete} />
          )}

          {phase === "results" && (
            <DnaTestResults
              result={result}
              selfieUrl={
                hasAccess && latestAttempt?.hasSelfie
                  ? `/api/dna-test/attempts/${latestAttempt.id}/selfie`
                  : null
              }
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
