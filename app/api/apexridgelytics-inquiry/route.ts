import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

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
        { error: "Active subscription required", code: "subscription_required" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const brief = typeof body.brief === "string" ? body.brief.trim() : "";
    if (!brief) {
      return NextResponse.json(
        { error: "Project brief is required" },
        { status: 400 },
      );
    }

    const inquiry = await prisma.agencyInquiry.create({
      data: {
        userId: session.user.id,
        brief,
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ inquiry });
  } catch (e) {
    console.error("ApexRidgeLytics inquiry error:", e);
    return NextResponse.json(
      { error: "An error occurred while submitting your inquiry" },
      { status: 500 },
    );
  }
}
