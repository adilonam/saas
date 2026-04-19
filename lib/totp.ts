/** RFC 4648 base32 alphabet (no padding in secret typical for TOTP). */
const B32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function base32ToBytes(secret: string): Uint8Array | null {
  const s = secret.replace(/\s/g, "").toUpperCase().replace(/=+$/, "");
  if (!s) return null;
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (let i = 0; i < s.length; i++) {
    const idx = B32.indexOf(s[i]);
    if (idx === -1) return null;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return new Uint8Array(out);
}

function dynamicTruncate(hash: ArrayBuffer): number {
  const bytes = new Uint8Array(hash);
  const offset = bytes[bytes.length - 1] & 0x0f;
  return (
    ((bytes[offset] & 0x7f) << 24) |
    ((bytes[offset + 1] & 0xff) << 16) |
    ((bytes[offset + 2] & 0xff) << 8) |
    (bytes[offset + 3] & 0xff)
  );
}

export async function totpCodeAt(
  secretBytes: Uint8Array,
  epochMs: number,
  periodSec: number,
  digits: number,
): Promise<string> {
  const counter = Math.floor(epochMs / 1000 / periodSec);
  const buf = new ArrayBuffer(8);
  const view = new DataView(buf);
  const high = Math.floor(counter / 0x100000000);
  const low = counter >>> 0;
  view.setUint32(0, high, false);
  view.setUint32(4, low, false);

  const key = await crypto.subtle.importKey(
    "raw",
    secretBytes as BufferSource,
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, buf);
  const code = dynamicTruncate(sig) % 10 ** digits;
  return code.toString().padStart(digits, "0");
}

export function secondsIntoPeriod(epochMs: number, periodSec: number): number {
  return Math.floor(epochMs / 1000) % periodSec;
}
