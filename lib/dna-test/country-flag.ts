/**
 * Convert an ISO 3166-1 alpha-2 country code to a flag emoji.
 * Uses regional indicator symbols (e.g. "AR" → 🇦🇷).
 */
export function countryCodeToFlag(countryCode: string): string {
  const code = countryCode.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) {
    return "🏳️";
  }
  const A = 0x1f1e6;
  const base = "A".charCodeAt(0);
  return String.fromCodePoint(
    A + (code.charCodeAt(0) - base),
    A + (code.charCodeAt(1) - base),
  );
}
