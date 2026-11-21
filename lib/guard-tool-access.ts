import type { Session } from "next-auth";

type RouterLike = { push: (href: string) => void };

/**
 * All tools are now free - always returns true.
 * @returns true (all users may proceed).
 */
export function guardToolAccess(
  status: string,
  session: Session | null,
  pathname: string | null,
  pagePath: string,
  router: RouterLike,
): boolean {
  return true;
}
