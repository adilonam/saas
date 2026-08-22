import answerKey from "./answer-key.json";
import { IQ_TEST_QUESTIONS } from "./questions";
import type { CognitiveDimension, IqTestResult } from "./types";

export type AnswerKeyEntry = {
  question: number;
  correctOption: number;
};

export type AnswerKey = {
  version: number;
  optionIndexing: "1-based";
  notes?: string;
  placeholders?: boolean;
  answers: AnswerKeyEntry[];
};

/** Server-side answer key (1-based option numbers matching opt-1…opt-6 filenames). */
export const IQ_ANSWER_KEY = answerKey as AnswerKey;

export type SelectedAnswer = {
  question: number;
  /** 1-based option number (1–6), matching answer-key.json */
  selectedOption: number;
};

function iqToPercentile(iq: number): number {
  if (iq <= 70) return 2;
  if (iq <= 85) return 16;
  if (iq <= 100) return 50;
  if (iq <= 115) return 84;
  if (iq <= 130) return 98;
  return 99;
}

function buildDimensions(
  iq: number,
  elapsedSeconds: number,
): CognitiveDimension[] {
  const base = iq;
  const speedAdj =
    elapsedSeconds < 600 ? 5 : elapsedSeconds < 900 ? 0 : -4;

  return [
    {
      label: "Logical reasoning",
      score: Math.min(99, Math.round(base * 0.98)),
      description: "Pattern recognition and deductive inference",
    },
    {
      label: "Spatial visualization",
      score: Math.min(99, Math.round(base * 1.02)),
      description: "Mental rotation and grid-based reasoning",
    },
    {
      label: "Processing speed",
      score: Math.min(99, Math.round(base * 0.95 + speedAdj)),
      description: "How quickly you evaluated each item",
    },
    {
      label: "Working memory",
      score: Math.min(99, Math.round(base * 0.97)),
      description: "Holding patterns in mind while comparing options",
    },
    {
      label: "Attention & focus",
      score: Math.min(99, Math.round(base * 1.01)),
      description: "Sustained concentration through the full assessment",
    },
  ];
}

/**
 * Score an IQ test against the server answer key.
 * selectedOption must be 1-based (1–6).
 */
export function calculateIqResultFromAnswerKey(
  selected: SelectedAnswer[],
  elapsedSeconds: number,
  key: AnswerKey = IQ_ANSWER_KEY,
): IqTestResult {
  const byQuestion = new Map(
    selected.map((a) => [a.question, a.selectedOption]),
  );

  let correct = 0;
  for (const entry of key.answers) {
    const chosen = byQuestion.get(entry.question);
    if (typeof chosen === "number" && chosen === entry.correctOption) {
      correct += 1;
    }
  }

  const total = key.answers.length;
  const accuracy = total > 0 ? correct / total : 0;
  const avgMinutes = elapsedSeconds / 60;
  const timeBonus =
    avgMinutes < 8 ? 4 : avgMinutes < 12 ? 2 : avgMinutes < 18 ? 0 : -2;

  const raw = 78 + accuracy * 52 + timeBonus;
  const iq = Math.round(Math.min(145, Math.max(72, raw)));

  return {
    iq,
    percentile: iqToPercentile(iq),
    dimensions: buildDimensions(iq, elapsedSeconds),
    accuracy: Math.round(accuracy * 100),
    elapsedSeconds,
    correctCount: correct,
    totalScored: total,
  };
}

const QUESTION_NUMBER_BY_ID = new Map<string, number>(
  IQ_TEST_QUESTIONS.flatMap((q) => {
    if (q.type === "image" || q.type === "logic") {
      return [[q.id, q.questionNumber] as const];
    }
    return [];
  }),
);

/**
 * Convert client quiz answers (0-based option index on keys like "q11" / "logic01")
 * into 1-based SelectedAnswer entries for the API / scorer.
 */
export function clientAnswersToSelected(
  answers: Record<string, number | string>,
): SelectedAnswer[] {
  const out: SelectedAnswer[] = [];
  for (const [id, value] of Object.entries(answers)) {
    if (typeof value !== "number" || !Number.isInteger(value)) continue;
    if (value < 0 || value > 5) continue;

    let questionNum = QUESTION_NUMBER_BY_ID.get(id);
    if (questionNum === undefined) {
      const match = /^q(\d+)$/.exec(id);
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
