import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const APP_URL = process.env.NEXTAUTH_URL || "https://managepdf.site";
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

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
    select: { id: true, subscriptionExpiresAt: true },
  });

  if (!user) {
    return NextResponse.redirect(
      `${APP_URL.replace(/\/$/, "")}/signin?error=user_not_found`
    );
  }

  const baseExpires =
    user.subscriptionExpiresAt && user.subscriptionExpiresAt > now
      ? user.subscriptionExpiresAt
      : now;
  const newExpiresAt = new Date(baseExpires.getTime() + ONE_DAY_MS);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: now,
        subscriptionExpiresAt: newExpiresAt,
      },
    }),
    prisma.history.create({
      data: {
        userId: user.id,
        action: "subscription_started",
        description: "1 day free after email verification",
        metadata: {
          source: "email_verification",
          previousExpiresAt: user.subscriptionExpiresAt?.toISOString() ?? null,
          newExpiresAt: newExpiresAt.toISOString(),
        },
      },
    }),
    prisma.verificationToken.deleteMany({
      where: { identifier: verification.identifier, token: verification.token },
    }),
  ]);

  return NextResponse.redirect(
    `${APP_URL.replace(/\/$/, "")}/?verified=1`
  );
}
