"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackTikTokEvent } from "@/lib/tiktok-events-client";

export function TikTokEventsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    trackTikTokEvent("PageView");
  }, [pathname]);

  return null;
}
