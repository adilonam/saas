export type EqTestimonial = {
  name: string;
  age: number;
  location: string;
  flag: string;
  quote: string;
};

export const EQ_TESTIMONIALS: EqTestimonial[] = [
  {
    name: "Amelia",
    age: 32,
    location: "London",
    flag: "🇬🇧",
    quote:
      "The scenarios felt realistic — like real workplace and relationship moments. The domain breakdown was especially useful.",
  },
  {
    name: "Diego",
    age: 41,
    location: "Mexico City",
    flag: "🇲🇽",
    quote:
      "I expected fluff, but the empathy and self-regulation items made me rethink how I handle conflict.",
  },
  {
    name: "Yuki",
    age: 28,
    location: "Tokyo",
    flag: "🇯🇵",
    quote:
      "Clear report and practical framing. Helped me see where I already do well and where to improve.",
  },
];

export const SOCIAL_PROOF_NAMES = [
  { name: "Hannah", score: 128 },
  { name: "Omar", score: 92 },
  { name: "Chloe", score: 114 },
  { name: "Kenji", score: 105 },
  { name: "Sofia", score: 121 },
];
