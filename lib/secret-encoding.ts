import { base32ToBytes } from "./totp";

const B32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

/** UTF-8 text → uppercase base32 without padding. */
export function textToBase32(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let bits = 0;
  let value = 0;
  let out = "";
  for (let i = 0; i < bytes.length; i++) {
    value = (value << 8) | bytes[i];
    bits += 8;
    while (bits >= 5) {
      out += B32[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    out += B32[(value << (5 - bits)) & 31];
  }
  return out;
}

export function base32ToText(b32: string): string | null {
  const bytes = base32ToBytes(b32);
  if (!bytes) return null;
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return null;
  }
}

export function textToHex(text: string): string {
  const bytes = new TextEncoder().encode(text);
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function hexToText(hex: string): string | null {
  const clean = hex.replace(/\s/g, "");
  if (clean.length % 2 !== 0 || !/^[0-9a-fA-F]*$/.test(clean)) return null;
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return null;
  }
}
