import type { Session } from "next-auth";

type RouterLike = { push: (href: string) => void };

/**
 * Redirects to signup or pricing when the user cannot use gated tools.
 * @returns true if the caller may proceed.
 */
export function guardToolAccess(
  status: string,
  session: Session | null,
  pathname: string | null,
  pagePath: string,
  router: RouterLike,
): boolean {
  if (status === "unauthenticated" || !session) {
    router.push(
      `/signup?callbackUrl=${encodeURIComponent(pathname || pagePath)}`,
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
}
