import { NextResponse } from "next/server";

function parseUsd(env: string | undefined): number | null {
  if (env == null || env === "") return null;
  const n = Number(env);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/**
 * Public subscription display amounts (same env vars as Stripe checkout).
 */
export async function GET() {
  const monthlyUsd = parseUsd(process.env.MONTHLY_PRICE);
  const annualUsd = parseUsd(process.env.ANNUAL_PRICE);
  if (monthlyUsd == null || annualUsd == null) {
    return NextResponse.json(
      { error: "Pricing is not configured" },
      { status: 503 },
    );
  }

  return NextResponse.json({
    monthlyUsd,
    annualUsd,
    currency: "USD" as const,
  });
}
