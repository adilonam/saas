export const CONVENTIONAL_TYPES = [
  "feat",
  "fix",
  "docs",
  "style",
  "refactor",
  "perf",
  "test",
  "build",
  "ci",
  "chore",
  "revert",
] as const;

export type ParsedCommit = {
  raw: string;
  type: string;
  scope?: string;
  breaking: boolean;
  subject: string;
};

const HASH_PREFIX = /^[a-f0-9]{7,40}\s+/i;

/** Strip common one-line git log prefixes before the conventional header. */
function stripLogNoise(line: string): string {
  let s = line.trim();
  s = s.replace(HASH_PREFIX, "");
  s = s.replace(/^\([^)]+\)\s+/, "");
  s = s.replace(/^\[[^\]]+]\s+/, "");
  return s.trim();
}

/**
 * Parse a single line like `feat(api): add endpoint` or `fix!: crash on load`.
 * Returns null if the line does not look like a conventional commit header.
 */
export function parseConventionalLine(line: string): ParsedCommit | null {
  const rest = stripLogNoise(line);
  const m = rest.match(/^([a-z]+)(?:\(([^)\s]+)\))?(!)?:\s*(.+)$/i);
  if (!m) return null;
  const [, type, scope, bang, subject] = m;
  if (!type || !subject) return null;
  return {
    raw: line.trim(),
    type: type.toLowerCase(),
    scope: scope || undefined,
    breaking: bang === "!",
    subject: subject.trim(),
  };
}

export function parseConventionalBlock(text: string): ParsedCommit[] {
  const out: ParsedCommit[] = [];
  for (const line of text.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const p = parseConventionalLine(t);
    if (p) out.push(p);
  }
  return out;
}

export type ChangelogGroup = {
  type: string;
  title: string;
  items: string[];
};

const TYPE_TITLES: Record<string, string> = {
  feat: "Features",
  fix: "Bug fixes",
  perf: "Performance",
  refactor: "Refactors",
  docs: "Documentation",
  style: "Styles",
  test: "Tests",
  build: "Build",
  ci: "CI",
  chore: "Chores",
  revert: "Reverts",
};

export function groupCommitsForChangelog(commits: ParsedCommit[]): ChangelogGroup[] {
  const map = new Map<string, string[]>();
  for (const c of commits) {
    const label = c.breaking ? `${c.subject} (breaking)` : c.subject;
    const prefix = c.scope ? `**${c.scope}:** ${label}` : label;
    const list = map.get(c.type) ?? [];
    list.push(prefix);
    map.set(c.type, list);
  }
  const known = new Set<string>(CONVENTIONAL_TYPES as unknown as string[]);
  const extra = [...map.keys()].filter((k) => !known.has(k)).sort();
  const order = [...CONVENTIONAL_TYPES, ...extra];
  const seen = new Set<string>();
  const groups: ChangelogGroup[] = [];
  for (const type of order) {
    if (seen.has(type)) continue;
    const items = map.get(type);
    if (!items?.length) continue;
    seen.add(type);
    groups.push({
      type,
      title: TYPE_TITLES[type] ?? type.charAt(0).toUpperCase() + type.slice(1),
      items: [...items],
    });
  }
  return groups;
}

export function formatChangelogMarkdown(
  groups: ChangelogGroup[],
  opts: { version?: string; date?: string } = {},
): string {
  const { version = "Unreleased", date } = opts;
  const head =
    date !== undefined
      ? `## [${version}] - ${date}`
      : `## [${version}]`;
  const body = groups
    .map((g) => `### ${g.title}\n\n${g.items.map((i) => `- ${i}`).join("\n")}`)
    .join("\n\n");
  return `${head}\n\n${body}\n`;
}

export type SemverSuggestion = {
  current: string;
  suggested: string;
  bump: "major" | "minor" | "patch";
  summary: string;
  counts: Record<string, number>;
};

const SEMVER_RE = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+([0-9A-Za-z.-]+))?$/;

export function parseSemver(v: string): { major: number; minor: number; patch: number } | null {
  const m = v.trim().match(SEMVER_RE);
  if (!m) return null;
  return { major: Number(m[1]), minor: Number(m[2]), patch: Number(m[3]) };
}

export function suggestSemverBump(
  currentVersion: string,
  commits: ParsedCommit[],
): SemverSuggestion | null {
  const parsed = parseSemver(currentVersion);
  if (!parsed) return null;

  const counts: Record<string, number> = {};
  let breaking = 0;
  for (const c of commits) {
    counts[c.type] = (counts[c.type] ?? 0) + 1;
    if (c.breaking) breaking += 1;
  }

  let bump: "major" | "minor" | "patch" = "patch";
  let summary = "";

  if (breaking > 0) {
    bump = "major";
    summary = `${breaking} breaking change(s) → major bump.`;
  } else if ((counts.feat ?? 0) > 0) {
    bump = "minor";
    summary = `Feature commit(s) present → minor bump.`;
  } else if (commits.length === 0) {
    bump = "patch";
    summary = "No conventional commits parsed; defaulting to patch (verify your paste).";
  } else {
    bump = "patch";
    summary = "No features or breaking changes detected → patch bump.";
  }

  let major = parsed.major;
  let minor = parsed.minor;
  let patch = parsed.patch;
  if (bump === "major") {
    major += 1;
    minor = 0;
    patch = 0;
  } else if (bump === "minor") {
    minor += 1;
    patch = 0;
  } else {
    patch += 1;
  }

  const suggested = `${major}.${minor}.${patch}`;
  return {
    current: currentVersion.trim(),
    suggested,
    bump,
    summary,
    counts,
  };
}
