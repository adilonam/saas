import type { IqTestAttempt } from "@/prisma/generated/client";
import type { IqTestAnswers, IqTestResult } from "@/lib/iq-test/types";

export const IQ_ATTEMPT_STATUSES = [
  "in_progress",
  "completed",
  "scored",
] as const;

/** Valid values for IqTestAttempt.status (schema stores plain String). */
export type IqAttemptStatus = (typeof IQ_ATTEMPT_STATUSES)[number];

export function isIqAttemptStatus(value: unknown): value is IqAttemptStatus {
  return (
    typeof value === "string" &&
    (IQ_ATTEMPT_STATUSES as readonly string[]).includes(value)
  );
}

/** Client-safe attempt shape (ISO dates, typed JSON fields). */
export type IqAttemptPublic = Pick<
  IqTestAttempt,
  "id" | "elapsedSeconds"
> & {
  status: IqAttemptStatus;
  answers: IqTestAnswers;
  result: IqTestResult | null;
  updatedAt: string;
  createdAt: string;
};

export function serializeAttempt(attempt: IqTestAttempt): IqAttemptPublic {
  const status = isIqAttemptStatus(attempt.status)
    ? attempt.status
    : "in_progress";

  const answers =
    attempt.answers &&
    typeof attempt.answers === "object" &&
    !Array.isArray(attempt.answers)
      ? (attempt.answers as IqTestAnswers)
      : {};

  let result: IqTestResult | null = null;
  if (
    attempt.result &&
    typeof attempt.result === "object" &&
    !Array.isArray(attempt.result)
  ) {
    result = attempt.result as IqTestResult;
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
