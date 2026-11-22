import { NextResponse } from "next/server";

/** Free-subscription job stub — subscriptions are no longer used. */
export async function GET() {
  return NextResponse.json({ ok: true, ignored: true });
}

export async function POST() {
  return NextResponse.json({ ok: true, ignored: true });
}
