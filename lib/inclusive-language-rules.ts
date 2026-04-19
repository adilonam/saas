export type InclusiveSeverity = "suggest" | "review";

export type InclusiveFinding = {
  /** 1-based line when input has newlines; else 1 */
  line: number;
  snippet: string;
  message: string;
  suggestion: string;
  severity: InclusiveSeverity;
};

type Rule = {
  re: RegExp;
  message: string;
  suggestion: string;
  severity: InclusiveSeverity;
};

/** Small starter rule set — not exhaustive; pairs with optional AI pass. */
const RULES: Rule[] = [
  {
    re: /\b(manpower|mankind)\b/gi,
    message: "Gender-neutral wording is often clearer for mixed audiences.",
    suggestion: "workforce, people, humanity",
    severity: "suggest",
  },
  {
    re: /\b(crazy|insane|nuts)\b/gi,
    message: "These terms can trivialize mental health conditions.",
    suggestion: "intense, surprising, hard to believe, chaotic",
    severity: "suggest",
  },
  {
    re: /\b(lame)\b/gi,
    message: "Historically used as a slur related to disability.",
    suggestion: "disappointing, weak, unconvincing",
    severity: "suggest",
  },
  {
    re: /\b(blind\s+(?:review|test|study))\b/gi,
    message: '"Blind" as metaphor can be exclusionary.',
    suggestion: "masked review, anonymous review, double-masked",
    severity: "suggest",
  },
  {
    re: /\b(whitelist|blacklist)\b/gi,
    message: "Color-coded allow/deny lists are clearer and more inclusive.",
    suggestion: "allowlist / denylist or permitted / blocked",
    severity: "review",
  },
  {
    re: /\b(master|slave)\b/gi,
    message: "In systems text, prefer neutral primary/replica or leader/follower language.",
    suggestion: "primary / replica, leader / follower, controller / worker",
    severity: "review",
  },
  {
    re: /\bguys\b/gi,
    message: '"Guys" is often read as male-default in professional writing.',
    suggestion: "everyone, folks, team, y'all",
    severity: "suggest",
  },
];

function lineOfIndex(text: string, index: number): number {
  if (!text) return 1;
  return (text.slice(0, index).match(/\n/g) || []).length + 1;
}

export function scanInclusiveLanguage(text: string): InclusiveFinding[] {
  const findings: InclusiveFinding[] = [];
  for (const rule of RULES) {
    rule.re.lastIndex = 0;
    let m: RegExpExecArray | null;
    const re = new RegExp(rule.re.source, rule.re.flags);
    while ((m = re.exec(text)) !== null) {
      findings.push({
        line: lineOfIndex(text, m.index),
        snippet: m[0],
        message: rule.message,
        suggestion: rule.suggestion,
        severity: rule.severity,
      });
      if (m[0].length === 0) re.lastIndex++;
    }
  }
  findings.sort((a, b) => a.line - b.line);
  return findings;
}
