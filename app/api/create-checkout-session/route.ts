import { NextResponse } from "next/server";
import { auth } from "@/auth";
import Stripe from "stripe";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

function parsePrice(env: string | undefined): number | null {
  if (env == null || env === "") return null;
  const n = Number(env);
  return Number.isFinite(n) && n > 0 ? Math.round(n * 100) : null; // dollars -> cents
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || !session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const monthlyCents = parsePrice(process.env.MONTHLY_PRICE);
  const annualCents = parsePrice(process.env.ANNUAL_PRICE);
  if (!stripe || monthlyCents == null || annualCents == null) {
    return NextResponse.json(
      { error: "Stripe is not configured" },
      { status: 503 }
    );
  }

  let body: { plan?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const plan = body.plan === "annual" ? "annual" : "monthly";
  const isAnnual = plan === "annual";
  const unitAmountCents = isAnnual ? annualCents : monthlyCents;

  const baseUrl = (process.env.NEXTAUTH_URL || "").replace(/\/$/, "");
  const successUrl = `${baseUrl}/thank-you`;
  const cancelUrl = `${baseUrl}/pricing`;

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: session.user.email,
      client_reference_id: session.user.id,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: isAnnual ? "Annual subscription" : "Monthly subscription",
              description: isAnnual
                ? "Full access to all productivity tools — billed yearly"
                : "Full access to all productivity tools — billed monthly",
            },
            unit_amount: unitAmountCents,
            recurring: {
              interval: isAnnual ? "year" : "month",
            },
          },
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
    return NextResponse.json({ url: checkoutSession.url });
  } catch (e) {
    console.error("Stripe checkout session error:", e);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
