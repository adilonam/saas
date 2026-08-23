import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { getGuestToken } from "@/lib/eq-test/guest-token";

/**
 * POST /api/eq-test/attempts/attach
 * Link guest-cookie attempts to the authenticated user after sign-in.
 */
export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const guestToken = await getGuestToken();
    if (!guestToken) {
      return NextResponse.json({ attached: 0 });
    }

    const result = await prisma.eqTestAttempt.updateMany({
      where: {
        guestToken,
        OR: [{ userId: null }, { userId: session.user.id }],
      },
      data: { userId: session.user.id },
    });

    return NextResponse.json({ attached: result.count });
  } catch (err) {
    console.error("eq-test/attempts/attach POST error:", err);
    return NextResponse.json(
      { error: "Failed to attach attempts" },
      { status: 500 },
    );
  }
}
