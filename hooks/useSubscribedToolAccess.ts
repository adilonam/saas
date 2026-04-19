"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";

/**
 * Same access pattern as generate-pdf / timezone-meeting-planner:
 * signed-in user with active subscription.
 */
export function useSubscribedToolAccess(fallbackPath?: string) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const callbackPath = fallbackPath ?? pathname ?? "/";

  const assertAccess = (): boolean => {
    if (status === "unauthenticated" || !session) {
      router.push(`/signup?callbackUrl=${encodeURIComponent(callbackPath)}`);
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

  return { assertAccess, status, session };
}
