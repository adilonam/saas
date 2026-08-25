"use client";

import { SessionProvider } from "next-auth/react";
import { TikTokEventsTracker } from "@/components/TikTokEventsTracker";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <TikTokEventsTracker />
      {children}
    </SessionProvider>
  );
}

