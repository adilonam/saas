"use client";

/**
 * Free access for all tools - no authentication or subscription required.
 */
export function useSubscribedToolAccess(_fallbackPath?: string) {
  const assertAccess = (): boolean => {
    // All tools are now free - always return true
    return true;
  };

  return { 
    assertAccess, 
    status: "unauthenticated" as const, 
    session: null 
  };
}
