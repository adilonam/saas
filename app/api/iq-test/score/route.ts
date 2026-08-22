import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { Prisma } from "@/prisma/generated/client";
import {
  calculateIqResultFromAnswerKey,
  clientAnswersToSelected,
  type SelectedAnswer,
} from "@/lib/iq-test/scoring";
import { serializeAttempt } from "@/lib/iq-test/attempts";
import { getGuestToken } from "@/lib/iq-test/guest-token";

function parseSelectedAnswers(body: unknown): SelectedAnswer[] | null {
  if (!body || typeof body !== "object") return null;
  const raw = body as Record<string, unknown>;

  if (Array.isArray(raw.answers)) {
    const out: SelectedAnswer[] = [];
    for (const item of raw.answers) {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const question = Number(row.question);
      const selectedOption = Number(row.selectedOption);
      if (
        !Number.isInteger(question) ||
        !Number.isInteger(selectedOption) ||
        selectedOption < 1 ||
        selectedOption > 6
      ) {
        return null;
      }
      out.push({ question, selectedOption });
    }
    return out;
  }

  // Also accept Record keyed by question number: { "11": 3, "12": 5 }
  if (raw.answers && typeof raw.answers === "object" && !Array.isArray(raw.answers)) {
    const out: SelectedAnswer[] = [];
    for (const [key, value] of Object.entries(raw.answers as Record<string, unknown>)) {
      const question = Number(key);
      const selectedOption = Number(value);
      if (
        !Number.isInteger(question) ||
        !Number.isInteger(selectedOption) ||
        selectedOption < 1 ||
        selectedOption > 6
      ) {
        return null;
      }
      out.push({ question, selectedOption });
    }
    return out;
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { subscriptionExpiresAt: true },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const hasActiveSubscription =
      user.subscriptionExpiresAt &&
      new Date(user.subscriptionExpiresAt) > new Date();
    if (!hasActiveSubscription) {
      return NextResponse.json(
        {
          error: "Active subscription required",
          code: "subscription_required",
        },
        { status: 403 },
      );
    }

    const body = await request.json();
    const attemptId =
      typeof body.attemptId === "string" ? body.attemptId : null;

    let selected = parseSelectedAnswers(body);
    let elapsedSeconds = Number(body.elapsedSeconds);

    if (attemptId) {
      const attempt = await prisma.iqTestAttempt.findUnique({
        where: { id: attemptId },
      });
      if (!attempt) {
        return NextResponse.json(
          { error: "Attempt not found" },
          { status: 404 },
        );
      }

      const guestToken = await getGuestToken();
      const owns =
        attempt.userId === session.user.id ||
        (guestToken &&
          attempt.guestToken === guestToken &&
          (!attempt.userId || attempt.userId === session.user.id));
      if (!owns) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      // Prefer body answers; fall back to stored client payload (q11 → 0-based)
      if (!selected) {
        const stored = attempt.answers;
        if (stored && typeof stored === "object" && !Array.isArray(stored)) {
          const fromClient = clientAnswersToSelected(
            stored as Record<string, number | string>,
          );
          if (fromClient.length > 0) {
            selected = fromClient;
          } else {
            selected = parseSelectedAnswers({ answers: stored });
          }
        }
      }

      if (!Number.isFinite(elapsedSeconds) || elapsedSeconds < 0) {
        elapsedSeconds = attempt.elapsedSeconds;
      }
    }

    if (!selected) {
      return NextResponse.json(
        {
          error:
            "Invalid answers. Expected answers: Array<{ question, selectedOption }> with 1-based selectedOption (1–6).",
        },
        { status: 400 },
      );
    }

    if (!Number.isFinite(elapsedSeconds) || elapsedSeconds < 0) {
      return NextResponse.json(
        { error: "elapsedSeconds must be a non-negative number" },
        { status: 400 },
      );
    }

    const result = calculateIqResultFromAnswerKey(
      selected,
      Math.round(elapsedSeconds),
    );

    let attemptPayload = null;
    if (attemptId) {
      const updated = await prisma.iqTestAttempt.update({
        where: { id: attemptId },
        data: {
          result: result as unknown as Prisma.InputJsonValue,
          status: "scored",
          elapsedSeconds: Math.round(elapsedSeconds),
          userId: session.user.id,
        } satisfies Prisma.IqTestAttemptUncheckedUpdateInput,
      });
      attemptPayload = serializeAttempt(updated);
    }

    return NextResponse.json(
      attemptPayload ? { ...result, attempt: attemptPayload } : result,
    );
  } catch (err) {
    console.error("iq-test/score error:", err);
    return NextResponse.json(
      { error: "Failed to score IQ test" },
      { status: 500 },
    );
  }
}
