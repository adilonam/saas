import { NextResponse } from "next/server";

/** Gumroad webhook stub — subscriptions are no longer used. */
export async function POST() {
  return NextResponse.json({ ok: true, ignored: true });
}
