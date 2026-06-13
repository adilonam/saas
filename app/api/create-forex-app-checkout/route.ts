import { NextResponse } from "next/server";
import { auth } from "@/auth";
import Stripe from "stripe";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

const DEFAULT_PRICE_USD = 499;

function parsePrice(env: string | undefined): number {
  if (env == null || env === "") return DEFAULT_PRICE_USD;
  const n = Number(env);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_PRICE_USD;
}

export async function POST() {
  const session = await auth();
  if (!session?.user?.id || !session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe is not configured" },
      { status: 503 },
    );
  }

  const priceUsd = parsePrice(process.env.FOREX_APP_PRICE);
  const unitAmountCents = Math.round(priceUsd * 100);
  const baseUrl = (process.env.NEXTAUTH_URL || "").replace(/\/$/, "");

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: session.user.email,
      client_reference_id: session.user.id,
      metadata: {
        product: "forex-trading-app",
        userId: session.user.id,
      },
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Forex Trading Web App",
              description:
                "Full license for the production-ready forex trading web application.",
            },
            unit_amount: unitAmountCents,
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/thank-you?product=forex-trading-app`,
      cancel_url: `${baseUrl}/forex-trading-app`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (e) {
    console.error("Forex app checkout session error:", e);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 },
    );
  }
}
