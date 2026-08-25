import { createHash, randomUUID } from "crypto";

const TIKTOK_EVENTS_URL =
  "https://business-api.tiktok.com/open_api/v1.3/event/track/";

export const TIKTOK_EVENT_NAMES = [
  "PageView",
  "ViewContent",
  "AddToCart",
  "InitiateCheckout",
  "CompletePayment",
] as const;

export type TikTokEventName = (typeof TIKTOK_EVENT_NAMES)[number];

export type TikTokContentItem = {
  content_id?: string;
  content_name?: string;
  content_type?: string;
  price?: number;
  quantity?: number;
};

export type TikTokEventProperties = {
  contents?: TikTokContentItem[];
  value?: number;
  currency?: string;
};

export type TikTokUserContext = {
  email?: string | null;
  externalId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  ttclid?: string | null;
};

export type TikTokPageContext = {
  url?: string;
  referrer?: string;
};

function hashPii(value: string): string {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

function resolvePurchaseValue(input: {
  plan?: string | null;
  product?: string | null;
}): { value: number; contents: TikTokContentItem[] } | null {
  if (input.product === "forex-trading-app") {
    const env = process.env.FOREX_APP_PRICE;
    const value =
      env != null && env !== "" && Number.isFinite(Number(env)) && Number(env) > 0
        ? Number(env)
        : 499;
    return {
      value,
      contents: [
        {
          content_id: "forex-trading-app",
          content_name: "Forex Trading Web App",
          content_type: "product",
          price: value,
          quantity: 1,
        },
      ],
    };
  }

  const monthlyUsd = Number(process.env.MONTHLY_PRICE);
  const annualUsd = Number(process.env.ANNUAL_PRICE);
  if (!Number.isFinite(monthlyUsd) || !Number.isFinite(annualUsd)) {
    return null;
  }

  const isAnnual = input.plan === "annual";
  const value = isAnnual ? annualUsd : monthlyUsd;
  const contentId = isAnnual ? "annual-subscription" : "monthly-subscription";
  const contentName = isAnnual ? "Annual subscription" : "Monthly subscription";

  return {
    value,
    contents: [
      {
        content_id: contentId,
        content_name: contentName,
        content_type: "product",
        price: value,
        quantity: 1,
      },
    ],
  };
}

function resolvePlanProperties(plan: string): TikTokEventProperties {
  const monthlyUsd = Number(process.env.MONTHLY_PRICE);
  const annualUsd = Number(process.env.ANNUAL_PRICE);
  const isAnnual = plan === "annual";
  const value = isAnnual ? annualUsd : monthlyUsd;
  const contentId = isAnnual ? "annual-subscription" : "monthly-subscription";
  const contentName = isAnnual ? "Annual subscription" : "Monthly subscription";

  return {
    value: Number.isFinite(value) ? value : undefined,
    currency: "USD",
    contents: [
      {
        content_id: contentId,
        content_name: contentName,
        content_type: "product",
        price: Number.isFinite(value) ? value : undefined,
        quantity: 1,
      },
    ],
  };
}

export function enrichTikTokEventProperties(
  event: TikTokEventName,
  properties: TikTokEventProperties | undefined,
  meta?: { plan?: string | null; product?: string | null },
): TikTokEventProperties | undefined {
  if (event === "CompletePayment") {
    const resolved = resolvePurchaseValue({
      plan: meta?.plan,
      product: meta?.product,
    });
    if (!resolved) return properties;
    return {
      currency: "USD",
      value: resolved.value,
      contents: resolved.contents,
      ...properties,
    };
  }

  if (
    (event === "AddToCart" || event === "InitiateCheckout") &&
    meta?.plan &&
    meta.plan !== "pricing" &&
    !properties?.contents?.length
  ) {
    return { ...resolvePlanProperties(meta.plan), ...properties };
  }

  if (event === "ViewContent" && meta?.plan === "pricing") {
    return {
      currency: "USD",
      contents: [
        {
          content_id: "pricing",
          content_name: "Pricing",
          content_type: "product_group",
        },
      ],
      ...properties,
    };
  }

  if (
    event === "ViewContent" &&
    meta?.plan &&
    meta.plan !== "pricing" &&
    !properties?.contents?.length
  ) {
    return { ...resolvePlanProperties(meta.plan), ...properties };
  }

  return properties;
}

export async function sendTikTokEvent(input: {
  event: TikTokEventName;
  user?: TikTokUserContext;
  page?: TikTokPageContext;
  properties?: TikTokEventProperties;
  plan?: string | null;
  product?: string | null;
  eventId?: string;
}): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  const accessToken = process.env.TIKTOK_EVENTS_API_ACCESS_TOKEN;
  const pixelId = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID;

  if (!accessToken || !pixelId) {
    return { ok: false, skipped: true };
  }

  const user: Record<string, string> = {};
  if (input.user?.email) {
    user.email = hashPii(input.user.email);
  }
  if (input.user?.externalId) {
    user.external_id = hashPii(input.user.externalId);
  }
  if (input.user?.ip) {
    user.ip = input.user.ip;
  }
  if (input.user?.userAgent) {
    user.user_agent = input.user.userAgent;
  }
  if (input.user?.ttclid) {
    user.ttclid = input.user.ttclid;
  }

  const properties = enrichTikTokEventProperties(
    input.event,
    input.properties,
    { plan: input.plan, product: input.product },
  );

  const payload = {
    event_source: "web",
    event_source_id: pixelId,
    data: [
      {
        event: input.event,
        event_time: Math.floor(Date.now() / 1000),
        event_id: input.eventId ?? randomUUID(),
        user,
        page: {
          url: input.page?.url,
          referrer: input.page?.referrer,
        },
        properties: properties ?? {},
      },
    ],
  };

  try {
    const res = await fetch(TIKTOK_EVENTS_URL, {
      method: "POST",
      headers: {
        "Access-Token": accessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("TikTok Events API error:", res.status, text);
      return { ok: false, error: `TikTok API ${res.status}` };
    }

    return { ok: true };
  } catch (e) {
    console.error("TikTok Events API request failed:", e);
    return { ok: false, error: "Request failed" };
  }
}
