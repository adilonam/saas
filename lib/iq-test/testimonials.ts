export type IqTestimonial = {
  name: string;
  age: number;
  location: string;
  flag: string;
  quote: string;
};

export const IQ_TESTIMONIALS: IqTestimonial[] = [
  {
    name: "Sophie",
    age: 39,
    location: "Paris",
    flag: "🇫🇷",
    quote:
      "The breakdown by cognitive area was surprisingly detailed. Worth every minute I spent on it.",
  },
  {
    name: "Marcus",
    age: 27,
    location: "Toronto",
    flag: "🇨🇦",
    quote:
      "I liked the mix of visual puzzles and reflection questions. Felt more thorough than quick online quizzes.",
  },
  {
    name: "Elena",
    age: 34,
    location: "Madrid",
    flag: "🇪🇸",
    quote:
      "The progress screen built real anticipation. My report matched how I felt I performed on the puzzles.",
  },
];

export const SOCIAL_PROOF_NAMES = [
  { name: "Lucas", score: 136 },
  { name: "Juliette", score: 77 },
  { name: "Amir", score: 118 },
  { name: "Priya", score: 104 },
  { name: "Noah", score: 122 },
];
