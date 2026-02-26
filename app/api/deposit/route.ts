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

/**
 * Legacy endpoint. Returns a Stripe Checkout URL for the monthly plan.
 * Prefer POST /api/create-checkout-session with body { plan: "monthly" | "annual" }.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id || !session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const monthlyCents = parsePrice(process.env.MONTHLY_PRICE);
  if (!stripe || monthlyCents == null) {
    return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 });
  }
  const baseUrl = (process.env.NEXTAUTH_URL || "").replace(/\/$/, "");
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
              name: "Monthly subscription",
              description: "Full access to all productivity tools — billed monthly",
            },
            unit_amount: monthlyCents,
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/thank-you`,
      cancel_url: `${baseUrl}/pricing`,
    });
    return NextResponse.json({ url: checkoutSession.url ?? null });
  } catch (e) {
    console.error("Stripe checkout (deposit) error:", e);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
