import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendFreeSubscriptionEmail } from "@/lib/smtp";

const DAYS_TO_ADD = 10;
const EMAILS_PER_SECOND = 2;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const secret = url.searchParams.get("secret");

  if (!secret || secret !== process.env.NEXTAUTH_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return runFreeSubscriptionJob();
}

async function runFreeSubscriptionJob() {
  const now = new Date();
  const errors: string[] = [];
  let updated = 0;
  let emailsSent = 0;

  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, subscriptionExpiresAt: true },
  });

  for (const user of users) {
    try {
      const baseDate =
        user.subscriptionExpiresAt && user.subscriptionExpiresAt > now
          ? user.subscriptionExpiresAt
          : now;
      const newExpiresAt = new Date(baseDate);
      newExpiresAt.setDate(newExpiresAt.getDate() + DAYS_TO_ADD);

      await prisma.$transaction([
        // prisma.user.update({
        //   where: { id: user.id },
        //   data: { subscriptionExpiresAt: newExpiresAt },
        // }),
        prisma.history.create({
          data: {
            userId: user.id,
            action: "subscription_extended",
            description: `Free promotion: +${DAYS_TO_ADD} days`,
            metadata: {
              source: "job_free_subscription",
              previousExpiresAt: user.subscriptionExpiresAt?.toISOString() ?? null,
              newExpiresAt: newExpiresAt.toISOString(),
              daysAdded: DAYS_TO_ADD,
            },
          },
        }),
      ]);
      updated += 1;

      await sendFreeSubscriptionEmail(user.email, user.name);
      emailsSent += 1;

      if (emailsSent % EMAILS_PER_SECOND === 0) {
        await delay(1000);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      errors.push(`${user.email}: ${message}`);
    }
  }

  return NextResponse.json({
    ok: true,
    totalUsers: users.length,
    updated,
    emailsSent,
    errors: errors.length > 0 ? errors : undefined,
  });
}
