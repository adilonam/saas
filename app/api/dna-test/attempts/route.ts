import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { Prisma } from "@/prisma/generated/client";
import {
  isDnaAttemptStatus,
  parseDnaResult,
  serializeAttempt,
  type DnaAttemptStatus,
} from "@/lib/dna-test/attempts";
import {
  getGuestToken,
  getOrCreateGuestToken,
} from "@/lib/dna-test/guest-token";

/**
 * POST /api/dna-test/attempts
 * Create or update a DNA test attempt for the current user or guest cookie.
 *
 * Body: {
 *   id?: string,
 *   status?: "in_progress" | "completed" | "scored",
 *   result?: { origins: [...] }
 * }
 *
 * Guest cookie: `dna_test_guest` (httpOnly). Created on first anonymous save.
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id ?? null;

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

    let status: DnaAttemptStatus = "in_progress";
    if (body.status !== undefined) {
      if (!isDnaAttemptStatus(body.status)) {
        return NextResponse.json(
          { error: "Invalid status" },
          { status: 400 },
        );
      }
      status = body.status;
    }

    const hasResult = body.result !== undefined;
    let resultJson: Prisma.InputJsonValue | undefined;
    if (hasResult) {
      const parsed = parseDnaResult(body.result);
      if (!parsed) {
        return NextResponse.json(
          { error: "result must include origins" },
          { status: 400 },
        );
      }
      resultJson = parsed as unknown as Prisma.InputJsonValue;
    }

    const id = typeof body.id === "string" ? body.id : null;

    if (id) {
      const existing = await prisma.dnaTestAttempt.findUnique({ where: { id } });
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

      const data: Prisma.DnaTestAttemptUncheckedUpdateInput = { status };
      if (resultJson !== undefined) data.result = resultJson;
      if (userId && existing.userId !== userId) data.userId = userId;

      const updated = await prisma.dnaTestAttempt.update({
        where: { id },
        data,
      });

      return NextResponse.json({ attempt: serializeAttempt(updated) });
    }

    const data: Prisma.DnaTestAttemptUncheckedCreateInput = {
      status,
      ...(userId ? { userId } : {}),
      ...(guestToken ? { guestToken } : {}),
      ...(resultJson !== undefined ? { result: resultJson } : {}),
    };

    const created = await prisma.dnaTestAttempt.create({ data });

    return NextResponse.json(
      { attempt: serializeAttempt(created) },
      { status: 201 },
    );
  } catch (err) {
    console.error("dna-test/attempts POST error:", err);
    return NextResponse.json(
      { error: "Failed to save attempt" },
      { status: 500 },
    );
  }
}
