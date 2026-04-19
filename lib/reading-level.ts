/** Rough syllable count for English-ish tokens (educational heuristic). */
export function estimateSyllablesInWord(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!w) return 0;
  if (w.length <= 3) return 1;
  const vowels = w.match(/[aeiouy]+/g);
  let n = vowels ? vowels.length : 1;
  if (w.endsWith("e")) n -= 1;
  if (w.endsWith("le") && w.length > 2 && !/[aeiouy]/.test(w[w.length - 3] ?? "")) n += 1;
  return Math.max(1, n);
}

export function tokenizeWords(text: string): string[] {
  return text
    .trim()
    .split(/[\s\u00A0]+/)
    .map((t) => t.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, ""))
    .filter(Boolean);
}

export function splitSentences(text: string): string[] {
  const parts = text.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);
  if (parts.length === 0 && text.trim()) return [text.trim()];
  return parts;
}

export type ReadingLevelStats = {
  words: number;
  sentences: number;
  syllables: number;
  avgWordsPerSentence: number;
  avgSyllablesPerWord: number;
  /** Flesch Reading Ease, roughly -20–100 (higher = easier). */
  fleschReadingEase: number | null;
  /** Approximate U.S. grade level from Flesch–Kincaid (when sentences > 0). */
  fleschKincaidGrade: number | null;
};

export function analyzeReadingLevel(text: string): ReadingLevelStats {
  const trimmed = text.trim();
  const sentences = splitSentences(trimmed);
  const sentenceCount = Math.max(1, sentences.length);
  const words = tokenizeWords(trimmed);
  const wordCount = words.length;
  const syllables = words.reduce((sum, w) => sum + estimateSyllablesInWord(w), 0);

  const avgWordsPerSentence = wordCount / sentenceCount;
  const avgSyllablesPerWord = wordCount > 0 ? syllables / wordCount : 0;

  let fleschReadingEase: number | null = null;
  let fleschKincaidGrade: number | null = null;

  if (wordCount >= 10 && sentenceCount >= 2) {
    fleschReadingEase =
      206.835 - 1.015 * (wordCount / sentenceCount) - 84.6 * (syllables / wordCount);
    fleschKincaidGrade =
      0.39 * (wordCount / sentenceCount) + 11.8 * (syllables / wordCount) - 15.59;
  }

  return {
    words: wordCount,
    sentences: sentenceCount,
    syllables,
    avgWordsPerSentence,
    avgSyllablesPerWord,
    fleschReadingEase,
    fleschKincaidGrade,
  };
}
