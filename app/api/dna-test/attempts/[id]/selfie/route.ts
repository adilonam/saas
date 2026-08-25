import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { getGuestToken } from "@/lib/dna-test/guest-token";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/dna-test/attempts/[id]/selfie
 * Stream stored selfie bytes for the owning user or guest cookie.
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

    const attempt = await prisma.dnaTestAttempt.findUnique({
      where: { id },
      select: {
        userId: true,
        guestToken: true,
        selfie: true,
        selfieMimeType: true,
      },
    });

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

    if (!attempt.selfie || attempt.selfie.length === 0) {
      return NextResponse.json({ error: "No selfie" }, { status: 404 });
    }

    const mime =
      attempt.selfieMimeType && attempt.selfieMimeType.startsWith("image/")
        ? attempt.selfieMimeType
        : "image/jpeg";

    return new NextResponse(Buffer.from(attempt.selfie), {
      status: 200,
      headers: {
        "Content-Type": mime,
        "Cache-Control": "private, max-age=3600",
        "Content-Length": String(attempt.selfie.length),
      },
    });
  } catch (err) {
    console.error("dna-test/attempts/[id]/selfie GET error:", err);
    return NextResponse.json(
      { error: "Failed to load selfie" },
      { status: 500 },
    );
  }
}
