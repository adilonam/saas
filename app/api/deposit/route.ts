import { NextResponse } from "next/server";
import { auth } from "@/auth";

/**
 * Legacy endpoint. Subscription is now handled via Gumroad.
 * Returns the Gumroad subscription URL for the client to redirect.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = process.env.NEXT_PUBLIC_GUMROAD_SUBSCRIPTION_URL || "";
  return NextResponse.json({ gumroadUrl: url || null });
}
