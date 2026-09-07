import { cookies } from "next/headers";
import { randomUUID } from "crypto";

export const DNA_TEST_GUEST_COOKIE = "dna_test_guest";

/** 1 year */
const GUEST_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/**
 * Read or create the anonymous DNA-test guest token (httpOnly cookie).
 * Prefer this on API routes that create/update attempts without auth.
 */
export async function getOrCreateGuestToken(): Promise<string> {
  const jar = await cookies();
  const existing = jar.get(DNA_TEST_GUEST_COOKIE)?.value;
  if (existing && existing.length >= 16) {
    return existing;
  }

  const token = randomUUID();
  jar.set(DNA_TEST_GUEST_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: GUEST_COOKIE_MAX_AGE,
  });
  return token;
}

/** Read guest token if present (does not create). */
export async function getGuestToken(): Promise<string | null> {
  const jar = await cookies();
  const value = jar.get(DNA_TEST_GUEST_COOKIE)?.value;
  if (!value || value.length < 16) return null;
  return value;
}
