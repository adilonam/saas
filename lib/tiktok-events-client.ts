import type { TikTokEventName, TikTokEventProperties } from "@/lib/tiktok-events";

type TrackTikTokEventOptions = {
  properties?: TikTokEventProperties;
  plan?: string;
  product?: string;
};

export async function trackTikTokEvent(
  event: TikTokEventName,
  options: TrackTikTokEventOptions = {},
): Promise<void> {
  if (typeof window === "undefined") return;

  const ttclid = new URLSearchParams(window.location.search).get("ttclid");

  try {
    await fetch("/api/tiktok-events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: event === "CompletePayment" || event === "InitiateCheckout",
      body: JSON.stringify({
        event,
        page: {
          url: window.location.href,
          referrer: document.referrer || undefined,
        },
        properties: options.properties,
        plan: options.plan,
        product: options.product,
        ttclid: ttclid ?? undefined,
      }),
    });
  } catch {
    /* analytics should not block UX */
  }
}
