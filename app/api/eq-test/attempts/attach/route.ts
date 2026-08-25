import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { serializeAttempt } from "@/lib/eq-test/attempts";
import { getGuestToken } from "@/lib/eq-test/guest-token";

/**
 * POST /api/eq-test/attempts/attach
 * Link guest-cookie attempts (and optional localStorage attemptId) to the user.
 *
 * Body (optional): { attemptId?: string }
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    let attemptId: string | null = null;
    try {
      const body = (await request.json()) as { attemptId?: unknown };
      if (typeof body.attemptId === "string" && body.attemptId.length > 0) {
        attemptId = body.attemptId;
      }
    } catch {
      /* empty / non-JSON body is fine */
    }

    const guestToken = await getGuestToken();
    let attached = 0;

    if (guestToken) {
      const byCookie = await prisma.eqTestAttempt.updateMany({
        where: {
          guestToken,
          OR: [{ userId: null }, { userId }],
        },
        data: { userId },
      });
      attached += byCookie.count;
    }

    let claimed = null;
    if (attemptId) {
      const existing = await prisma.eqTestAttempt.findUnique({
        where: { id: attemptId },
      });
      if (
        existing &&
        (existing.userId === null || existing.userId === userId)
      ) {
        claimed = await prisma.eqTestAttempt.update({
          where: { id: attemptId },
          data: { userId },
        });
        if (existing.userId !== userId) attached += 1;
      }
    }

    return NextResponse.json({
      attached,
      attempt: claimed ? serializeAttempt(claimed) : null,
    });
  } catch (err) {
    console.error("eq-test/attempts/attach POST error:", err);
    return NextResponse.json(
      { error: "Failed to attach attempts" },
      { status: 500 },
    );
  }
}
