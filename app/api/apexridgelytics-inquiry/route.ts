import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const brief = typeof body.brief === "string" ? body.brief.trim() : "";
    if (!brief) {
      return NextResponse.json(
        { error: "Project brief is required" },
        { status: 400 },
      );
    }

    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      // Accept anonymous briefs without persisting a user-bound inquiry
      return NextResponse.json({
        inquiry: { id: null, status: "received", createdAt: new Date().toISOString() },
      });
    }

    const inquiry = await prisma.agencyInquiry.create({
      data: {
        userId,
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
