"use client";

import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

/**
 * Shared gate for calculator-style tools: sign-in + active subscription, then unlock results.
 */
export function useToolAccess() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const ensureAccess = (): boolean => {
    if (status === "unauthenticated" || !session) {
      router.push(
        `/signup?callbackUrl=${encodeURIComponent(pathname || "/")}`,
      );
      return false;
    }
    const hasActiveSubscription =
      session.user.subscriptionExpiresAt &&
      new Date(session.user.subscriptionExpiresAt) > new Date();
    if (!hasActiveSubscription) {
      router.push("/pricing");
      return false;
    }
    return true;
  };

  return { session, status, ensureAccess };
}
