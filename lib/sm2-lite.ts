/** Minimal SM-2 scheduler (interval in days, ease factor ef). */

export type Sm2State = {
  ef: number;
  interval: number;
  reps: number;
};

export const SM2_INITIAL: Sm2State = { ef: 2.5, interval: 0, reps: 0 };

/**
 * @param quality 0–5 (Anki-style: 0–2 fail, 3+ pass)
 * @returns Updated state; `interval` is days until next successful review step.
 */
export function sm2Schedule(quality: number, prev: Sm2State): Sm2State {
  const q = Math.min(5, Math.max(0, Math.round(quality)));
  let ef = prev.ef;
  let interval = prev.interval;
  let reps = prev.reps;

  if (q < 3) {
    reps = 0;
    interval = 1;
  } else {
    if (reps === 0) {
      interval = 1;
    } else if (reps === 1) {
      interval = 6;
    } else {
      interval = Math.max(1, Math.round(prev.interval * ef));
    }
    reps += 1;
  }

  ef += 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02);
  if (ef < 1.3) ef = 1.3;

  return { ef, interval, reps };
}

export function addDays(d: Date, days: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}
