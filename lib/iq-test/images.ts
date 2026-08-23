const IQ_TEST_IMAGE_BASE = "/images/iq-test";

export function iqQuestionImage(questionNumber: number): string {
  return `${IQ_TEST_IMAGE_BASE}/iq-q${questionNumber}-question.png`;
}

export function iqOptionImage(questionNumber: number, option: number): string {
  if (questionNumber === 31 && option === 2) {
    return `${IQ_TEST_IMAGE_BASE}/iq-q31-opt-2-v2.png`;
  }
  return `${IQ_TEST_IMAGE_BASE}/iq-q${questionNumber}-opt-${option}.png`;
}

export function iqTransitionImage(window: 1 | 2 | 3 | 4): string {
  return `${IQ_TEST_IMAGE_BASE}/transition-window-${window}.png`;
}

export const IQ_TEST_GUIDELINES_IMAGE = `${IQ_TEST_IMAGE_BASE}/test-guidelines.png`;

export const IQ_UNIVERSITY_LOGOS = {
  harvard: `${IQ_TEST_IMAGE_BASE}/harvard.png`,
  berkeley: `${IQ_TEST_IMAGE_BASE}/berkeley.png`,
  oxford: `${IQ_TEST_IMAGE_BASE}/oxford.png`,
} as const;

export const IQ_OPTION_COUNT = 6;
