import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = typeof body.token === "string" ? body.token.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const confirmPassword =
      typeof body.confirmPassword === "string" ? body.confirmPassword : "";

    if (!token) {
      return NextResponse.json({ error: "Reset token is required" }, { status: 400 });
    }

    if (!password || !confirmPassword) {
      return NextResponse.json(
        { error: "Password and confirmation are required" },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const now = new Date();
    const resetRecord = await prisma.passwordResetToken.findFirst({
      where: {
        token,
        expiresAt: { gt: now },
      },
      include: {
        user: {
          select: { id: true },
        },
      },
    });

    if (!resetRecord) {
      return NextResponse.json(
        { error: "Reset link is invalid or has expired" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetRecord.userId },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetToken.deleteMany({
        where: { userId: resetRecord.userId },
      }),
    ]);

    return NextResponse.json({
      message: "Password updated successfully. You can now sign in.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
