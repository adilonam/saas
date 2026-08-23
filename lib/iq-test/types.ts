export type ImageQuestion = {
  type: "image";
  id: string;
  questionNumber: number;
  /** When false, only option images are shown (e.g. question 38). */
  hasQuestionImage?: boolean;
};

/** Logical / verbal / numerical multiple-choice (exactly 4 options A–D). */
export type LogicQuestion = {
  type: "logic";
  id: string;
  /** Distinct from image question numbers; used in answer-key.json. */
  questionNumber: number;
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
  transitionImage?: string;
};

export type IqQuestion =
  | ImageQuestion
  | LogicQuestion
  | ChoiceQuestion
  | CheckpointQuestion;

export type CognitiveDimension = {
  label: string;
  score: number;
  description: string;
};

export type IqTestResult = {
  iq: number;
  percentile: number;
  dimensions: CognitiveDimension[];
  accuracy: number;
  elapsedSeconds: number;
  correctCount?: number;
  totalScored?: number;
};

export type IqTestAnswers = Record<string, number | string>;

export type IqTestPhase =
  | "chooser"
  | "intro"
  | "quiz"
  | "confirmation"
  | "analyzing"
  | "results";
