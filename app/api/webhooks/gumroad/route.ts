import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const MONTHLY_DAYS = 30;
const ANNUAL_DAYS = 365;

function getEmailFromPayload(payload: Record<string, unknown>): string | null {
  const email =
    (payload.email as string) ??
    (payload.purchaser_email as string) ??
    (payload.buyer_email as string);
  if (typeof email === "string" && email.includes("@")) return email;
  const sale = payload.sale as Record<string, unknown> | undefined;
  if (sale) {
    const saleEmail =
      (sale.email as string) ??
      (sale.purchaser_email as string) ??
      (sale.buyer_email as string);
    if (typeof saleEmail === "string" && saleEmail.includes("@")) return saleEmail;
  }
  return null;
}

function getProductIdFromPayload(payload: Record<string, unknown>): string | null {
  const id =
    (payload.product_id as string) ??
    (payload.sale as Record<string, unknown> | undefined)?.product_id;
  return typeof id === "string" ? id : null;
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();

    let payload: Record<string, unknown>;
    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      payload = JSON.parse(rawBody) as Record<string, unknown>;
    } else {
      const params = new URLSearchParams(rawBody);
      payload = Object.fromEntries(params.entries()) as Record<string, unknown>;
    }

    const email = getEmailFromPayload(payload);
    const productId = getProductIdFromPayload(payload);
    const refunded = payload.refunded === "true" || payload.refunded === true;
    const recurrence = (payload.recurrence as string) ?? null;
    const subscriptionId = (payload.subscription_id as string) ?? null;
    const saleId = (payload.sale_id as string) ?? null;
    const productName = (payload.product_name as string) ?? null;

    console.log("Gumroad webhook:", { email, productId, payload });

    if (!email) {
      console.warn("Gumroad webhook: no email in payload", { payload });
      return NextResponse.json({ received: true }, { status: 200 });
    }

    if (refunded) {
      return NextResponse.json({ received: true, skipped: "refunded" }, { status: 200 });
    }

    const productIdMonthly = process.env.GUMROAD_PRODUCT_ID_MONTHLY;
    const productIdYearly = process.env.GUMROAD_PRODUCT_ID_YEARLY;
    let daysToAdd: number;
    let planLabel: string;

    if (productId && productIdMonthly && productId === productIdMonthly) {
      daysToAdd = MONTHLY_DAYS;
      planLabel = "monthly";
    } else if (productId && productIdYearly && productId === productIdYearly) {
      daysToAdd = ANNUAL_DAYS;
      planLabel = "annual";
    } else {
      return NextResponse.json({ received: true, skipped: "product_id_mismatch" }, { status: 200 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: { id: true, subscriptionExpiresAt: true },
    });

    if (!user) {
      console.warn("Gumroad webhook: no user found for email", email);
      return NextResponse.json({ received: true, skipped: "user_not_found" }, { status: 200 });
    }

    const now = new Date();
    const baseDate =
      user.subscriptionExpiresAt && user.subscriptionExpiresAt > now
        ? user.subscriptionExpiresAt
        : now;
    const newExpiresAt = new Date(baseDate);
    newExpiresAt.setDate(newExpiresAt.getDate() + daysToAdd);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { subscriptionExpiresAt: newExpiresAt },
      }),
      prisma.history.create({
        data: {
          userId: user.id,
          action: user.subscriptionExpiresAt && user.subscriptionExpiresAt > now ? "subscription_renewed" : "subscription_started",
          description: `Gumroad ${planLabel}: +${daysToAdd} days${productName ? ` (${productName})` : ""}`,
          metadata: {
            source: "gumroad",
            plan: planLabel,
            daysAdded: daysToAdd,
            recurrence: recurrence ?? undefined,
            saleId: saleId ?? undefined,
            subscriptionId: subscriptionId ?? undefined,
            productId: productId ?? undefined,
            productName: productName ?? undefined,
            previousExpiresAt: user.subscriptionExpiresAt?.toISOString() ?? null,
            newExpiresAt: newExpiresAt.toISOString(),
          },
        },
      }),
    ]);

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (e) {
    console.error("Gumroad webhook error:", e);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
