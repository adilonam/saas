import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  TIKTOK_EVENT_NAMES,
  sendTikTokEvent,
  type TikTokEventName,
  type TikTokEventProperties,
} from "@/lib/tiktok-events";

type RequestBody = {
  event?: string;
  page?: { url?: string; referrer?: string };
  properties?: TikTokEventProperties;
  plan?: string;
  product?: string;
  ttclid?: string;
};

function getClientIp(request: Request): string | undefined {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip") ?? undefined;
}

export async function POST(request: Request) {
  let body: RequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const event = body.event as TikTokEventName | undefined;
  if (!event || !TIKTOK_EVENT_NAMES.includes(event)) {
    return NextResponse.json({ error: "Invalid event" }, { status: 400 });
  }

  const session = await auth();
  const userAgent = request.headers.get("user-agent") ?? undefined;
  const ip = getClientIp(request);

  const result = await sendTikTokEvent({
    event,
    user: {
      email: session?.user?.email,
      externalId: session?.user?.id,
      ip,
      userAgent,
      ttclid: body.ttclid,
    },
    page: body.page,
    properties: body.properties,
    plan: body.plan,
    product: body.product,
  });

  if (result.skipped) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error ?? "Failed to send event" },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
