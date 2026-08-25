/**
 * Browser localStorage keys for guest→login attempt restore.
 * Overwrite when a new attempt is created; keep until then.
 */
export const DNA_TEST_ATTEMPT_STORAGE_KEY = "dna_test_attempt_id";
export const IQ_TEST_ATTEMPT_STORAGE_KEY = "iq_test_attempt_id";
export const EQ_TEST_ATTEMPT_STORAGE_KEY = "eq_test_attempt_id";

export function getStoredAttemptId(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(key);
    if (!value || value.length < 8) return null;
    return value;
  } catch {
    return null;
  }
}

export function setStoredAttemptId(key: string, id: string): void {
  if (typeof window === "undefined" || !id) return;
  try {
    window.localStorage.setItem(key, id);
  } catch {
    /* ignore quota / private mode */
  }
}

export function clearStoredAttemptId(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}
