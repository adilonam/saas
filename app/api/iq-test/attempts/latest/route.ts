import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { serializeAttempt } from "@/lib/iq-test/attempts";
import { getGuestToken } from "@/lib/iq-test/guest-token";

/**
 * GET /api/iq-test/attempts/latest
 * Latest attempt for the authenticated user, or for the guest cookie.
 */
export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id ?? null;
    const guestToken = await getGuestToken();

    if (!userId && !guestToken) {
      return NextResponse.json({ attempt: null });
    }

    const attempt = await prisma.iqTestAttempt.findFirst({
      where: userId
        ? {
            OR: [
              { userId },
              ...(guestToken ? [{ guestToken, userId: null }] : []),
            ],
          }
        : { guestToken: guestToken! },
      orderBy: { updatedAt: "desc" },
    });

    if (!attempt) {
      return NextResponse.json({ attempt: null });
    }

    return NextResponse.json({ attempt: serializeAttempt(attempt) });
  } catch (err) {
    console.error("iq-test/attempts/latest GET error:", err);
    return NextResponse.json(
      { error: "Failed to load attempt" },
      { status: 500 },
    );
  }
}
