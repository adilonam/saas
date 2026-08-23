export type EqDomain =
  | "self_awareness"
  | "self_regulation"
  | "empathy"
  | "social_skills"
  | "motivation";

/** Situational judgment / scenario MCQ (exactly 4 options A–D). */
export type ScenarioQuestion = {
  type: "scenario";
  id: string;
  questionNumber: number;
  domain: EqDomain;
  question: string;
  options: [string, string, string, string];
};

export type ChoiceQuestion = {
  type: "choice";
  id: string;
  question: string;
  options: string[];
};

export type CheckpointQuestion = {
  type: "checkpoint";
  id: string;
  title: string;
  message: string;
  highlight?: string;
};

export type EqQuestion =
  | ScenarioQuestion
  | ChoiceQuestion
  | CheckpointQuestion;

export type EqDimension = {
  label: string;
  score: number;
  description: string;
  domain: EqDomain;
};

export type EqTestResult = {
  eq: number;
  percentile: number;
  dimensions: EqDimension[];
  accuracy: number;
  elapsedSeconds: number;
  correctCount?: number;
  totalScored?: number;
};

export type EqTestAnswers = Record<string, number | string>;

export type EqTestPhase =
  | "chooser"
  | "intro"
  | "quiz"
  | "confirmation"
  | "analyzing"
  | "results";
