import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { Prisma } from "@/prisma/generated/client";
import {
  isIqAttemptStatus,
  serializeAttempt,
  type IqAttemptStatus,
} from "@/lib/iq-test/attempts";
import {
  getGuestToken,
  getOrCreateGuestToken,
} from "@/lib/iq-test/guest-token";

/**
 * POST /api/iq-test/attempts
 * Create or update an IQ test attempt for the current user or guest cookie.
 *
 * Body: {
 *   id?: string,
 *   answers: Record<string, number | string>,
 *   elapsedSeconds: number,
 *   status?: "in_progress" | "completed" | "scored",
 *   result?: object
 * }
 *
 * Guest cookie: `iq_test_guest` (httpOnly). Created on first anonymous save.
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id ?? null;

    // Anonymous visitors always get a guest cookie; signed-in users keep any
    // existing cookie so we can claim prior guest attempts by id.
    const guestToken = userId
      ? await getGuestToken()
      : await getOrCreateGuestToken();

    if (!userId && !guestToken) {
      return NextResponse.json(
        { error: "Unable to identify visitor" },
        { status: 400 },
      );
    }

    const body = (await request.json()) as Record<string, unknown>;
    const answers = body.answers;
    if (!answers || typeof answers !== "object" || Array.isArray(answers)) {
      return NextResponse.json(
        { error: "answers must be an object" },
        { status: 400 },
      );
    }

    const elapsedSeconds = Number(body.elapsedSeconds);
    if (!Number.isFinite(elapsedSeconds) || elapsedSeconds < 0) {
      return NextResponse.json(
        { error: "elapsedSeconds must be a non-negative number" },
        { status: 400 },
      );
    }

    let status: IqAttemptStatus = "in_progress";
    if (body.status !== undefined) {
      if (!isIqAttemptStatus(body.status)) {
        return NextResponse.json(
          { error: "Invalid status" },
          { status: 400 },
        );
      }
      status = body.status;
    }

    const hasResult = body.result !== undefined;
    if (
      hasResult &&
      (body.result === null ||
        typeof body.result !== "object" ||
        Array.isArray(body.result))
    ) {
      return NextResponse.json(
        { error: "result must be an object when provided" },
        { status: 400 },
      );
    }

    const answersJson = answers as Prisma.InputJsonValue;
    const resultJson = hasResult
      ? (body.result as Prisma.InputJsonValue)
      : undefined;

    const id = typeof body.id === "string" ? body.id : null;

    if (id) {
      const existing = await prisma.iqTestAttempt.findUnique({ where: { id } });
      if (!existing) {
        return NextResponse.json(
          { error: "Attempt not found" },
          { status: 404 },
        );
      }

      const ownsAsUser = Boolean(userId && existing.userId === userId);
      const ownsAsGuest = Boolean(
        guestToken &&
          existing.guestToken === guestToken &&
          (!existing.userId || existing.userId === userId),
      );

      if (!ownsAsUser && !ownsAsGuest) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      const data: Prisma.IqTestAttemptUncheckedUpdateInput = {
        answers: answersJson,
        elapsedSeconds: Math.round(elapsedSeconds),
        status,
      };
      if (resultJson !== undefined) data.result = resultJson;
      if (userId && existing.userId !== userId) data.userId = userId;

      const updated = await prisma.iqTestAttempt.update({
        where: { id },
        data,
      });

      return NextResponse.json({ attempt: serializeAttempt(updated) });
    }

    const data: Prisma.IqTestAttemptUncheckedCreateInput = {
      answers: answersJson,
      elapsedSeconds: Math.round(elapsedSeconds),
      status,
      ...(userId ? { userId } : {}),
      ...(guestToken ? { guestToken } : {}),
      ...(resultJson !== undefined ? { result: resultJson } : {}),
    };

    const created = await prisma.iqTestAttempt.create({ data });

    return NextResponse.json(
      { attempt: serializeAttempt(created) },
      { status: 201 },
    );
  } catch (err) {
    console.error("iq-test/attempts POST error:", err);
    return NextResponse.json(
      { error: "Failed to save attempt" },
      { status: 500 },
    );
  }
}
