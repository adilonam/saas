import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const APP_URL = process.env.NEXTAUTH_URL || "https://eprod.io";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(
      `${APP_URL.replace(/\/$/, "")}/signin?error=missing_token`
    );
  }

  const now = new Date();

  const verification = await prisma.verificationToken.findFirst({
    where: {
      token,
      expires: { gt: now },
    },
  });

  if (!verification) {
    return NextResponse.redirect(
      `${APP_URL.replace(/\/$/, "")}/signin?error=invalid_or_expired_token`
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: verification.identifier },
    select: { id: true },
  });

  if (!user) {
    return NextResponse.redirect(
      `${APP_URL.replace(/\/$/, "")}/signin?error=user_not_found`
    );
  }

  // Free day is granted on sign up only; here we just mark email as verified
  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: now },
    }),
    prisma.verificationToken.deleteMany({
      where: { identifier: verification.identifier, token: verification.token },
    }),
  ]);

  return NextResponse.redirect(
    `${APP_URL.replace(/\/$/, "")}/?verified=1`
  );
}
