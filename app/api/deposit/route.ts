import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { licenseKey } = body;

    if (!licenseKey || typeof licenseKey !== "string") {
      return NextResponse.json(
        { error: "License key is required" },
        { status: 400 }
      );
    }

    // Find the license key in the database
    const license = await prisma.licenseKey.findUnique({
      where: { key: licenseKey.trim() },
    });

    if (!license) {
      return NextResponse.json(
        { error: "Invalid license key" },
        { status: 400 }
      );
    }

    // Temporarily allow reuse - only check if key exists
    // Add tokens to user and create transaction without marking key as used
    await prisma.$transaction([
      prisma.user.update({
        where: { id: session.user.id },
        data: {
          tokens: {
            increment: license.amount,
          },
        },
      }),
      prisma.transaction.create({
        data: {
          userId: session.user.id,
          type: "deposit",
          amount: license.amount,
          description: `License key deposit: ${licenseKey.trim().substring(0, 8)}...`,
        },
      }),
    ]);

    return NextResponse.json(
      {
        message: "License key redeemed successfully",
        amount: license.amount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Deposit error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
