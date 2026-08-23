import type { EqTestAttempt } from "@/prisma/generated/client";
import type { EqTestAnswers, EqTestResult } from "@/lib/eq-test/types";

export const EQ_ATTEMPT_STATUSES = [
  "in_progress",
  "completed",
  "scored",
] as const;

/** Valid values for EqTestAttempt.status (schema stores plain String). */
export type EqAttemptStatus = (typeof EQ_ATTEMPT_STATUSES)[number];

export function isEqAttemptStatus(value: unknown): value is EqAttemptStatus {
  return (
    typeof value === "string" &&
    (EQ_ATTEMPT_STATUSES as readonly string[]).includes(value)
  );
}

/** Client-safe attempt shape (ISO dates, typed JSON fields). */
export type EqAttemptPublic = Pick<
  EqTestAttempt,
  "id" | "elapsedSeconds"
> & {
  status: EqAttemptStatus;
  answers: EqTestAnswers;
  result: EqTestResult | null;
  updatedAt: string;
  createdAt: string;
};

export function serializeAttempt(attempt: EqTestAttempt): EqAttemptPublic {
  const status = isEqAttemptStatus(attempt.status)
    ? attempt.status
    : "in_progress";

  const answers =
    attempt.answers &&
    typeof attempt.answers === "object" &&
    !Array.isArray(attempt.answers)
      ? (attempt.answers as EqTestAnswers)
      : {};

  let result: EqTestResult | null = null;
  if (
    attempt.result &&
    typeof attempt.result === "object" &&
    !Array.isArray(attempt.result)
  ) {
    result = attempt.result as EqTestResult;
  }

  return {
    id: attempt.id,
    status,
    answers,
    elapsedSeconds: attempt.elapsedSeconds,
    result,
    updatedAt: attempt.updatedAt.toISOString(),
    createdAt: attempt.createdAt.toISOString(),
  };
}
