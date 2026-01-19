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

    // Get current user with tokens
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { tokens: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if user has tokens
    if (user.tokens <= 0) {
      return NextResponse.json(
        { error: "Insufficient tokens", tokens: user.tokens },
        { status: 400 }
      );
    }

    // Deduct 1 token and create transaction in a single transaction
    const result = await prisma.$transaction([
      prisma.user.update({
        where: { id: session.user.id },
        data: {
          tokens: {
            decrement: 1,
          },
        },
      }),
      prisma.transaction.create({
        data: {
          userId: session.user.id,
          type: "cost",
          amount: -1,
          description: "PDF merge cost",
        },
      }),
    ]);

    const updatedUser = result[0];

    return NextResponse.json(
      {
        message: "Token deducted successfully",
        tokens: updatedUser.tokens,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Merge error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
