import type { ImageQuestion, IqQuestion, LogicQuestion } from "./types";

/** Image puzzle — correct answers live in answer-key.json (scored server-side). */
function imageQ(
  questionNumber: number,
  hasQuestionImage = questionNumber !== 38,
): ImageQuestion {
  return {
    type: "image",
    id: `q${questionNumber}`,
    questionNumber,
    hasQuestionImage,
  };
}

/** Logical MCQ — scored via answer-key.json using questionNumber (101–110). */
function logicQ(
  n: number,
  question: string,
  options: [string, string, string, string],
): LogicQuestion {
  return {
    type: "logic",
    id: `logic${String(n).padStart(2, "0")}`,
    questionNumber: 100 + n,
    question,
    options,
  };
}

export const IQ_TEST_QUESTIONS: IqQuestion[] = [
  imageQ(11),
  logicQ(
    1,
    "Which number replaces the question mark to complete the sequence?\n2, 6, 12, 20, 30, ?",
    ["38", "40", "42", "44"],
  ),
  imageQ(12),
  imageQ(13),
  logicQ(
    2,
    "Book is to Reading as Fork is to:",
    ["Drawing", "Writing", "Eating", "Cooking"],
  ),
  imageQ(14),
  {
    type: "checkpoint",
    id: "c01",
    title: "Great progress!",
    message:
      "You're moving through the visual reasoning section faster than most test-takers. Keep going — the hardest puzzles are still ahead.",
    highlight: "Top 20% for pace",
    transitionImage: "/images/iq-test/transition-window-1.png",
  },
  imageQ(15),
  imageQ(16),
  logicQ(
    3,
    "Which word does not belong with the others?",
    ["Apple", "Banana", "Carrot", "Grape"],
  ),
  imageQ(17),
  imageQ(18),
  logicQ(
    4,
    "What letter comes next in this series?\nA, C, F, J, O, ?",
    ["S", "T", "U", "V"],
  ),
  imageQ(19),
  {
    type: "checkpoint",
    id: "c02",
    title: "Halfway there!",
    message:
      "Your consistency on visual puzzles is strong. Only a few more reasoning blocks before your cognitive profile is complete.",
    highlight: "Strong spatial reasoning",
    transitionImage: "/images/iq-test/transition-window-2.png",
  },
  imageQ(20),
  imageQ(21),
  logicQ(
    5,
    "If 20% of a number is 50, what is 40% of that same number?",
    ["80", "100", "120", "200"],
  ),
  imageQ(22),
  imageQ(23),
  logicQ(
    6,
    "Which number replaces the question mark?\n3, 9, 27, 81, ?",
    ["162", "216", "243", "324"],
  ),
  imageQ(24),
  {
    type: "checkpoint",
    id: "c03",
    title: "Almost done!",
    message:
      "Just a few questions left. Your persistence puts you ahead of most people who abandon tests like this.",
    highlight: "Top 15% for endurance",
    transitionImage: "/images/iq-test/transition-window-3.png",
  },
  imageQ(25),
  imageQ(26),
  logicQ(
    7,
    "Hot is to Cold as Day is to:",
    ["Bright", "Sun", "Night", "Morning"],
  ),
  imageQ(27),
  logicQ(
    8,
    "Which shape does not belong with the others?",
    ["Square", "Circle", "Triangle", "Cube"],
  ),
  imageQ(29),
  imageQ(30),
  logicQ(
    9,
    "Which word does not belong with the others?",
    ["Cat", "Dog", "Bird", "Car"],
  ),
  {
    type: "checkpoint",
    id: "c04",
    title: "Final stretch!",
    message:
      "You're in the home stretch. Finish strong — your personalized IQ report is almost ready.",
    highlight: "Final reasoning block",
    transitionImage: "/images/iq-test/transition-window-4.png",
  },
  imageQ(31),
  logicQ(
    10,
    "A recipe uses 2 cups of flour for every 3 cups of sugar. How many cups of sugar are needed for 6 cups of flour?",
    ["6", "8", "9", "12"],
  ),
  imageQ(33),
  imageQ(34),
  imageQ(38, false),
  {
    type: "choice",
    id: "d01",
    question: "How old are you?",
    options: ["Under 18", "18–29", "30–44", "45–60", "60+"],
  },
];

export const IQ_TEST_TOTAL = IQ_TEST_QUESTIONS.length;

export const IQ_IMAGE_QUESTION_NUMBERS = [
  11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 29, 30,
  31, 33, 34, 38,
] as const;

export const IQ_LOGIC_QUESTION_NUMBERS = [
  101, 102, 103, 104, 105, 106, 107, 108, 109, 110,
] as const;
