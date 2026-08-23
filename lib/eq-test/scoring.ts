import answerKey from "./answer-key.json";
import {
  EQ_DOMAIN_DESCRIPTIONS,
  EQ_DOMAIN_LABELS,
  EQ_TEST_QUESTIONS,
} from "./questions";
import type { EqDimension, EqDomain, EqTestResult } from "./types";

export type AnswerKeyEntry = {
  question: number;
  domain: EqDomain;
  /** Scores for options A–D (index 0 = option 1). Values 0–3. */
  optionScores: [number, number, number, number];
};

export type AnswerKey = {
  version: number;
  optionIndexing: "1-based";
  notes?: string;
  answers: AnswerKeyEntry[];
};

/** Server-side answer key (1-based option numbers matching A–D). */
export const EQ_ANSWER_KEY = answerKey as AnswerKey;

export type SelectedAnswer = {
  question: number;
  /** 1-based option number (1–4) */
  selectedOption: number;
};

function eqToPercentile(eq: number): number {
  if (eq <= 70) return 5;
  if (eq <= 85) return 20;
  if (eq <= 100) return 50;
  if (eq <= 115) return 80;
  if (eq <= 130) return 95;
  return 99;
}

function buildDimensions(
  domainTotals: Record<EqDomain, { earned: number; max: number }>,
): EqDimension[] {
  const domains: EqDomain[] = [
    "self_awareness",
    "self_regulation",
    "empathy",
    "social_skills",
    "motivation",
  ];

  return domains.map((domain) => {
    const { earned, max } = domainTotals[domain];
    const ratio = max > 0 ? earned / max : 0;
    const score = Math.min(99, Math.round(ratio * 99));
    return {
      label: EQ_DOMAIN_LABELS[domain],
      score,
      description: EQ_DOMAIN_DESCRIPTIONS[domain],
      domain,
    };
  });
}

/**
 * Score an EQ test against the server answer key.
 * selectedOption must be 1-based (1–4).
 */
export function calculateEqResultFromAnswerKey(
  selected: SelectedAnswer[],
  elapsedSeconds: number,
  key: AnswerKey = EQ_ANSWER_KEY,
): EqTestResult {
  const byQuestion = new Map(
    selected.map((a) => [a.question, a.selectedOption]),
  );

  const domainTotals: Record<EqDomain, { earned: number; max: number }> = {
    self_awareness: { earned: 0, max: 0 },
    self_regulation: { earned: 0, max: 0 },
    empathy: { earned: 0, max: 0 },
    social_skills: { earned: 0, max: 0 },
    motivation: { earned: 0, max: 0 },
  };

  let earnedTotal = 0;
  let maxTotal = 0;
  let strongCount = 0;

  for (const entry of key.answers) {
    const maxForQ = Math.max(...entry.optionScores);
    domainTotals[entry.domain].max += maxForQ;
    maxTotal += maxForQ;

    const chosen = byQuestion.get(entry.question);
    if (typeof chosen !== "number" || chosen < 1 || chosen > 4) continue;

    const points = entry.optionScores[chosen - 1] ?? 0;
    domainTotals[entry.domain].earned += points;
    earnedTotal += points;
    if (points === maxForQ) strongCount += 1;
  }

  const accuracy = maxTotal > 0 ? earnedTotal / maxTotal : 0;
  const avgMinutes = elapsedSeconds / 60;
  const timeBonus =
    avgMinutes < 8 ? 3 : avgMinutes < 14 ? 1 : avgMinutes < 22 ? 0 : -2;

  const raw = 72 + accuracy * 58 + timeBonus;
  const eq = Math.round(Math.min(145, Math.max(55, raw)));

  return {
    eq,
    percentile: eqToPercentile(eq),
    dimensions: buildDimensions(domainTotals),
    accuracy: Math.round(accuracy * 100),
    elapsedSeconds,
    correctCount: strongCount,
    totalScored: key.answers.length,
  };
}

const QUESTION_NUMBER_BY_ID = new Map<string, number>(
  EQ_TEST_QUESTIONS.flatMap((q) => {
    if (q.type === "scenario") {
      return [[q.id, q.questionNumber] as const];
    }
    return [];
  }),
);

/**
 * Convert client quiz answers (0-based option index on keys like "eq01")
 * into 1-based SelectedAnswer entries for the API / scorer.
 */
export function clientAnswersToSelected(
  answers: Record<string, number | string>,
): SelectedAnswer[] {
  const out: SelectedAnswer[] = [];
  for (const [id, value] of Object.entries(answers)) {
    if (typeof value !== "number" || !Number.isInteger(value)) continue;
    if (value < 0 || value > 3) continue;

    let questionNum = QUESTION_NUMBER_BY_ID.get(id);
    if (questionNum === undefined) {
      const match = /^eq(\d+)$/.exec(id);
      if (!match) continue;
      questionNum = Number(match[1]);
    }

    out.push({
      question: questionNum,
      selectedOption: value + 1,
    });
  }
  return out;
}
