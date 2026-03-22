export type PaletteColor = {
  role: string;
  hex: string;
  label?: string;
};

export type AppColorPalette = {
  name: string;
  summary?: string;
  colors: PaletteColor[];
};

export function normalizeHex(input: unknown): string | null {
  if (typeof input !== "string") return null;
  let h = input.trim();
  if (!h.startsWith("#")) h = `#${h}`;
  if (/^#[0-9a-fA-F]{3}$/.test(h)) {
    const r = h[1];
    const g = h[2];
    const b = h[3];
    h = `#${r}${r}${g}${g}${b}${b}`;
  }
  if (!/^#[0-9a-fA-F]{6}$/.test(h)) return null;
  return h.toUpperCase();
}

function strOpt(v: unknown): string | undefined {
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t || undefined;
}

/**
 * Expects model output: { palettes: [ { name, summary?, colors: [ { role, hex, label? } ] } ] }
 * Returns exactly three palettes with at least three valid colors each, or null.
 */
export function parsePalettesFromJson(data: unknown): AppColorPalette[] | null {
  if (!data || typeof data !== "object") return null;
  const rawList = (data as { palettes?: unknown }).palettes;
  if (!Array.isArray(rawList) || rawList.length === 0) return null;

  const out: AppColorPalette[] = [];
  for (const item of rawList) {
    if (out.length >= 3) break;
    if (!item || typeof item !== "object") continue;
    const name = strOpt((item as { name?: unknown }).name) ?? "Palette";
    const summary = strOpt((item as { summary?: unknown }).summary);
    const colorsRaw = (item as { colors?: unknown }).colors;
    if (!Array.isArray(colorsRaw)) continue;

    const colors: PaletteColor[] = [];
    for (const c of colorsRaw) {
      if (!c || typeof c !== "object") continue;
      const hex = normalizeHex((c as { hex?: unknown }).hex);
      if (!hex) continue;
      const role = strOpt((c as { role?: unknown }).role) ?? "swatch";
      const label = strOpt((c as { label?: unknown }).label);
      colors.push(label ? { role, hex, label } : { role, hex });
    }
    if (colors.length >= 3) {
      out.push(summary ? { name, summary, colors } : { name, colors });
    }
  }

  return out.length === 3 ? out : null;
}

export function contrastForeground(hex: string): "#0f172a" | "#f8fafc" {
  const n = Number.parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? "#0f172a" : "#f8fafc";
}
