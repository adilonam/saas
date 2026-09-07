import type { DnaTestAttempt } from "@/prisma/generated/client";
import type { DnaOrigin } from "@/lib/dna-test/normalize-origins";
import type { DnaTestResult } from "@/lib/dna-test/types";

export const DNA_ATTEMPT_STATUSES = [
  "in_progress",
  "completed",
  "scored",
] as const;

/** Valid values for DnaTestAttempt.status (schema stores plain String). */
export type DnaAttemptStatus = (typeof DNA_ATTEMPT_STATUSES)[number];

export function isDnaAttemptStatus(value: unknown): value is DnaAttemptStatus {
  return (
    typeof value === "string" &&
    (DNA_ATTEMPT_STATUSES as readonly string[]).includes(value)
  );
}

function isDnaOrigin(value: unknown): value is DnaOrigin {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.country === "string" &&
    typeof row.countryCode === "string" &&
    typeof row.percentage === "number"
  );
}

export function parseDnaResult(value: unknown): DnaTestResult | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const raw = value as Record<string, unknown>;
  if (!Array.isArray(raw.origins)) return null;
  const origins = raw.origins.filter(isDnaOrigin);
  if (origins.length === 0) return null;
  return { origins };
}

/** True when the attempt has selfie bytes stored in Postgres. */
export function attemptHasSelfie(
  attempt: Pick<DnaTestAttempt, "selfie">,
): boolean {
  return Boolean(attempt.selfie && attempt.selfie.length > 0);
}

/**
 * Build a data URL from stored selfie bytes (for one-off use; prefer the
 * dedicated `/selfie` route for the results UI).
 */
export function selfieBytesToDataUrl(
  bytes: Uint8Array,
  mimeType: string,
): string {
  return `data:${mimeType};base64,${Buffer.from(bytes).toString("base64")}`;
}

/** Client-safe attempt shape (ISO dates; no raw selfie bytes in JSON). */
export type DnaAttemptPublic = Pick<DnaTestAttempt, "id"> & {
  status: DnaAttemptStatus;
  result: DnaTestResult | null;
  /** Whether selfie bytes exist — fetch via GET .../attempts/[id]/selfie. */
  hasSelfie: boolean;
  updatedAt: string;
  createdAt: string;
};

export function serializeAttempt(attempt: DnaTestAttempt): DnaAttemptPublic {
  const status = isDnaAttemptStatus(attempt.status)
    ? attempt.status
    : "in_progress";

  return {
    id: attempt.id,
    status,
    result: parseDnaResult(attempt.result),
    hasSelfie: attemptHasSelfie(attempt),
    updatedAt: attempt.updatedAt.toISOString(),
    createdAt: attempt.createdAt.toISOString(),
  };
}
