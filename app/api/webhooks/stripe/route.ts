import { NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/lib/prisma";
import { sendPaymentSuccessEmail } from "@/lib/smtp";

const MONTHLY_DAYS = 30;
const ANNUAL_DAYS = 365;

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

async function addSubscriptionDays(
  userId: string,
  email: string,
  name: string | null,
  daysToAdd: number,
  planLabel: string,
  metadata: { source: string; plan: string; daysAdded: number; [k: string]: unknown }
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, subscriptionExpiresAt: true },
  });
  if (!user) return;

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
        action:
          user.subscriptionExpiresAt && user.subscriptionExpiresAt > now
            ? "subscription_renewed"
            : "subscription_started",
        description: `Stripe ${planLabel}: +${daysToAdd} days`,
        metadata: {
          ...metadata,
          previousExpiresAt: user.subscriptionExpiresAt?.toISOString() ?? null,
          newExpiresAt: newExpiresAt.toISOString(),
        },
      },
    }),
  ]);

  try {
    const displayName = name?.trim() || email;
    await sendPaymentSuccessEmail(email, displayName, planLabel, newExpiresAt);
  } catch (err) {
    console.error("Stripe webhook: payment success email failed", err);
  }
}

export async function POST(request: Request) {
  if (!stripe || !webhookSecret) {
    return NextResponse.json(
      { error: "Stripe webhook not configured" },
      { status: 503 }
    );
  }

  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (e) {
    console.error("Stripe webhook signature verification failed:", e);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    // Handle both initial payment and renewals via invoice.paid (avoids double-crediting on first payment)
    if (event.type === "invoice.paid") {
      const invoice = event.data.object as Stripe.Invoice;
      const subRef = invoice.parent?.subscription_details?.subscription;
      const subscriptionId =
        typeof subRef === "string" ? subRef : (subRef as Stripe.Subscription | undefined)?.id ?? null;
      let customerEmail: string | null = invoice.customer_email ?? null;
      if (!customerEmail && invoice.customer) {
        const custId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer.id;
        const customer = await stripe.customers.retrieve(custId);
        customerEmail = (customer as Stripe.Customer).email ?? null;
      }
      if (!subscriptionId || !customerEmail) {
        return NextResponse.json({ received: true }, { status: 200 });
      }
      const sub = await stripe.subscriptions.retrieve(subscriptionId);
      const item = sub.items.data[0];
      const interval = item?.price?.recurring?.interval ?? null;
      if (!interval) return NextResponse.json({ received: true }, { status: 200 });

      let daysToAdd: number;
      let planLabel: string;
      if (interval === "month") {
        daysToAdd = MONTHLY_DAYS;
        planLabel = "monthly";
      } else if (interval === "year") {
        daysToAdd = ANNUAL_DAYS;
        planLabel = "annual";
      } else {
        return NextResponse.json({ received: true, skipped: "interval_mismatch" }, { status: 200 });
      }

      const user = await prisma.user.findUnique({
        where: { email: customerEmail.toLowerCase().trim() },
        select: { id: true, name: true, email: true },
      });
      if (!user) {
        console.warn("Stripe webhook invoice.paid: no user for email", customerEmail);
        return NextResponse.json({ received: true }, { status: 200 });
      }

      await addSubscriptionDays(
        user.id,
        user.email,
        user.name,
        daysToAdd,
        planLabel,
        {
          source: "stripe",
          plan: planLabel,
          daysAdded: daysToAdd,
          invoiceId: invoice.id,
          subscriptionId,
          priceId: item?.price?.id ?? undefined,
        }
      );
      return NextResponse.json({ received: true }, { status: 200 });
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (e) {
    console.error("Stripe webhook error:", e);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
