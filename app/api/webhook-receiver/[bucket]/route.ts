import { NextRequest, NextResponse } from "next/server";
import type { WebhookStoredEvent } from "@/lib/webhook-receiver-types";

const MAX_EVENTS = 50;
const MAX_BODY = 128 * 1024;

type Store = Map<string, WebhookStoredEvent[]>;

function getStore(): Store {
  const g = globalThis as unknown as { __webhookReceiverStore?: Store };
  if (!g.__webhookReceiverStore) {
    g.__webhookReceiverStore = new Map();
  }
  return g.__webhookReceiverStore;
}

function isUuid(bucket: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    bucket,
  );
}

async function record(req: NextRequest, bucket: string) {
  const raw = await req.text();
  const bodyTruncated = raw.length > MAX_BODY;
  const bodyPreview = bodyTruncated ? raw.slice(0, MAX_BODY) : raw;
  const headers: Record<string, string> = {};
  req.headers.forEach((v, k) => {
    if (!k.startsWith(":")) {
      headers[k] = v;
    }
  });
  const entry: WebhookStoredEvent = {
    receivedAt: new Date().toISOString(),
    method: req.method,
    path: req.nextUrl.pathname,
    search: req.nextUrl.search,
    headers,
    bodyPreview,
    bodyTruncated,
  };
  const store = getStore();
  const list = store.get(bucket) ?? [];
  list.unshift(entry);
  store.set(bucket, list.slice(0, MAX_EVENTS));
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ bucket: string }> },
) {
  const { bucket } = await params;
  if (!isUuid(bucket)) {
    return NextResponse.json({ error: "Invalid bucket id." }, { status: 400 });
  }
  const store = getStore();
  return NextResponse.json({ events: store.get(bucket) ?? [] });
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ bucket: string }> },
) {
  const { bucket } = await ctx.params;
  if (!isUuid(bucket)) {
    return NextResponse.json({ error: "Invalid bucket id." }, { status: 400 });
  }
  await record(req, bucket);
  return NextResponse.json({ ok: true });
}

export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ bucket: string }> },
) {
  return POST(req, ctx);
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ bucket: string }> },
) {
  return POST(req, ctx);
}

/** Clears stored events for this bucket (not used by inbound webhooks). */
export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ bucket: string }> },
) {
  const { bucket } = await ctx.params;
  if (!isUuid(bucket)) {
    return NextResponse.json({ error: "Invalid bucket id." }, { status: 400 });
  }
  getStore().delete(bucket);
  return NextResponse.json({ ok: true });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      Allow: "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    },
  });
}
