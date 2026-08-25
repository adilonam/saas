export type DnaOrigin = {
  country: string;
  countryCode: string;
  percentage: number;
};

const MAX_ORIGINS = 6;

function clampInt(n: unknown, fallback = 0): number {
  const v = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(v)) return fallback;
  return Math.max(0, Math.min(100, Math.round(v)));
}

function normalizeCountryCode(raw: unknown): string {
  const s = String(raw ?? "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z]/g, "");
  return s.length === 2 ? s : "";
}

/**
 * Parse and normalize AI ancestry origins: max 6, integer %, sum ≈ 100.
 */
export function normalizeOrigins(raw: unknown): DnaOrigin[] {
  if (!Array.isArray(raw)) return [];

  const cleaned: DnaOrigin[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const country = String(row.country ?? "").trim();
    const countryCode = normalizeCountryCode(row.countryCode ?? row.code);
    const percentage = clampInt(row.percentage ?? row.percent);
    if (!country || !countryCode || percentage <= 0) continue;
    cleaned.push({ country, countryCode, percentage });
    if (cleaned.length >= MAX_ORIGINS) break;
  }

  if (cleaned.length === 0) return [];

  const total = cleaned.reduce((s, o) => s + o.percentage, 0);
  if (total <= 0) return [];

  // Scale to sum ~100, then fix rounding drift on the largest share.
  const scaled = cleaned.map((o) => ({
    ...o,
    percentage: Math.max(1, Math.round((o.percentage / total) * 100)),
  }));

  let sum = scaled.reduce((s, o) => s + o.percentage, 0);
  if (sum !== 100) {
    const idx = scaled.reduce(
      (best, o, i, arr) => (o.percentage > arr[best].percentage ? i : best),
      0,
    );
    scaled[idx] = {
      ...scaled[idx],
      percentage: Math.max(1, scaled[idx].percentage + (100 - sum)),
    };
  }

  return scaled.sort((a, b) => b.percentage - a.percentage);
}
