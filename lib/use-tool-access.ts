"use client";

/**
 * Free access for all tools - no authentication or subscription required.
 */
export function useToolAccess() {
  const ensureAccess = (): boolean => {
    // All tools are now free - always return true
    return true;
  };

  return { 
    session: null, 
    status: "unauthenticated" as const, 
    ensureAccess 
  };
}
