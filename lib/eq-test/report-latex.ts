import type { EqTestResult } from "@/lib/eq-test/types";

export type EqReportUser = {
  name?: string | null;
  email?: string | null;
};

/** Escape user/score strings for safe inclusion in LaTeX text mode. */
export function escapeLatex(value: string): string {
  return value
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/[{}]/g, (ch) => (ch === "{" ? "\\{" : "\\}"))
    .replace(/\$/g, "\\$")
    .replace(/&/g, "\\&")
    .replace(/#/g, "\\#")
    .replace(/\^/g, "\\textasciicircum{}")
    .replace(/_/g, "\\_")
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/%/g, "\\%")
    .replace(/\r\n|\r|\n/g, " ");
}

function formatElapsed(seconds: number): string {
  const safe = Math.max(0, Math.round(seconds));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m}m ${s}s`;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Build a complete, pdflatex-compatible EQ score report document.
 */
export function buildEqReportLatex(
  result: EqTestResult,
  user: EqReportUser,
  generatedAt: Date = new Date(),
): string {
  const displayName = escapeLatex(
    (user.name && user.name.trim()) || "Subscriber",
  );
  const email = escapeLatex((user.email && user.email.trim()) || "—");
  const dateStr = escapeLatex(formatDate(generatedAt));
  const elapsed = escapeLatex(formatElapsed(result.elapsedSeconds));

  const dimensionRows = result.dimensions
    .map((dim) => {
      const label = escapeLatex(dim.label);
      const desc = escapeLatex(dim.description);
      const score = Math.round(dim.score);
      return `    ${label} & ${score}/99 & ${desc} \\\\`;
    })
    .join("\n\\hline\n");

  const accuracyExtra =
    typeof result.correctCount === "number" &&
    typeof result.totalScored === "number"
      ? ` (${result.correctCount}/${result.totalScored} strongest responses)`
      : "";

  return `\\documentclass[11pt,a4paper]{article}
\\usepackage[margin=1in]{geometry}
\\usepackage{array}
\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{0.6em}

\\begin{document}

\\begin{center}
  {\\LARGE\\bfseries Emotional Intelligence Report}\\\\[0.4em]
  {\\large EQ Profile Summary}
\\end{center}

\\vspace{0.5em}
\\hrule
\\vspace{1em}

\\textbf{Name:} ${displayName}\\\\
\\textbf{Email:} ${email}\\\\
\\textbf{Report date:} ${dateStr}

\\vspace{1em}

\\section*{Overall score}
\\begin{center}
  {\\Huge\\bfseries EQ ${Math.round(result.eq)}}\\\\[0.5em]
  Higher than ${Math.round(result.percentile)}\\% of the population\\\\[0.3em]
  Response quality: ${Math.round(result.accuracy)}\\%${escapeLatex(accuracyExtra)}\\\\
  Time taken: ${elapsed}
\\end{center}

\\section*{EQ dimensions}
\\begin{tabular}{@{}>{\\raggedright\\arraybackslash}p{3.2cm} c >{\\raggedright\\arraybackslash}p{9cm}@{}}
\\hline
\\textbf{Dimension} & \\textbf{Score} & \\textbf{Description} \\\\
\\hline
${dimensionRows}
\\hline
\\end{tabular}

\\vspace{1.5em}
\\hrule
\\vspace{0.8em}
{\\small This report was generated from your completed emotional intelligence assessment. Scores are estimates based on situational judgment responses and are for personal insight only.}

\\end{document}
`;
}
