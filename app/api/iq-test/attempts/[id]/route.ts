import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { serializeAttempt } from "@/lib/iq-test/attempts";
import { getGuestToken } from "@/lib/iq-test/guest-token";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/iq-test/attempts/[id]
 * Load one attempt if owned by the signed-in user or matching guest cookie.
 */
export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const session = await auth();
    const userId = session?.user?.id ?? null;
    const guestToken = await getGuestToken();

    const attempt = await prisma.iqTestAttempt.findUnique({ where: { id } });
    if (!attempt) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const ownsAsUser = Boolean(userId && attempt.userId === userId);
    const ownsAsGuest = Boolean(
      guestToken &&
        attempt.guestToken === guestToken &&
        (!attempt.userId || attempt.userId === userId),
    );

    if (!ownsAsUser && !ownsAsGuest) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ attempt: serializeAttempt(attempt) });
  } catch (err) {
    console.error("iq-test/attempts/[id] GET error:", err);
    return NextResponse.json(
      { error: "Failed to load attempt" },
      { status: 500 },
    );
  }
}
