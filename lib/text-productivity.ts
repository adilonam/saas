export type CaseMode = "upper" | "lower" | "title" | "sentence";

export function countTextStats(text: string) {
  const trimmed = text.trim();
  const words = trimmed.length === 0 ? [] : trimmed.split(/\s+/);
  const wordCount = words.length;
  const charsWithSpaces = text.length;
  const charsNoSpaces = text.replace(/\s/g, "").length;
  const rawLines = text.split(/\r\n|\r|\n/);
  const lines = text.length === 0 ? 0 : rawLines.length;
  const nonEmptyLines = rawLines.filter((l) => l.trim().length > 0).length;
  let paragraphs = 0;
  if (trimmed.length > 0) {
    paragraphs = trimmed.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length;
    if (paragraphs === 0) paragraphs = 1;
  }
  return {
    wordCount,
    charsWithSpaces,
    charsNoSpaces,
    lines,
    nonEmptyLines,
    paragraphs,
  };
}

export function estimateReadingTime(text: string, wordsPerMinute: number) {
  const trimmed = text.trim();
  const words = trimmed.length === 0 ? 0 : trimmed.split(/\s+/).length;
  const wpm = Math.max(1, Math.min(600, wordsPerMinute));
  const minutesExact = words / wpm;
  const totalSeconds = Math.max(0, Math.ceil(minutesExact * 60));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return { words, wordsPerMinute: wpm, minutes, seconds, totalSeconds };
}

export function convertTextCase(text: string, mode: CaseMode): string {
  switch (mode) {
    case "upper":
      return text.toUpperCase();
    case "lower":
      return text.toLowerCase();
    case "title":
      return text.replace(/\S+/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
    case "sentence": {
      const lower = text.toLowerCase();
      return lower.replace(/(^\s*[a-z])|([.!?]\s+[a-z])/g, (m) => m.toUpperCase());
    }
    default:
      return text;
  }
}

export function removeDuplicateLines(
  text: string,
  opts: { trimEach: boolean; ignoreCase: boolean },
): string {
  const lines = text.split(/\r\n|\r|\n/);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const line of lines) {
    const keyRaw = opts.trimEach ? line.trim() : line;
    const key = opts.ignoreCase ? keyRaw.toLowerCase() : keyRaw;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(line);
  }
  return out.join("\n");
}

export type DiffLine = { type: "equal" | "insert" | "delete"; content: string };

export function lineBasedDiff(left: string, right: string): DiffLine[] {
  const a = left.split(/\r\n|\r|\n/);
  const b = right.split(/\r\n|\r|\n/);
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array<number>(n + 1).fill(0),
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
      else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  const out: DiffLine[] = [];
  let i = m;
  let j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      out.unshift({ type: "equal", content: a[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      out.unshift({ type: "insert", content: b[j - 1] });
      j--;
    } else if (i > 0) {
      out.unshift({ type: "delete", content: a[i - 1] });
      i--;
    }
  }
  return out;
}

const UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const LOWER = "abcdefghijkmnopqrstuvwxyz";
const NUM = "23456789";
const SYM = "!@#$%&*-_=+?";

function randomInt(max: number): number {
  if (typeof globalThis.crypto?.getRandomValues === "function") {
    const buf = new Uint32Array(1);
    globalThis.crypto.getRandomValues(buf);
    return buf[0] % max;
  }
  return Math.floor(Math.random() * max);
}

function pick(pool: string): string {
  return pool[randomInt(pool.length)] ?? "";
}

export type PasswordGenOptions = {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
};

export function generatePassword(opts: PasswordGenOptions): string {
  const length = Math.max(8, Math.min(128, Math.floor(opts.length)));
  let pool = "";
  const required: string[] = [];
  if (opts.uppercase) {
    pool += UPPER;
    required.push(pick(UPPER));
  }
  if (opts.lowercase) {
    pool += LOWER;
    required.push(pick(LOWER));
  }
  if (opts.numbers) {
    pool += NUM;
    required.push(pick(NUM));
  }
  if (opts.symbols) {
    pool += SYM;
    required.push(pick(SYM));
  }
  if (pool.length === 0) {
    throw new Error("Select at least one character set");
  }
  const chars: string[] = [...required];
  while (chars.length < length) {
    chars.push(pick(pool));
  }
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j]!, chars[i]!];
  }
  return chars.join("");
}

export type StrengthResult = {
  score: number;
  label: "Very weak" | "Weak" | "Fair" | "Good" | "Strong";
  tips: string[];
};

export function analyzePasswordStrength(password: string): StrengthResult {
  const tips: string[] = [];
  let score = 0;

  const len = password.length;
  if (len === 0) {
    return { score: 0, label: "Very weak", tips: ["Enter a password to analyze"] };
  }
  if (len < 8) tips.push("Use at least 8 characters");
  if (len < 12) tips.push("12+ characters is stronger");
  score += Math.min(30, len * 2);

  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNum = /\d/.test(password);
  const hasSym = /[^A-Za-z0-9]/.test(password);
  const classes = [hasLower, hasUpper, hasNum, hasSym].filter(Boolean).length;
  score += classes * 12;
  if (!hasLower) tips.push("Add lowercase letters");
  if (!hasUpper) tips.push("Add uppercase letters");
  if (!hasNum) tips.push("Add numbers");
  if (!hasSym) tips.push("Add symbols");

  if (/(.)\1{2,}/.test(password)) {
    score -= 10;
    tips.push("Avoid repeated characters");
  }
  if (/012|123|234|345|456|567|678|789|890|abc|bcd/i.test(password)) {
    score -= 8;
    tips.push("Avoid simple sequences");
  }

  const common = /^(password|123456|qwerty|admin|letmein|welcome)/i;
  if (common.test(password)) {
    score -= 25;
    tips.push("Avoid common passwords");
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  let label: StrengthResult["label"] = "Very weak";
  if (score >= 80) label = "Strong";
  else if (score >= 60) label = "Good";
  else if (score >= 40) label = "Fair";
  else if (score >= 20) label = "Weak";

  const uniqueTips = [...new Set(tips)];
  return { score, label, tips: uniqueTips.slice(0, 6) };
}
