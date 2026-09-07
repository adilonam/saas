import {
  clearStoredAttemptId,
  getStoredAttemptId,
  setStoredAttemptId,
} from "@/lib/test-attempt-storage";

type AttemptWithId = { id: string };

/**
 * After optional attach-on-login, resolve which attempt to show:
 * 1) localStorage attempt id (fetch / claim)
 * 2) else latest from DB
 * 3) else null → start UI
 *
 * Does not write localStorage for the DB-latest fallback — only create/complete
 * (and confirming a stored id) should set the key.
 */
export async function resolveStoredOrLatestAttempt<T extends AttemptWithId>(opts: {
  storageKey: string;
  authenticated: boolean;
  attachUrl: string;
  latestUrl: string;
  attemptUrl: (id: string) => string;
}): Promise<T | null> {
  const storedId = getStoredAttemptId(opts.storageKey);

  if (opts.authenticated) {
    await fetch(opts.attachUrl, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(storedId ? { attemptId: storedId } : {}),
    }).catch(() => null);
  }

  if (storedId) {
    const byId = await fetch(opts.attemptUrl(storedId), {
      credentials: "include",
    }).catch(() => null);
    if (byId?.ok) {
      const data = (await byId.json()) as { attempt: T | null };
      if (data.attempt) {
        setStoredAttemptId(opts.storageKey, data.attempt.id);
        return data.attempt;
      }
    }
    // Stale / unauthorized id — drop so we fall back to latest.
    clearStoredAttemptId(opts.storageKey);
  }

  const latestRes = await fetch(opts.latestUrl, {
    credentials: "include",
  }).catch(() => null);
  if (!latestRes?.ok) return null;

  const latestData = (await latestRes.json()) as { attempt: T | null };
  return latestData.attempt ?? null;
}
